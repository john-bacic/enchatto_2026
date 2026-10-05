#!/usr/bin/env python3
"""Checks that files in the tree are byte for byte the files a tool wrote into a scratch folder.

The verifiers in this folder leave blank lines out, and they are run on scratch output. This
closes both gaps: after the output is copied in, every file under <generated folder> must exist
under <tree folder> at the same relative path with the same bytes. Files the tree folder has
beyond those are not looked at, unless they are named with --absent, which requires that the
tree does not have them.

Uses:
  the tree's HostRoomViewModel.swift is what regroup.py writes from the base file
      compare_files.py <scratch>/regroup apps/ios/ViewModels
  the type files already in the tree are what the full split writes again
      compare_files.py <scratch>/all/Conversation apps/ios/Views/Conversation
  a whole stage as copied in
      compare_files.py <scratch>/all apps/ios/Views

Input:  two folders, wherever they are. Nothing is written.
Exit:   0 every generated file is in the tree unchanged (and no --absent file exists),
        1 otherwise, 2 a folder is missing or the generated folder is empty.

Run:
  python3 scripts/step6/ios/compare_files.py <generated folder> <tree folder> [--absent <relative path> ...]
"""
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import swiftmove  # noqa: E402


def main():
    arguments = sys.argv[1:]
    absent = []
    if "--absent" in arguments:
        at = arguments.index("--absent")
        arguments, absent = arguments[:at], arguments[at + 1:]
    if len(arguments) != 2 or arguments[0].startswith("-"):
        sys.stderr.write("usage: compare_files.py <generated folder> <tree folder> [--absent <relative path> ...]\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    generated, tree = arguments
    for folder in (generated, tree):
        if not os.path.isdir(folder):
            swiftmove.refuse("%s is not a folder" % folder)
    names = sorted(os.path.relpath(os.path.join(folder, name), generated)
                   for folder, _, files in os.walk(generated) for name in files)
    if not names:
        swiftmove.refuse("%s holds no file" % generated)
    different = 0
    for name in names:
        other = os.path.join(tree, name)
        if not os.path.isfile(other):
            verdict = "MISSING in the tree"
        else:
            with open(os.path.join(generated, name), "rb") as one, open(other, "rb") as two:
                verdict = "same" if one.read() == two.read() else "DIFFERENT"
        different += verdict != "same"
        print("%-20s %s" % (verdict, name))
    for name in absent:
        if os.path.exists(os.path.join(tree, name)):
            different += 1
            print("%-20s %s" % ("PRESENT in the tree", name))
        else:
            print("%-20s %s" % ("absent", name))
    if different:
        print("FAILED: %d of %d file(s) are not as generated" % (different, len(names) + len(absent)))
        sys.exit(swiftmove.EXIT_FAILED)
    print("ok: %d file(s) byte for byte as generated" % len(names))
    sys.exit(swiftmove.EXIT_OK)


if __name__ == "__main__":
    main()
