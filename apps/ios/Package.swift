// swift-tools-version:5.7
//
// Unit tests for the app's Japanese text code, run from the command line:
//
//     cd apps/ios && swift test
//
// This package is NOT how the app is built: Enchatto.xcodeproj is. It compiles a few
// of the app's source files in place (the ones that depend on nothing but Foundation,
// NaturalLanguage and MeCab) so that they can be tested on macOS without a simulator
// and without a test target in the Xcode project.
//
// To make another file testable it must build on macOS on its own: no UIKit, no
// SwiftUI views, no view models, no other app types. Then add it to `sources` below.
//
// XcodeGen: project.yml takes every file under apps/ios as app source. Before the
// Xcode project is regenerated from it, its `excludes` list must name Package.swift,
// Package.resolved, Tests, .build and .gitignore, or this manifest and the tests are
// compiled into the app ("No such module 'PackageDescription'" / 'XCTest').

import PackageDescription

let package = Package(
    name: "EnchattoText",
    // NaturalLanguage needs 10.14; `URLSession.data(from:)` needs 12.
    platforms: [.macOS(.v12)],
    dependencies: [
        // The app's own dependency. project.yml and the Xcode project ask for 0.8.0 up to
        // the next major; this pins the version the app resolves today (Package.resolved
        // in Enchatto.xcodeproj). Move both together.
        .package(url: "https://github.com/shinjukunian/Mecab-Swift", exact: "0.8.0"),
    ],
    targets: [
        .target(
            name: "EnchattoText",
            dependencies: [
                .product(name: "Mecab-Swift", package: "Mecab-Swift"),
                .product(name: "IPADic", package: "Mecab-Swift"),
            ],
            path: "Services/Processing",
            // Not compiled here. MessageProcessor needs the app's models (RoomSettings,
            // ProcessingState); the rest are stubs and protocols with nothing to test.
            // Listed only so that SwiftPM does not warn about unhandled files.
            exclude: [
                "MessageProcessor.swift",
                "StubRomajiService.swift",
                "StubSuggestionService.swift",
                "StubTranslationService.swift",
                "SuggestionService.swift",
            ],
            sources: [
                "MeCabCasualizer.swift",
                "MeCabRomajiService.swift",
                "RomajiService.swift",
                "MyMemoryTranslationService.swift",
                "TranslationService.swift",
            ]
        ),
        .testTarget(
            name: "EnchattoTextTests",
            dependencies: ["EnchattoText"],
            path: "Tests/EnchattoTextTests"
        ),
    ],
    // The app builds with SWIFT_VERSION 5.9; keep the Swift 5 language mode.
    swiftLanguageVersions: [.v5]
)
