#!/usr/bin/env python3
"""Derives which private members of HostRoomViewModel must become internal: widen.json.

`private` does not reach an extension in another file, so a private member that a different
group uses has to lose the word once the groups are separate files. For every member that is
`private` or `private(set)`, this looks through the body of every member of the other groups
for the name (for `private(set)`: for an assignment to it) and lists the member when it finds
one. It does so for both splits: with only the five game groups out (`stage: games`, 20
declarations) and with all ten out (the 31 more marked `stage: core`).

The search is by name in the source text, not by the compiler. It can only err by listing too
much or too little, and both show up later: a missing entry fails the build, and an entry that
is not needed is visible here as a member with a `used_from` a reader can check.

Each entry of widen.json: `line` and `declaration` (the line in the base file), `name`, `loses`
(`private` or `private(set)`), `stage`, `declared_in` (the group that holds it after the full
split, or `class body`) and `used_from` (the other groups that use it).

Input:  the base file, exactly: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f,
        sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04; and, next to
        this script, groups.json and members.json.
Output: <output folder>/widen.json, outside the repository. With --check nothing is written:
        the result is compared with the widen.json next to this script (exit 1 if it differs).

Run:
  python3 scripts/step6/ios/view-model/widen_calc.py <base HostRoomViewModel.swift> <output folder>
  python3 scripts/step6/ios/view-model/widen_calc.py --check <base HostRoomViewModel.swift>
"""
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402
from vm_table import Table  # noqa: E402

CLASS_BODY = "class body"


def used_from(lines, members, home):
    """Declaration line -> the homes, other than its own, whose members use that private member."""
    def body(member):
        return "\n".join(re.sub(r'//.*$', '', line) for line in lines[member['decl'] - 1:member['end']])

    result = {}
    for target in members:
        if not (target['private'] or target['private_set']):
            continue
        name = target['name']
        reference = re.compile(r'(?:(?<![A-Za-z0-9_.])|self\.|self\?\.|Self\.)' + re.escape(name) + r'\b')
        assignment = re.compile(r'(?:(?<![A-Za-z0-9_.])|self\.|self\?\.)' + re.escape(name)
                                + r'(\?|\[[^\]]*\])?(\.[A-Za-z_]+)*\s*(=(?!=)|\+=|-=)')
        users = set()
        for user in members:
            if user is target or home(user) == home(target):
                continue
            text = body(user)
            # two names are also ordinary words in other members: count a call, not a mention
            if name == 'send' and not re.search(r'(?<![A-Za-z0-9_.])send\(', text):
                continue
            if name == 'textureIndex' and 'textureIndex(of' not in text:
                continue
            if not reference.search(text):
                continue
            if target['private_set'] and not assignment.search(text):
                continue                      # reading a private(set) member needs no change
            users.add(home(user))
        if users:
            result[target['decl']] = sorted(users)
    return result


def main():
    base_path, out_dir = swiftmove.data_tool_arguments(
        sys.argv, "usage: widen_calc.py <base HostRoomViewModel.swift> <output folder>\n"
                  "       widen_calc.py --check <base HostRoomViewModel.swift>")
    table = Table()
    lines = swiftmove.read_base(base_path, table.base)
    members = swiftmove.load_json(table.members_path)
    games = set(table.groups_out("games"))

    def final_home(member):
        return table.owner.get(member['decl'], CLASS_BODY)

    def games_home(member):
        home = final_home(member)
        return home if home in games else CLASS_BODY

    after_games = used_from(lines, members, games_home)
    after_all = used_from(lines, members, final_home)
    lost = sorted(set(after_games) - set(after_all))
    if lost:
        swiftmove.refuse("needed with the game files out but not after the full split: lines %s" % lost)

    by_line = {m['decl']: m for m in members}
    declarations = []
    for line in sorted(after_all):
        member = by_line[line]
        entry = {
            "line": line,
            "name": member['name'],
            "loses": "private(set)" if member['private_set'] else "private",
            "stage": "games" if line in after_games else "core",
            "declared_in": final_home(member),
            "used_from": after_all[line],
            "declaration": lines[line - 1].strip(),
        }
        declarations.append(entry)
        print("%5d %-13s %-6s %-28s in %-17s <- %s" % (
            line, entry["loses"], entry["stage"], entry["name"], entry["declared_in"], ", ".join(entry["used_from"])))
    counts = {stage: sum(1 for d in declarations if d["stage"] == stage) for stage in ("games", "core")}
    print("%d declarations: %d for the game files, %d more for the core files"
          % (len(declarations), counts["games"], counts["core"]))
    swiftmove.deliver_json({
        "about": "Declarations of HostRoomViewModel that lose `private` or `private(set)` when its groups "
                 "become separate files, by line of the base file. `stage: games` is needed as soon as the "
                 "five game groups are files; `stage: core` only once the other five are too. Written by "
                 "widen_calc.py; split_batch1.py, split.py and verify_move.py read it.",
        "base": table.base,
        "declarations": declarations,
    }, out_dir, table.widen_path)


if __name__ == "__main__":
    main()
