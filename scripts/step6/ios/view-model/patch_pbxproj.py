#!/usr/bin/env python3
"""Adds Swift files of the ViewModels group to a project.pbxproj: four lines per file.

The lines are the ones XcodeGen writes for those files (a build file, a file reference, a group
child and a Sources entry), copied from a generated project by file name prefix, so a later
regeneration changes none of them. Each goes into its section of the target in sorted position.

To place them, the four sections it touches (PBXBuildFile, PBXFileReference, the ViewModels
group's children, the Sources phase) are sorted again, by id or by name as XcodeGen sorts them.
On a target whose sections are already in that order this moves nothing, and the result is the
target with lines inserted. If the sort would move or drop any existing line, the tool refuses
(exit 2) and writes nothing: use conversation-view/pbx_add.py for such a target, which inserts
by position and never sorts.

Input:  <generated>  project.pbxproj from XcodeGen run on a copy of apps/ios that has the new
                     files (the copy must be a folder called `ios`: the ids depend on it)
        <target>     the project.pbxproj to add them to (a copy of the tree's file)
        <prefix>     what the new files' names start with, for example `HostRoomViewModel+`
Output: <output file>, outside the repository. Copy it over the tree's project file after
        checking it.

Run:
  python3 scripts/step6/ios/view-model/patch_pbxproj.py <generated> <target> 'HostRoomViewModel+' <output file>
  plutil -lint <output file>
  python3 scripts/step6/ios/pbx_insert_only.py <target> <output file>
The build is the proof that the project lists the files where they are.
"""
import os
import re
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


def find(lines, test, start=0, what=""):
    for i in range(start, len(lines)):
        if test(lines[i]):
            return i
    swiftmove.refuse("the target has no %s" % what)


def insert_sorted(lines, first, last, new, key):
    """The lines with `new` added between lines `first` and `last` and that stretch sorted by `key`."""
    body = lines[first + 1:last] + new
    body.sort(key=key)
    return lines[:first + 1] + body + lines[last:]


def main():
    if len(sys.argv) != 5 or sys.argv[1].startswith("-"):
        sys.stderr.write("usage: patch_pbxproj.py <generated project.pbxproj> <target project.pbxproj> <name prefix> <output file>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    generated, target = read(sys.argv[1]), read(sys.argv[2])
    prefix = sys.argv[3]
    out_path = os.path.join(swiftmove.output_dir(os.path.dirname(os.path.abspath(sys.argv[4]))),
                            os.path.basename(sys.argv[4]))

    wanted = [line for line in generated if prefix in line]
    already = [line for line in wanted if line in target]
    if already:
        swiftmove.refuse("the target already has %d of these lines, for example: %s" % (len(already), already[0].strip()))
    build_files = [line for line in wanted if "isa = PBXBuildFile" in line]
    references = [line for line in wanted if "isa = PBXFileReference" in line]
    rest = [line for line in wanted if line not in build_files and line not in references]
    sources = [line for line in rest if "in Sources */," in line]
    children = [line for line in rest if line not in sources]
    if not wanted or not (len(build_files) == len(references) == len(sources) == len(children)):
        swiftmove.refuse("the generated project does not have four lines per file for the prefix %r: "
                         "%d build files, %d references, %d Sources entries, %d group children"
                         % (prefix, len(build_files), len(references), len(sources), len(children)))

    def by_id(line):
        return line.strip().split(" ")[0]

    def by_name(line):
        return re.search(r'/\* (.*?) \*/', line).group(1).lower()

    out = list(target)
    for begin, end, new in (("/* Begin PBXBuildFile section */", "/* End PBXBuildFile section */", build_files),
                            ("/* Begin PBXFileReference section */", "/* End PBXFileReference section */", references)):
        first = find(out, lambda line: begin in line, what=begin)
        last = find(out, lambda line: end in line, what=end)
        out = insert_sorted(out, first, last, new, by_id)
    for opener, new, what in ((lambda line: re.search(r'/\* ViewModels \*/ = \{', line), children, "ViewModels group"),
                              (lambda line: "isa = PBXSourcesBuildPhase" in line, sources, "Sources build phase")):
        at = find(out, opener, what=what)
        first = find(out, lambda line: "children = (" in line or "files = (" in line, at, what + " list")
        last = find(out, lambda line: line.strip() == ");", first, what + " list end")
        out = insert_sorted(out, first, last, new, by_name)

    remaining = iter(out)
    if len(out) != len(target) + len(wanted) or not all(line in remaining for line in target):
        swiftmove.refuse("sorting the four sections would move lines the target already has: its sections are "
                         "not in XcodeGen's order. Nothing is written. Use conversation-view/pbx_add.py, which "
                         "inserts by position.")
    with open(out_path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(out))
    print("added %d files, %d lines; nothing removed or reordered" % (len(build_files), len(wanted)))
    print("wrote " + out_path)


if __name__ == "__main__":
    main()
