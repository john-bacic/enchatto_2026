#!/usr/bin/env python3
"""Lists every member of the HostRoomViewModel class with its line range: members.json.

One entry per declaration at member level (four spaces of indentation): kind (var, let, func,
init, enum, struct), name, `start` (first line, doc comments included), `decl` (the declaration
line), `end` (its last line), and whether it is a stored property, @Published, private,
private(set) or static. Line numbers are those of the base file.

The other tools read it for two things: the 72 instance stored properties, which must stay in the
class body because an extension cannot hold one (verify_regroup.py, verify_move.py), and each
member's range, in which widen_calc.py looks for uses of private members.

A property counts as stored when its declaration line opens no brace, when its braces hold
didSet or willSet, or when the brace follows an initial value.

Input:  the base file, exactly: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f,
        sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04. Any other file
        is refused (exit 2).
Output: <output folder>/members.json, outside the repository. With --check nothing is written:
        the result is compared with the members.json next to this script (exit 1 if it differs).

Run:
  python3 scripts/step6/ios/view-model/members.py <base HostRoomViewModel.swift> <output folder>
  python3 scripts/step6/ios/view-model/members.py --check <base HostRoomViewModel.swift>
"""
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402
from vm_table import Table  # noqa: E402

DECLARATION = re.compile(
    r'^    ((?:@\w+(?:\([^)]*\))?\s+)*)((?:private\(set\)|private|fileprivate|static|final)\s+)*'
    r'(var|let|func|enum|struct|init)\b\s*([A-Za-z_][A-Za-z0-9_]*)?')


def declaration_end(scan, i):
    """Index of the last line of the declaration that starts on line i: the line that closes its
    body, or the line its signature ends on when it has no body."""
    parens = 0
    for j in range(i, len(scan.lines)):
        parens += scan.code[j].count("(") - scan.code[j].count(")")
        if scan.after[j] > scan.before[i]:
            return next(k for k in range(j, len(scan.lines)) if scan.after[k] <= scan.before[i])
        if parens <= 0:
            return j
    return len(scan.lines) - 1


def is_stored(lines, i, end):
    first = lines[i]
    body = "\n".join(lines[i:end + 1])
    if '{' not in re.sub(r'"[^"]*"', '', first.split('//')[0]):
        return True
    if 'didSet' in body or 'willSet' in body:
        return True
    return bool(re.search(r'=\s*[^{]*\{', first)) and not re.search(r':\s*[^={]+\{', first)


def members_of(lines, table):
    scan = swiftmove.scan_base(lines, table.base["path"])
    members = []
    attribute_start = None
    i = table.class_line                      # the first line after `class HostRoomViewModel ... {`
    while i < len(lines):
        line = lines[i]
        if re.match(r'^    @(discardableResult|available)', line) and not DECLARATION.match(line):
            attribute_start = i               # an attribute on a line of its own belongs to the next declaration
            i += 1
            continue
        match = DECLARATION.match(line)
        if not match:
            i += 1
            continue
        kind = match.group(3)
        name = match.group(4) or 'init'
        head = line.split(kind)[0]
        mods = (match.group(1) or '') + ' ' + ' '.join(re.findall(r'(private\(set\)|private|fileprivate|static)', head))
        end = declaration_end(scan, i)
        start = attribute_start if attribute_start is not None else i
        while start - 1 >= 0 and re.match(r'^    ///', lines[start - 1]):
            start -= 1
        members.append(dict(
            kind=kind, name=name, mods=mods.strip(), start=start + 1, decl=i + 1, end=end + 1,
            stored=kind in ('var', 'let') and is_stored(lines, i, end),
            published='@Published' in line,
            private='private ' in head and 'private(set)' not in head,
            private_set='private(set)' in line,
            static='static' in head))
        attribute_start = None
        i = end + 1
    return members


def main():
    base_path, out_dir = swiftmove.data_tool_arguments(
        sys.argv, "usage: members.py <base HostRoomViewModel.swift> <output folder>\n"
                  "       members.py --check <base HostRoomViewModel.swift>")
    table = Table()
    lines = swiftmove.read_base(base_path, table.base)
    members = members_of(lines, table)
    for m in members:
        tags = [tag for tag, on in (('@Published', m['published']), ('private', m['private']),
                                    ('private(set)', m['private_set']), ('static', m['static'])) if on]
        if m['kind'] in ('var', 'let'):
            tags.append('STORED' if m['stored'] else 'computed')
        print(f"{m['start']:5}-{m['end']:<5} {m['kind']:6} {m['name']:36} {' '.join(tags)}")
    stored = [m for m in members if m['kind'] in ('var', 'let') and m['stored'] and not m['static']]
    print("%d members, %d instance stored properties" % (len(members), len(stored)))
    swiftmove.deliver_json(members, out_dir, os.path.join(HERE, "members.json"))


if __name__ == "__main__":
    main()
