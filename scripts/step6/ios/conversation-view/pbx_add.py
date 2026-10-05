#!/usr/bin/env python3
"""Adds new source files to a project.pbxproj by inserting lines only, without regenerating it.

The lines to insert are the ones XcodeGen itself writes for the new files, taken from two
generated projects: one made before the files exist and one made after. Every line the second
has and the first lacks is inserted into the target project at the corresponding place, found
by aligning the first generated project with the target line by line. Nothing in the target is
removed, changed or reordered, so edits the target carries that a regeneration would undo stay
as they are; the result is checked for exactly that before it is written. The ids are XcodeGen's
own, so a later regeneration does not change the inserted lines.

Input:  <generated before>  project.pbxproj from XcodeGen run on a copy of apps/ios without the
                            new files
        <generated after>   the same with the new files in place
        <target>            the project.pbxproj to add them to (a copy of the tree's file)
        XcodeGen derives object ids from the folder name: each copy of apps/ios it runs on must
        be a folder called `ios`. The two generated projects may differ only by added lines;
        anything else is refused (exit 2).
Output: <output file>, outside the repository. Copy it over the tree's project file after
        checking it.

Run:
  python3 scripts/step6/ios/conversation-view/pbx_add.py <generated before> <generated after> <target> <output file>
  plutil -lint <output file>
  python3 scripts/step6/ios/pbx_insert_only.py <target> <output file>
`plutil -lint` also passes on a project whose new group sits inside the wrong group: the build is
the proof that the files are where the project says they are.
"""
import difflib
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import swiftmove  # noqa: E402


def read(path):
    try:
        with open(path, encoding="utf-8") as handle:
            return handle.read().split("\n")
    except OSError as error:
        swiftmove.refuse("cannot read %s: %s" % (path, error))


def main():
    if len(sys.argv) != 5 or sys.argv[1].startswith("-"):
        sys.stderr.write("usage: pbx_add.py <generated before> <generated after> <target project.pbxproj> <output file>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    before, after, target = [read(path) for path in sys.argv[1:4]]
    out_path = os.path.join(swiftmove.output_dir(os.path.dirname(os.path.abspath(sys.argv[4]))),
                            os.path.basename(sys.argv[4]))

    in_target = {}                                  # line index of `before` -> its index in the target
    for a, b, size in difflib.SequenceMatcher(None, before, target, autojunk=False).get_matching_blocks():
        for offset in range(size):
            in_target[a + offset] = b + offset
    inserts = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, before, after, autojunk=False).get_opcodes():
        if tag == "equal":
            continue
        if tag != "insert":
            swiftmove.refuse("the two generated projects differ by more than added lines (%s at line %d): %s"
                             % (tag, i1 + 1, " | ".join(line.strip() for line in before[i1:i2][:3])))
        anchor = i1 - 1
        while anchor >= 0 and anchor not in in_target:
            anchor -= 1                             # a line of `before` the target does not have
        if anchor < 0:
            swiftmove.refuse("no line above line %d of the generated project exists in the target" % (i1 + 1))
        inserts.append((in_target[anchor] + 1, after[j1:j2]))
    out = list(target)
    for at, lines in sorted(inserts, reverse=True):
        out[at:at] = lines

    remaining = iter(out)
    if not all(line in remaining for line in target):
        swiftmove.refuse("the result is not the target with lines inserted")
    with open(out_path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(out))
    print("lines inserted: %d, in %d places; nothing removed or reordered" % (sum(len(lines) for _, lines in inserts), len(inserts)))
    print("wrote " + out_path)


if __name__ == "__main__":
    main()
