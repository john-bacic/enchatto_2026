import XCTest

// How known defects are recorded in this test target
// --------------------------------------------------
// Where the app's current output is wrong for a real sentence, the test states the CORRECT
// output with `XCTExpectDefect`, under a comment that starts with "DEFECT:".
//
// Every `XCTExpectDefect` call is an expected failure of its own (`XCTExpectFailure`). It passes
// while that one output is still wrong. As soon as that one output is right it fails the test,
// at its own line, with "this defect is fixed" — also when a fix covers only some of the
// sentences under a DEFECT comment, so a fixed sentence never stays unguarded inside a block
// that still fails for another reason. The fix is then finished by turning the call into a
// plain assertion:
//
//     XCTExpectDefect(casual("ありません"), shouldBe: "ない")
//     XCTAssertEqual(casual("ありません"), "ない")                         // after the fix
//
//     XCTExpectDefect(casual("学生ですが"), shouldBe: "学生だが", "学生だけど")
//     XCTAssertOneOf(casual("学生ですが"), ["学生だが", "学生だけど"])       // after the fix
//
//     grep -rn "DEFECT:" --include="*Tests.swift" apps/ios/Tests      lists every known defect

/// For outputs where more than one answer would be correct Japanese (or correct romaji).
func XCTAssertOneOf(
    _ value: String,
    _ accepted: [String],
    file: StaticString = #filePath,
    line: UInt = #line
) {
    XCTAssertTrue(
        accepted.contains(value),
        "\"\(value)\" is not one of \(accepted)",
        file: file,
        line: line
    )
}

/// A known defect: `actual` is what the app produces today, `correct` lists every output that
/// would be right. Passes (as an expected failure) while `actual` is none of them.
func XCTExpectDefect(
    _ actual: String,
    shouldBe correct: String...,
    file: StaticString = #filePath,
    line: UInt = #line
) {
    if correct.contains(actual) {
        XCTFail(
            "This defect is fixed: the output is now \"\(actual)\". Replace XCTExpectDefect on "
                + "this line with XCTAssertEqual (or XCTAssertOneOf).",
            file: file,
            line: line
        )
    } else {
        let wanted = correct.count == 1 ? "\"\(correct[0])\"" : "one of \(correct)"
        recordKnownDefect("\"\(actual)\" should be \(wanted)", file: file, line: line)
    }
}

/// A known defect that is not one expected string: `isFixed` is the property that will hold
/// once the product code is right, `stillWrong` says what is wrong today.
func XCTExpectDefect(
    fixedWhen isFixed: Bool,
    _ stillWrong: String,
    file: StaticString = #filePath,
    line: UInt = #line
) {
    if isFixed {
        XCTFail(
            "This defect is fixed: replace XCTExpectDefect on this line with XCTAssertTrue. "
                + "(It used to say: \(stillWrong))",
            file: file,
            line: line
        )
    } else {
        recordKnownDefect(stillWrong, file: file, line: line)
    }
}

private func recordKnownDefect(_ message: String, file: StaticString, line: UInt) {
    XCTExpectFailure("known defect, see the DEFECT comment above the call") {
        XCTFail(message, file: file, line: line)
    }
}

/// Collects mismatches from concurrently running closures. Each distinct mismatch is kept
/// once, so a failure message stays readable after hundreds of iterations.
final class MismatchLog {
    private let lock = NSLock()
    private var entries: Set<String> = []

    func add(_ entry: String) {
        lock.lock()
        entries.insert(entry)
        lock.unlock()
    }

    var all: [String] {
        lock.lock()
        defer { lock.unlock() }
        return entries.sorted()
    }
}
