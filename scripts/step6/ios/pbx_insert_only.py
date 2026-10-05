#!/usr/bin/env python3
"""Checks that one project.pbxproj is another with lines inserted, and nothing else.

Every line of <before> must appear in <after>, in the same order; what <after> has beyond that
is listed as inserted. A removed, changed or reordered line fails the check.

<before> is a copy of the project file saved just before the edit under test, not the file at
HEAD: the working tree's project can already differ from HEAD by edits that are not part of it.

Input:  two project.pbxproj files, wherever they are. Nothing is written.
Exit:   0 insertions only (the number of inserted lines is printed), 1 otherwise, 2 unreadable.

Run:
  python3 scripts/step6/ios/pbx_insert_only.py <before project.pbxproj> <after project.pbxproj>
  python3 scripts/step6/ios/pbx_insert_only.py --show <before> <after>     also prints each inserted line
"""
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import swiftmove  # noqa: E402


def main():
    arguments = sys.argv[1:]
    show = arguments[:1] == ["--show"]
    if show:
        arguments = arguments[1:]
    if len(arguments) != 2 or arguments[0].startswith("-"):
        sys.stderr.write("usage: pbx_insert_only.py [--show] <before project.pbxproj> <after project.pbxproj>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    before, after = swiftmove.read_lines(arguments[0]), swiftmove.read_lines(arguments[1])
    inserted = []
    position = 0
    for number, line in enumerate(after, 1):
        if position < len(before) and line == before[position]:
            position += 1
        else:
            inserted.append((number, line))
    if position != len(before):
        print("FAILED: line %d of %s is missing from %s, changed, or out of order:" % (position + 1, arguments[0], arguments[1]))
        print("  " + before[position].strip())
        sys.exit(swiftmove.EXIT_FAILED)
    if show:
        for number, line in inserted:
            print("%5d + %s" % (number, line.strip()))
    print("ok: insertions only, %d line(s) inserted, %d line(s) of the original all present in order"
          % (len(inserted), len(before)))
    sys.exit(swiftmove.EXIT_OK)


if __name__ == "__main__":
    main()
