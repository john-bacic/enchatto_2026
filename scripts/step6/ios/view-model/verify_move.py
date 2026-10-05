#!/usr/bin/env python3
"""Proves that a folder of HostRoomViewModel files is the base file split up, and nothing else.

`--stage games` checks the six files split_batch1.py writes (the five game groups as files, the
five core groups still extension blocks in the main file); `--stage all` checks the eleven files
split.py writes. It exits 0 only when all of these hold (blank lines are left out of every
comparison):

  table       groups.json and widen.json fit the base file: no range overlaps another, each is a
              whole number of members of the class, no stored property lies in a moved range, and
              every listed declaration has the access word it is said to lose
  files       the folder holds exactly the stage's files and no other HostRoomViewModel+*.swift
  (a) lines   across the files there are exactly the non-blank lines of the base file, the same
              number of times each, plus the listed added lines: per group one extension opener
              and its closing brace, the imports of a group that is a file, the MARK comment of a
              group still in the main file. The declarations widen.json lists for the stage
              (20 for games, 51 for all) count without `private` or `private(set)`; no other
              line may differ, and a listed one may not keep its word
  (b) stored  each of the 72 stored properties is declared once, directly in the class body of
              the main file, and no extension block in any file holds a stored property
  (c) order   every file's non-blank lines are the expected ones in the expected order: the main
              file's kept lines in base order; in each group its ranges unbroken, in base order,
              one after another as groups.json lists them

What it does not prove: that the files compile (the widen list is derived by a text search, and a
missing entry is a build error, not a failed check here), that the new files are in the Xcode
project, or that the imports listed for each file are enough. The build proves those.

Input:  <base file>: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f, sha256
        c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04 (any other file: exit 2).
        It is the file from before any regroup or split, also when the folder under test is a
        later state of the tree. <folder>: where the HostRoomViewModel*.swift files under test
        are; other files in it are ignored. Nothing is written.
Exit:   0 every check passed, 1 a check failed, 2 refused.

Run:
  python3 scripts/step6/ios/view-model/verify_move.py --stage games <base HostRoomViewModel.swift> <folder>
  python3 scripts/step6/ios/view-model/verify_move.py --stage all   <base HostRoomViewModel.swift> <folder>
"""
import os
import sys

sys.dont_write_bytecode = True

from vm_table import Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402
import vm_checks  # noqa: E402


def main():
    arguments = sys.argv[1:]
    if len(arguments) != 4 or arguments[0] != "--stage" or arguments[1] not in ("games", "all"):
        sys.stderr.write("usage: verify_move.py --stage games|all <base HostRoomViewModel.swift> <folder>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    stage, base_path, folder = arguments[1], arguments[2], arguments[3]
    if not os.path.isdir(folder):
        swiftmove.refuse("%s is not a folder" % folder)
    table = Table()
    base = swiftmove.read_base(base_path, table.base)
    expected = [table.main_file()] + [table.group_file(name) for name in table.groups_out(stage)]
    files = {name: swiftmove.read_lines(os.path.join(folder, name))
             for name in expected if os.path.isfile(os.path.join(folder, name))}
    print("stage %s: %s against %s (%s)" % (stage, folder, table.base["path"], table.base["commit"]))
    vm_checks.run(base, table, stage, files, folder=folder)


if __name__ == "__main__":
    main()
