import SwiftUI
import UIKit

// MARK: - Trace entry model

struct DebugTraceEntry: Identifiable {
    let id = UUID()
    let ts: Date
    let source: TraceSource
    let action: String
    let detail: String?
    let latencyMs: Int?
    let ok: Bool?

    enum TraceSource: String {
        case client, server, network, processing
    }

    var formattedTime: String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm:ss.SSS"
        return f.string(from: ts)
    }
}

// MARK: - Singleton trace log

@MainActor
final class DebugConsole: ObservableObject {
    static let shared = DebugConsole()

    @Published private(set) var entries: [DebugTraceEntry] = []
    @Published var isEnabled = false

    private let maxEntries = 500
    private let trimTo = 300

    private init() {}

    func trace(
        source: DebugTraceEntry.TraceSource = .client,
        action: String,
        detail: String? = nil,
        latencyMs: Int? = nil,
        ok: Bool? = nil
    ) {
        let entry = DebugTraceEntry(
            ts: Date(),
            source: source,
            action: action,
            detail: detail,
            latencyMs: latencyMs,
            ok: ok
        )
        entries.append(entry)
        if entries.count > maxEntries {
            entries = Array(entries.suffix(trimTo))
        }

        // Also print to Xcode console
        let icon = ok == false ? "❌" : source == .server ? "🔵" : source == .network ? "🌐" : source == .processing ? "⚙️" : "🟢"
        let latStr = latencyMs.map { " \($0)ms" } ?? ""
        let detStr = detail.map { " — \($0)" } ?? ""
        print("[\(source.rawValue)] \(icon) \(action)\(latStr)\(detStr)")
    }

    /// Convenience: trace an async operation with automatic latency + ok/error
    func traced<T>(
        source: DebugTraceEntry.TraceSource = .client,
        action: String,
        detail: String? = nil,
        _ work: () async throws -> T
    ) async rethrows -> T {
        trace(source: source, action: "\(action):start", detail: detail)
        let t0 = CFAbsoluteTimeGetCurrent()
        do {
            let result = try await work()
            let ms = Int((CFAbsoluteTimeGetCurrent() - t0) * 1000)
            trace(source: source, action: "\(action):ok", detail: detail, latencyMs: ms, ok: true)
            return result
        } catch {
            let ms = Int((CFAbsoluteTimeGetCurrent() - t0) * 1000)
            trace(source: source, action: "\(action):error", detail: error.localizedDescription.prefix(100).description, latencyMs: ms, ok: false)
            throw error
        }
    }

    func clear() {
        entries.removeAll()
    }
}

// MARK: - Debug console overlay view

struct DebugConsoleView: View {
    @ObservedObject private var console = DebugConsole.shared
    @State private var isExpanded = false
    @State private var filter: DebugTraceEntry.TraceSource?

    private var filteredEntries: [DebugTraceEntry] {
        let list = filter == nil ? console.entries : console.entries.filter { $0.source == filter }
        return list.suffix(200).reversed()
    }

    var body: some View {
        if !console.isEnabled { EmptyView() }
        else if !isExpanded { collapsedButton }
        else { expandedPanel }
    }

    // MARK: - Collapsed

    private var collapsedButton: some View {
        Button { isExpanded = true } label: {
            Text("Debug (\(console.entries.count))")
                .font(.system(size: 10, design: .monospaced))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.black.opacity(0.7))
                .foregroundStyle(.green)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(Color.green.opacity(0.6), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 6))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
        .padding(.leading, 8)
        .padding(.bottom, 8)
    }

    // MARK: - Expanded

    private var expandedPanel: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 0) {
                // Header
                HStack(spacing: 6) {
                    filterButton(nil, label: "All", color: .white)
                    filterButton(.client, label: "Client", color: .green)
                    filterButton(.network, label: "Net", color: .cyan)
                    filterButton(.processing, label: "Proc", color: .yellow)
                    filterButton(.server, label: "Server", color: .blue)

                    Spacer()

                    Text("\(filteredEntries.count)")
                        .font(.system(size: 9, design: .monospaced))
                        .foregroundStyle(.gray)

                    Button { console.clear() } label: {
                        Text("Clear")
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundStyle(.red)
                    }

                    Button { isExpanded = false } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 10))
                            .foregroundStyle(.white)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.black)

                Divider().background(Color.gray.opacity(0.3))

                // Log entries
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        if filteredEntries.isEmpty {
                            Text("No events yet")
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(.gray)
                                .frame(maxWidth: .infinity)
                                .padding()
                        }
                        ForEach(filteredEntries) { entry in
                            entryRow(entry)
                        }
                    }
                }
                .frame(maxHeight: UIScreen.main.bounds.height * 0.4)
                .background(Color.black.opacity(0.95))
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
            .padding(.horizontal, 4)
            .padding(.bottom, 4)
        }
    }

    // MARK: - Entry row

    private func entryRow(_ entry: DebugTraceEntry) -> some View {
        HStack(alignment: .top, spacing: 4) {
            Text(entry.formattedTime)
                .foregroundStyle(.gray.opacity(0.6))

            Text(entry.action)
                .foregroundStyle(colorFor(entry))
                .fontWeight(entry.ok == false ? .bold : .regular)

            if let ms = entry.latencyMs {
                Text("\(ms)ms")
                    .foregroundStyle(.gray.opacity(0.5))
            }

            if let detail = entry.detail {
                Text(detail)
                    .foregroundStyle(.gray.opacity(0.5))
                    .lineLimit(1)
            }
        }
        .font(.system(size: 9, design: .monospaced))
        .padding(.horizontal, 8)
        .padding(.vertical, 2)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            entry.ok == false
                ? Color.red.opacity(0.1)
                : Color.clear
        )
    }

    // MARK: - Helpers

    private func colorFor(_ entry: DebugTraceEntry) -> Color {
        if entry.ok == false { return .red }
        if entry.action.hasSuffix(":start") { return .yellow }
        switch entry.source {
        case .client: return .green
        case .server: return .blue
        case .network: return .cyan
        case .processing: return .orange
        }
    }

    private func filterButton(_ source: DebugTraceEntry.TraceSource?, label: String, color: Color) -> some View {
        Button {
            filter = source
        } label: {
            Text(label)
                .font(.system(size: 9, design: .monospaced))
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(filter == source ? color : Color.clear)
                .foregroundStyle(filter == source ? .black : color)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(color.opacity(0.6), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
}
