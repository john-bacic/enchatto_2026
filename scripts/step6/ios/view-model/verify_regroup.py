#!/usr/bin/env python3
"""Proves that a regrouped HostRoomViewModel.swift is the base file reordered, and nothing else.

It exits 0 only when all of these hold (blank lines are left out of every comparison):

  table       groups.json fits the base file: no range overlaps another, each is a whole number
              of members of the class, and no stored property lies in a moved range
  (a) lines   the regrouped file has exactly the non-blank lines of the base file, the same number
              of times each, plus 30 listed added lines: ten `// MARK: - <group>` comments, ten
              `extension HostRoomViewModel {` openers and their ten closing braces
  (b) stored  each of the 72 stored properties is declared once, directly in the class body, and
              none of the ten extension blocks holds a stored property (found two ways: by the
              list in members.json and by reading the regrouped file's own structure)
  (c) order   after the class body, whose lines are in base order, come the ten groups in table
              order; inside a group each of its ranges is unbroken, in its base order, and the
              ranges follow each other in the order groups.json lists them

Together (b) and (c) also mean the stored properties keep their declaration order, which is the
order their initial values are set in: all of them are kept lines, and kept lines stay in base
order.

What it does not prove: that the result compiles or behaves the same; a build and a run prove
that. Blank lines can differ from what regroup.py writes; to pin the bytes as well, compare the
file with regroup.py's output using compare_files.py.

Input:  <base file>: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f, sha256
        c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04 (any other file: exit 2);
        <regrouped file>: the file under test, wherever it is. Nothing is written.
Exit:   0 every check passed, 1 a check failed, 2 refused.

Run:
  python3 scripts/step6/ios/view-model/verify_regroup.py <base HostRoomViewModel.swift> <regrouped HostRoomViewModel.swift>
"""
import sys

sys.dont_write_bytecode = True

from vm_table import Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402
import vm_checks  # noqa: E402


def main():
    if len(sys.argv) != 3 or sys.argv[1].startswith("-"):
        sys.stderr.write("usage: verify_regroup.py <base HostRoomViewModel.swift> <regrouped HostRoomViewModel.swift>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    table = Table()
    base = swiftmove.read_base(sys.argv[1], table.base)
    files = {table.main_file(): swiftmove.read_lines(sys.argv[2])}
    print("stage regroup: %s against %s (%s)" % (sys.argv[2], table.base["path"], table.base["commit"]))
    vm_checks.run(base, table, "regroup", files)


if __name__ == "__main__":
    main()
