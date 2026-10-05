#!/usr/bin/env python3
"""Proves that a split HostConversationView is the base file moved around, and nothing else.

`--stages` names what the folder under test holds: `types` for the eight type files and the
main file, `all` for the full split, or any comma list of types, Sheets, Header, MessageList,
Input, Presentations. It exits 0 only when all of these hold (blank lines are left out of every
comparison):

  table       tables.json and widen.json fit the base file (ranges are whole declarations and do
              not overlap, no stored property is in a moved range, every listed declaration is
              the line it is said to be)
  files       the folder holds HostConversationView.swift and, in Conversation/, exactly the
              files of the stages
  (a) lines   across the files there are exactly the non-blank lines of the base file, the same
              number of times each, plus the listed added lines: each new file's imports and one
              `extension HostConversationView {` and closing brace per group. Only the
              declarations widen.json lists for the stages differ, each by the one word
              `private` (12 for types, 82 for all); a listed one that keeps the word fails too
  (b) stored  each of the 55 stored properties of the main view is declared once, directly in
              the struct in the main file, and no extension holds a stored property
  (c) order   every file's non-blank lines are the expected ones in the expected order: each
              range unbroken and in base order, the ranges as tables.json lists them
  (d) blocks  the modifiers on `body` (base lines 162-221) and the whole of `inputView`
              (1384-1694) are each one unbroken run of lines in one file

What it does not prove: that the files compile (whether 82 is enough is the compiler's verdict,
and a struct that became internal must still have an initialiser its users can reach), that the
new files are in the Xcode project, that each file's imports are enough, or that the screen
behaves the same. The build and a hands-on pass prove those.

Input:  <base file>: apps/ios/Views/HostConversationView.swift at commit 1b68a6f, sha256
        16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83 (any other file: exit 2).
        It is the file from before any stage, also when the folder under test is a later state
        of the tree. <Views folder>: a folder laid out like apps/ios/Views, holding
        HostConversationView.swift and Conversation/; other files in it are ignored, other
        .swift files in Conversation/ are not. Nothing is written.
Exit:   0 every check passed, 1 a check failed, 2 refused.

Run:
  python3 scripts/step6/ios/conversation-view/verify.py --stages types <base HostConversationView.swift> <Views folder>
  python3 scripts/step6/ios/conversation-view/verify.py --stages all   <base HostConversationView.swift> <Views folder>
"""
import os
import sys

sys.dont_write_bytecode = True

from cv_table import Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402
import cv_checks  # noqa: E402


def main():
    arguments = sys.argv[1:]
    if len(arguments) != 4 or arguments[0] != "--stages":
        sys.stderr.write("usage: verify.py --stages <all | comma list> <base HostConversationView.swift> <Views folder>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    table = Table()
    stages = table.parse_stages(arguments[1])
    base_path, folder = arguments[2], arguments[3]
    if not os.path.isdir(folder):
        swiftmove.refuse("%s is not a folder" % folder)
    base = swiftmove.read_base(base_path, table.base)
    files = {path: swiftmove.read_lines(os.path.join(folder, path))
             for path in table.files(stages) if os.path.isfile(os.path.join(folder, path))}
    print("stages %s: %s against %s (%s)" % (",".join(stages), folder, table.base["path"], table.base["commit"]))
    cv_checks.run(base, table, stages, files, folder)


if __name__ == "__main__":
    main()
