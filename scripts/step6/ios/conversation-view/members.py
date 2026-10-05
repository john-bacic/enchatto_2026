#!/usr/bin/env python3
"""Lists every member of the HostConversationView struct with its line range: members.json.

One entry per declaration at member level (four spaces of indentation) between the struct's
braces: `kind` (var, let, func, init), `name`, `line` (the declaration line), `text` (that line,
trimmed), `start` (its first line, counting `@ViewBuilder`, doc comments, MARK comments and
blank lines directly above it) and `end` (its last line, before whatever leads in the next
member). Line numbers are those of the base file.

xref.py reads it to find which members name which, and widen_xref.py to tell a property from a
member and private from not.

Input:  the base file, exactly: apps/ios/Views/HostConversationView.swift at commit 1b68a6f,
        sha256 16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83. Any other file
        is refused (exit 2).
Output: <output folder>/members.json, outside the repository. With --check nothing is written:
        the result is compared with the members.json next to this script (exit 1 if it differs).

Run:
  python3 scripts/step6/ios/conversation-view/members.py <base HostConversationView.swift> <output folder>
  python3 scripts/step6/ios/conversation-view/members.py --check <base HostConversationView.swift>
"""
import os
import re
import sys

sys.dont_write_bytecode = True

from cv_table import HERE, Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402

DECLARATION = re.compile(r'^    (?:@\w+(?:\([^)]*\))? )*(?:private )?(?:static )?(var|let|func|init)\b ?(\w+)?')


def leads_in(line):
    """A line that belongs to the declaration below it rather than to the one above."""
    text = line.strip()
    return text == "" or text.startswith(("@ViewBuilder", "///", "// MARK"))


def members_of(lines, table):
    struct_first, struct_last = table.struct           # 1-based lines of `struct ... {` and its `}`
    members = []
    for i in range(struct_first, struct_last - 1):     # 0-based indexes of the lines between them
        match = DECLARATION.match(lines[i])
        if match:
            kind = match.group(1)
            name = "init" if kind == "init" else (match.group(2) or "init")
            members.append({"name": name, "kind": kind, "line": i + 1, "text": lines[i].strip()})
    for member in members:
        j = member["line"] - 2
        while j >= struct_first and leads_in(lines[j]):
            j -= 1
        member["start"] = j + 2
    for index, member in enumerate(members):
        end = members[index + 1]["start"] - 1 if index + 1 < len(members) else struct_last - 1
        while end > member["line"] and leads_in(lines[end - 1]):
            end -= 1
        member["end"] = end
    return members


def main():
    base_path, out_dir = swiftmove.data_tool_arguments(
        sys.argv, "usage: members.py <base HostConversationView.swift> <output folder>\n"
                  "       members.py --check <base HostConversationView.swift>")
    table = Table()
    lines = swiftmove.read_base(base_path, table.base)
    members = members_of(lines, table)
    for m in members:
        print(f'{m["line"]:5d}-{m["end"]:5d} ({m["end"] - m["line"] + 1:4d}) {m["kind"]:5s} {m["name"]:28s} {m["text"][:90]}')
    print("%d members" % len(members))
    swiftmove.deliver_json(members, out_dir, os.path.join(HERE, "members.json"))


if __name__ == "__main__":
    main()
