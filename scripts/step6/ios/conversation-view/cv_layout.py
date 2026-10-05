"""Writes HostConversationView.swift and the files split off it. Not run by itself: split.py and
widen_list.py call it.

Lines are copied whole, never re-indented or edited, with one exception: a declaration that
another file now uses loses the word `private`. Which ones is decided here by name, from the
`open`, `open_types`, `state` and `helpers` lists of tables.json:
  a moved top-level type named in `open` or `open_types` is opened in its new file;
  a member named in a group's `helpers` is opened in that group's own file;
  a property or member of the main view named in `state` or `helpers` of any stage that runs is
  opened in the main file, but only inside the struct: a helper type further down has members of
  the same name (QRCodeFloatingPanel has its own private dismiss()).
Blank lines: none is left at the end of a moved block, and the main file keeps at most one in a
row where lines left it.
"""
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402

_MEMBER = r'^(    (?:@\w+(?:\([^)]*\))? )*)private ((?:var|func) %s\b)'
_TYPE = r'^()private ((?:final class|struct|enum) %s\b)'


def build(lines, table, stages):
    """(relative path -> lines, opened declarations, base line -> relative path).

    An opened declaration is (base line, name, True for a member or property / False for a type).
    """
    taken = set()
    opened = []
    placed = {}

    def take(first, last):
        for n in range(first, last + 1):
            if n in taken:
                swiftmove.refuse("line %d is in two ranges of tables.json" % n)
            taken.add(n)
        return [(n, lines[n - 1]) for n in range(first, last + 1)]

    def open_declarations(items, names, member):
        out = []
        for n, line in items:
            new = line
            for name in names:
                match = re.match((_MEMBER if member else _TYPE) % re.escape(name), line)
                if match:
                    new = match.group(1) + match.group(2) + line[match.end():]
                    opened.append((n, name, member))
                    break
            out.append((n, new))
        return out

    def strip_blank(items):
        while items and swiftmove.is_blank(items[-1][1]):
            items = items[:-1]
        return items

    def emit(path, parts):
        """`parts` mixes added lines (plain strings) with (base line, text) pairs."""
        text = []
        for part in parts:
            if isinstance(part, tuple):
                placed[part[0]] = path
                text.append(part[1])
            else:
                text.append(part)
        return text

    files = {}
    open_in_main = []
    if "types" in stages:
        for entry in table.types:
            body = []
            for first, last in entry["ranges"]:
                body += take(first, last)
            path = table.type_file(entry)
            files[path] = emit(path, ["import " + module for module in entry["imports"]] + [""]
                               + open_declarations(strip_blank(body), entry["open"], member=False))
            taken.update(entry["moved_import_lines"])
    for group in table.groups:
        if group["name"] not in stages:
            continue
        path = table.group_file(group["name"])
        parts = ["import " + module for module in group["imports"]] + [""]
        top = []
        for first, last in group["top_level"]:
            top += take(first, last)
        if top:
            parts += open_declarations(top, group["open_types"], member=False) + [""]
        body = []
        for first, last in group["members"]:
            body += take(first, last)
        parts += [table.opener()] + open_declarations(strip_blank(body), group["helpers"], member=True) + ["}"]
        files[path] = emit(path, parts)
        open_in_main += group["state"] + group["helpers"]
        taken.update(group["moved_import_lines"])

    everything = table.everything(stages)
    mid_state = take(*table.mid_state["range"]) if everything else []
    struct_first, struct_last = table.struct
    main = []
    for n, line in enumerate(lines, 1):
        if n in taken:
            continue
        item = [(n, line)]
        main += open_declarations(item, open_in_main, member=True) if struct_first <= n <= struct_last else item
        if everything and n == table.mid_state["after"]:
            main += open_declarations(mid_state, open_in_main, member=True)
    tidy = []
    for item in main:
        if swiftmove.is_blank(item[1]) and tidy and swiftmove.is_blank(tidy[-1][1]):
            continue
        tidy.append(item)
    files[table.main_file()] = emit(table.main_file(), strip_blank(tidy))
    return files, opened, placed
