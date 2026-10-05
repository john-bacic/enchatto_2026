#!/usr/bin/env python3
"""Records which members of HostConversationView name which other members: xref.json.

For each member in members.json: `range` (its declaration line to its last line) and `uses`, a
map from every other member's name found in that range to the lines it is found on. A name is
found as a whole word, with or without `self.`, `$` or `_` in front, outside comments; a use
as an argument label (`name:` right after `(` or `,`) does not count.

It is a text search, good for reading and for a second look at the widen list (widen_xref.py),
not a substitute for the compiler: a local variable with a member's name counts as a use.

Input:  the base file, exactly: apps/ios/Views/HostConversationView.swift at commit 1b68a6f,
        sha256 16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83; and members.json
        next to this script. Any other base file is refused (exit 2).
Output: <output folder>/xref.json, outside the repository. With --check nothing is written:
        the result is compared with the xref.json next to this script (exit 1 if it differs).

Run:
  python3 scripts/step6/ios/conversation-view/xref.py <base HostConversationView.swift> <output folder>
  python3 scripts/step6/ios/conversation-view/xref.py --check <base HostConversationView.swift>
"""
import os
import re
import sys

sys.dont_write_bytecode = True

from cv_table import HERE, Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402


def without_comment(line):
    """The line up to a `//` that is not inside a string literal."""
    out = []
    in_string = False
    i = 0
    while i < len(line):
        c = line[i]
        if c == '"' and (i == 0 or line[i - 1] != '\\'):
            in_string = not in_string
        if not in_string and line[i:i + 2] == '//':
            break
        out.append(c)
        i += 1
    return "".join(out)


def uses_in(lines, names, first, last):
    found = {}
    for number in range(first, last + 1):
        line = without_comment(lines[number - 1])
        for name in names:
            for match in re.finditer(r'(?<![\w.])(?:self\.)?[$_]?\b' + re.escape(name) + r'\b', line):
                tail = line[match.end():match.end() + 1]
                head = line[:match.start()].rstrip()
                if tail == ':' and (head.endswith('(') or head.endswith(',') or head == ''):
                    continue                        # an argument label, not the member
                found.setdefault(name, []).append(number)
    return found


def main():
    base_path, out_dir = swiftmove.data_tool_arguments(
        sys.argv, "usage: xref.py <base HostConversationView.swift> <output folder>\n"
                  "       xref.py --check <base HostConversationView.swift>")
    table = Table()
    lines = swiftmove.read_base(base_path, table.base)
    members = swiftmove.load_json(os.path.join(HERE, "members.json"))
    names = [m["name"] for m in members if m["name"] not in ("init", "body")]
    out = {}
    for m in members:
        found = uses_in(lines, names, m["line"], m["end"])
        found.pop(m["name"], None)
        out[m["name"]] = {"range": [m["line"], m["end"]],
                          "uses": {name: sorted(set(numbers)) for name, numbers in found.items()}}
    used = set()
    for entry in out.values():
        used |= set(entry["uses"])
    print("%d members; named by no other member: %s" % (len(out), ", ".join(n for n in names if n not in used)))
    swiftmove.deliver_json(out, out_dir, os.path.join(HERE, "xref.json"))


if __name__ == "__main__":
    main()
