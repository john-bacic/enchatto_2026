import Foundation

/// Low-level HTTP client for calling Convex HTTP actions
class ConvexHTTPClient {
    let baseURL: URL

    /// Seconds a request may go without hearing from the server
    static let defaultTimeout: TimeInterval = 10
    /// For calls that upload a body or wait on a model
    static let longTimeout: TimeInterval = 60

    /// One session for every client (AppConfig.makeAPI() builds a client per view model).
    /// Every request sets its own timeout; the configuration value is only the ceiling.
    static let session: URLSession = {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = longTimeout
        configuration.waitsForConnectivity = false
        return URLSession(configuration: configuration)
    }()

    /// Who this device acts as: the host's participant id and, for a room this build created, the token it registered
    /// there. Static like the session, because the start screen's client learns it and the room's client sends it.
    /// Requests read it off the main actor, hence the lock
    private static let callerLock = NSLock()
    private static var lockedCaller: (id: String, token: String?)?
    static var caller: (id: String, token: String?)? {
        get {
            callerLock.lock()
            defer { callerLock.unlock() }
            return lockedCaller
        }
        set {
            callerLock.lock()
            defer { callerLock.unlock() }
            lockedCaller = newValue
        }
    }

    /// 32 random bytes as 64 hex characters, from the system's cryptographic generator (what UInt8.random draws on)
    static func makeToken() -> String {
        (0..<32).map { _ in String(format: "%02x", UInt8.random(in: .min ... .max)) }.joined()
    }

    /// `body` with the caller added. Every route reads only the fields it knows, so a server without tokens ignores
    /// them. The token goes as "callerToken", never "token": /api/rooms/push-token already calls the APNs device
    /// token that. A field the body already has is kept
    private static func withCaller(_ body: [String: Any]) -> [String: Any] {
        guard let caller = ConvexHTTPClient.caller else { return body }
        var body = body
        if body["callerId"] == nil { body["callerId"] = caller.id }
        if let token = caller.token, body["callerToken"] == nil { body["callerToken"] = token }
        return body
    }

    init(deploymentURL: String) {
        // Convex HTTP actions are served at the deployment URL
        self.baseURL = URL(string: deploymentURL)!
    }

    /// `retriesOn5xx`: how many times a 5xx answer is quietly repeated. Only for a route where a second copy of the
    /// request does no harm on the server and nothing else would repeat it (a reaction, closing the room).
    func post<T: Decodable>(_ path: String, body: [String: Any], timeout: TimeInterval = ConvexHTTPClient.defaultTimeout, retriesOn5xx: Int = 0) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ConvexHTTPClient.withCaller(body))
        request.timeoutInterval = timeout

        // No retry unless the caller asked for one: polls come round again, sends are retried by the offline queue
        // with their idempotency key, and other mutations must not be repeated blindly. A transport error is never
        // repeated here, since the request may have arrived
        var retriesLeft = retriesOn5xx
        while true {
            #if DEBUG
            ConvexHTTPClient.countRequest()
            #endif
            let (data, response) = try await ConvexHTTPClient.session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.networkError
            }

            if retriesLeft > 0, (500...599).contains(httpResponse.statusCode) {
                retriesLeft -= 1
                try await Task.sleep(nanoseconds: 500_000_000)
                continue
            }

            guard httpResponse.statusCode == 200 else {
                var message = "HTTP \(httpResponse.statusCode)"
                if let errorBody = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let serverMessage = errorBody["error"] as? String {
                    message = serverMessage
                }
                throw APIError.http(status: httpResponse.statusCode, message: message)
            }

            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .millisecondsSince1970
            return try decoder.decode(T.self, from: data)
        }
    }

    func postVoid(_ path: String, body: [String: Any], timeout: TimeInterval = ConvexHTTPClient.defaultTimeout, retriesOn5xx: Int = 0) async throws {
        let _: EmptyResponse = try await post(path, body: body, timeout: timeout, retriesOn5xx: retriesOn5xx)
    }
}

private struct EmptyResponse: Decodable {
    // Accepts {"ok": true} or any JSON
}

#if DEBUG
/// Counts the requests one task sends, for the line each refresh writes to the debug console. A count is kept
/// for the task that started it and for no other: the tasks a refresh starts on its way (a game's fast poll, a
/// write) are tasks of their own, and what they send is not counted as the refresh's
extension ConvexHTTPClient {
    private static let countLock = NSLock()
    private static var requestCounts: [Int: Int] = [:]
    /// Tells the running task from every other task that is alive
    private static var runningTask: Int? {
        withUnsafeCurrentTask { $0?.hashValue }
    }

    /// Counts the requests the running task sends from here on
    static func startRequestCount() {
        guard let task = runningTask else { return }
        countLock.lock()
        defer { countLock.unlock() }
        requestCounts[task] = 0
    }

    /// Ends the running task's count and gives it
    static func endRequestCount() -> Int {
        guard let task = runningTask else { return 0 }
        countLock.lock()
        defer { countLock.unlock() }
        return requestCounts.removeValue(forKey: task) ?? 0
    }

    fileprivate static func countRequest() {
        guard let task = runningTask else { return }
        countLock.lock()
        defer { countLock.unlock() }
        if let count = requestCounts[task] { requestCounts[task] = count + 1 }
    }
}
#endif

extension Error {
    /// The task was cancelled (view went away, app backgrounded). Nothing failed: never retried on its account, never shown.
    var isCancellation: Bool {
        if self is CancellationError { return true }
        return (self as? URLError)?.code == .cancelled
    }

    /// Trying again later may succeed and the user need not be told.
    var isRetryableNetworkFailure: Bool {
        if isCancellation { return false }
        if let apiError = self as? APIError {
            switch apiError {
            case .networkError: return true
            case .http(let status, _): return status == 408 || status == 425 || status == 429 || (500...599).contains(status)
            case .roomNotFound, .serverError: return false
            }
        }
        if let urlError = self as? URLError {
            switch urlError.code {
            case .timedOut, .cannotFindHost, .cannotConnectToHost, .dnsLookupFailed, .networkConnectionLost,
                 .notConnectedToInternet, .secureConnectionFailed, .internationalRoamingOff, .callIsActive,
                 .dataNotAllowed, .badServerResponse:
                return true
            default:
                return false
            }
        }
        // URLSession sometimes reports a dropped socket as a bare POSIX error (ECONNABORTED after resume)
        return (self as NSError).domain == NSPOSIXErrorDomain
    }

    /// The server itself answered that it will not take this request, however often it is repeated (a 4xx other than
    /// the "try later" ones). Unlike `!isRetryableNetworkFailure`, an error that never reached the server (a
    /// certificate the phone does not trust, a reply that is not the server's) is not a refusal.
    var isServerRefusal: Bool {
        guard let apiError = self as? APIError, case .http(let status, _) = apiError else { return false }
        return (400...499).contains(status) && ![408, 425, 429].contains(status)
    }
}
