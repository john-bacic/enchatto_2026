"""The view model's range table, read once for every tool in this folder. Not run by itself.

Three data files sit next to it:
  groups.json   which lines of the base file form which `extension HostRoomViewModel` block
  widen.json    which declarations lose `private` or `private(set)` once a block is its own file
  members.json  every member of the class with its line range, written by members.py

A tool names one of three layouts, called stages here:
  regroup  one file: the class body, then all ten groups as extension blocks in that file.
           No access level changes: `private` reaches an extension in the same file.
  games    six files: the five game groups are files of their own, the five core groups are
           still extension blocks in the main file. The declarations marked `games` in
           widen.json lose their access word.
  all      eleven files: every group is a file of its own. Every declaration in widen.json
           loses its access word.
"""
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402

STAGES = ("regroup", "games", "all")


class Table:
    def __init__(self, groups_path=None, widen_path=None, members_path=None):
        self.groups_path = groups_path or os.path.join(HERE, "groups.json")
        self.widen_path = widen_path or os.path.join(HERE, "widen.json")
        self.members_path = members_path or os.path.join(HERE, "members.json")
        data = swiftmove.load_json(self.groups_path)
        self.base = data["base"]
        self.type = data["type"]
        self.class_line = data["class_line"]
        self.groups = data["groups"]
        self.owner = {}
        self.overlaps = []
        for group in self.groups:
            for first, last in group["blocks"]:
                for n in range(first, last + 1):
                    if n in self.owner:
                        self.overlaps.append((n, self.owner[n], group["name"]))
                    self.owner[n] = group["name"]

    def main_file(self):
        return self.type + ".swift"

    def group_file(self, name):
        return "%s+%s.swift" % (self.type, name)

    def opener(self):
        return "extension %s {" % self.type

    def groups_out(self, stage):
        """Names of the groups that are files of their own in this stage."""
        if stage == "regroup":
            return []
        if stage == "games":
            return [g["name"] for g in self.groups if g["stage"] == "games"]
        if stage == "all":
            return [g["name"] for g in self.groups]
        swiftmove.refuse("unknown stage %r: use one of %s" % (stage, ", ".join(STAGES)))

    def widened(self, stage):
        """Base line -> the access word that line loses in this stage."""
        if stage == "regroup":
            return {}
        entries = swiftmove.load_json(self.widen_path)["declarations"]
        if stage == "games":
            entries = [e for e in entries if e["stage"] == "games"]
        return {e["line"]: e["loses"] for e in entries}

    def stored_properties(self):
        """(declaration line, name) of every instance stored property, from members.json."""
        members = swiftmove.load_json(self.members_path)
        return [(m["decl"], m["name"]) for m in members
                if m["kind"] in ("var", "let") and m["stored"] and not m["static"]]


def without_access_word(line, loses):
    """The declaration line without `private ` or `private(set) `, or None when it has neither."""
    if loses == "private":
        new, count = re.subn(r"\bprivate (?!\()", "", line, count=1)
    elif loses == "private(set)":
        new, count = line.replace("private(set) ", "", 1), line.count("private(set) ")
    else:
        return None
    return new if count >= 1 else None


def text_of(lines, n, widened):
    """Line n of the base file (1-based) as the stage writes it."""
    line = lines[n - 1]
    if n in widened:
        new = without_access_word(line, widened[n])
        if new is None:
            swiftmove.refuse("widen.json says line %d loses `%s`, but the line is: %s"
                             % (n, widened[n], line.strip()))
        return new
    return line
