#!/usr/bin/env python3
"""Lists every declaration of HostConversationView.swift that loses `private` in the split:
widen.json.

The list is read off the split itself. Each stage is run alone, in memory, and every line it
writes without `private` is recorded with the stage that asked for it; then all stages are run
together and the two results must agree. So the list is what split.py does, not a second opinion
on what it should do: verify.py holds a split against it, and a reader can check each entry.

Each entry of widen.json:
  line, declaration   the line in the base file, by number and as text
  name                the type, property or member declared there
  kind                `type` (a top-level type), `property` (a stored property of the main view)
                      or `member` (a computed property or function of the main view)
  opened_by           the stages that need it open; it loses `private` as soon as one of them runs
  file                where the declaration is once every stage has run

Input:  the base file, exactly: apps/ios/Views/HostConversationView.swift at commit 1b68a6f,
        sha256 16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83; and tables.json
        next to this script. Any other file is refused (exit 2).
Output: <output folder>/widen.json, outside the repository. With --check nothing is written:
        the result is compared with the widen.json next to this script (exit 1 if it differs).

Run:
  python3 scripts/step6/ios/conversation-view/widen_list.py <base HostConversationView.swift> <output folder>
  python3 scripts/step6/ios/conversation-view/widen_list.py --check <base HostConversationView.swift>
"""
import collections
import sys

sys.dont_write_bytecode = True

from cv_table import Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402
import cv_layout  # noqa: E402


def main():
    base_path, out_dir = swiftmove.data_tool_arguments(
        sys.argv, "usage: widen_list.py <base HostConversationView.swift> <output folder>\n"
                  "       widen_list.py --check <base HostConversationView.swift>")
    table = Table()
    lines = swiftmove.read_base(base_path, table.base)

    opened_by = collections.defaultdict(list)
    for stage in table.stages:
        _, opened, _ = cv_layout.build(lines, table, [stage])
        for line, _, _ in opened:
            opened_by[line].append(stage)
    _, opened, placed = cv_layout.build(lines, table, table.stages)
    together = {line: (name, member) for line, name, member in opened}
    if len(together) != len(opened):
        swiftmove.refuse("a line is opened twice when every stage runs")
    if set(together) != set(opened_by):
        swiftmove.refuse("the stages run alone open lines %s, run together they open %s"
                         % (sorted(set(opened_by) - set(together)), sorted(set(together) - set(opened_by))))

    def is_stored(line):
        return any(first <= line <= last for first, last in table.stored_ranges)

    declarations = []
    for line in sorted(together):
        name, member = together[line]
        kind = "type" if not member else "property" if is_stored(line) else "member"
        declarations.append({
            "line": line,
            "name": name,
            "kind": kind,
            "opened_by": opened_by[line],
            "file": placed[line],
            "declaration": lines[line - 1].strip(),
        })
        print("%5d %-9s %-28s %-48s <- %s" % (line, kind, name, placed[line], ", ".join(opened_by[line])))
    kinds = collections.Counter(d["kind"] for d in declarations)
    per_stage = collections.Counter(stage for d in declarations for stage in d["opened_by"])
    print("%d declarations lose `private`: %d types, %d properties, %d members"
          % (len(declarations), kinds["type"], kinds["property"], kinds["member"]))
    print("asked for by: " + ", ".join("%s %d" % (stage, per_stage[stage]) for stage in table.stages))
    swiftmove.deliver_json({
        "about": "Declarations of HostConversationView.swift that lose `private` when it is split, by line of "
                 "the base file. A declaration is opened as soon as one of the stages in `opened_by` runs. "
                 "Written by widen_list.py from what split.py does; verify.py holds a split against it.",
        "base": table.base,
        "declarations": declarations,
    }, out_dir, table.widen_path)


if __name__ == "__main__":
    main()
