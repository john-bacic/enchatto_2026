"""Writes HostRoomViewModel.swift in one of its three layouts. Not run by itself: regroup.py,
split_batch1.py and split.py call it with their stage (see vm_table.py for the stages).

Lines are copied whole, never re-indented or edited, except the declarations widen.json lists
for the stage, which lose one access word. Blank lines are the only thing the layout decides:
one blank line where a range left the class body, none at the start or end of a block, never two
in a row. The base file has no multi-line string literal, so a blank line carries no meaning.
"""
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402
from vm_table import Table, text_of  # noqa: E402


def build(lines, table, stage):
    """File name -> lines, for the given stage."""
    widened = table.widened(stage)
    out = set(table.groups_out(stage))

    body, previous = [], None
    for n in range(1, len(lines) + 1):
        if n in table.owner:
            continue
        if previous is not None and n != previous + 1:
            body.append("")                  # a gap where a range moved out
        body.append(text_of(lines, n, widened))
        previous = n
    main = swiftmove.squeeze(body)

    files = {}
    for group in table.groups:
        inner = []
        for first, last in group["blocks"]:
            inner += [text_of(lines, n, widened) for n in range(first, last + 1)] + [""]
        block = [table.opener()] + swiftmove.squeeze(inner) + ["}"]
        if group["name"] in out:
            files[table.group_file(group["name"])] = (
                ["import " + module for module in group["imports"]] + [""] + block)
        else:
            main += ["", "// MARK: - " + group["name"], ""] + block
    files[table.main_file()] = main
    return files


def run(stage, argv, usage):
    """Shared command line of the three layout tools: <base file> <output folder>."""
    if len(argv) != 3 or argv[1].startswith("-"):
        sys.stderr.write(usage.strip() + "\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    table = Table()
    lines = swiftmove.read_base(argv[1], table.base)
    out_dir = swiftmove.output_dir(argv[2])
    files = build(lines, table, stage)
    for name in sorted(files):
        swiftmove.write_lines(os.path.join(out_dir, name), files[name])
        print("%5d lines  %s" % (len(files[name]), os.path.join(out_dir, name)))
    print("stage %s: %d file(s), %d declaration(s) without their access word"
          % (stage, len(files), len(table.widened(stage))))
