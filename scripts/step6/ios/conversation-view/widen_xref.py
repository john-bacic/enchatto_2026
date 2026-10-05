#!/usr/bin/env python3
"""A second look at widen.json: does a text search for uses agree with what the split opens?

widen.json is read off what split.py does. This derives the same answer another way, from
members.json and xref.json: a private property or member of the main view has to lose `private`
when a member that ends up in a different file names it. It then compares, name by name:
  the set of properties and members to open is the same in both;
  a declaration that stays in the main file is opened by exactly the stages whose files use it;
  a declaration that moves with a stage is opened by that stage and by every other stage whose
  file uses it (while its own stage has not run, it is still in the main file).
The 13 top-level types in widen.json are outside this check: xref.json covers members only.

Agreement shows the list is neither too long nor too short as far as a search by name can tell.
Whether it is enough to compile is the compiler's verdict.

Input:  none on the command line: tables.json, widen.json, members.json and xref.json next to
        this script. Nothing is written.
Exit:   0 the two agree, 1 they differ (each difference is printed).

Run:
  python3 scripts/step6/ios/conversation-view/widen_xref.py
"""
import os
import sys

sys.dont_write_bytecode = True

from cv_table import HERE, Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402

MAIN = "main file"


def main():
    if len(sys.argv) != 1:
        sys.stderr.write("usage: widen_xref.py   (no arguments)\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    table = Table()
    members = swiftmove.load_json(os.path.join(HERE, "members.json"))
    xref = swiftmove.load_json(os.path.join(HERE, "xref.json"))
    listed = {d["name"]: d for d in swiftmove.load_json(table.widen_path)["declarations"] if d["kind"] != "type"}
    types = sum(1 for d in swiftmove.load_json(table.widen_path)["declarations"] if d["kind"] == "type")

    def home(member):
        for group in table.groups:
            if any(first <= member["line"] <= last for first, last in group["members"]):
                return group["name"]
        return MAIN

    by_name = {m["name"]: m for m in members}
    used_from = {}
    for user in members:
        for name in xref[user["name"]]["uses"]:
            if home(user) != home(by_name[name]):
                used_from.setdefault(name, set()).add(home(user))

    order = [group["name"] for group in table.groups]
    problems = []
    needed = {name for name in used_from if "private" in by_name[name]["text"]}
    for name in sorted(needed - set(listed)):
        problems.append("%s (line %d) is private and used from %s, but widen.json does not list it"
                        % (name, by_name[name]["line"], ", ".join(sorted(used_from[name]))))
    for name in sorted(set(listed) - needed):
        problems.append("%s (line %d) is in widen.json, but no member in another file names it"
                        % (name, listed[name]["line"]))
    for name in sorted(needed & set(listed), key=lambda n: by_name[n]["line"]):
        own = home(by_name[name])
        expected = set(used_from[name]) - {MAIN}
        if own != MAIN:
            expected.add(own)
        expected = [stage for stage in order if stage in expected]
        if listed[name]["opened_by"] != expected:
            problems.append("%s (line %d, in %s): widen.json says opened by %s, the uses say %s"
                            % (name, by_name[name]["line"], own, ", ".join(listed[name]["opened_by"]), ", ".join(expected)))
    if problems:
        print("FAILED: widen.json and the cross-reference differ")
        for problem in problems:
            print("  " + problem)
        sys.exit(swiftmove.EXIT_FAILED)
    print("ok: the %d properties and members in widen.json are the private ones a member in another file names, "
          "each opened by the stages that use it; %d types not covered" % (len(listed), types))
    sys.exit(swiftmove.EXIT_OK)


if __name__ == "__main__":
    main()
