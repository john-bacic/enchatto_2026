import Foundation

/// Low-level HTTP client for calling Convex HTTP actions
class ConvexHTTPClient {
    let baseURL: URL

    init(deploymentURL: String) {
        // Convex HTTP actions are served at the deployment URL
        self.baseURL = URL(string: deploymentURL)!
    }

    func post<T: Decodable>(_ path: String, body: [String: Any]) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        // Retry once on transient errors (500, 503)
        var lastError: Error?
        for attempt in 0..<2 {
            if attempt > 0 {
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5s backoff
            }

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.networkError
            }

            if httpResponse.statusCode == 200 {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .millisecondsSince1970
                return try decoder.decode(T.self, from: data)
            }

            // Retry on transient server errors
            if httpResponse.statusCode >= 500 && attempt < 1 {
                lastError = APIError.serverError("HTTP \(httpResponse.statusCode)")
                continue
            }

            if let errorBody = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let message = errorBody["error"] as? String {
                throw APIError.serverError(message)
            }
            throw APIError.serverError("HTTP \(httpResponse.statusCode)")
        }

        throw lastError ?? APIError.networkError
    }

    func postVoid(_ path: String, body: [String: Any]) async throws {
        let _: EmptyResponse = try await post(path, body: body)
    }
}

private struct EmptyResponse: Decodable {
    // Accepts {"ok": true} or any JSON
}
