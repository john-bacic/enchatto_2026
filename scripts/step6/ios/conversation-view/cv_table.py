"""The room screen's range table, read once for every tool in this folder. Not run by itself.

Data files next to it:
  tables.json   which lines of the base file go to which new file (its `about` explains the fields)
  widen.json    which declarations lose `private`, and which stage asks for it; widen_list.py
                writes it from the split itself

The split runs in stages, any subset of them:
  types          the 18 helper types below the main view move into eight files
  Sheets, Header, MessageList, Input, Presentations
                 the main view's members move into one `extension HostConversationView` file each
`all` is every stage. Only then do the stored properties declared mid-file join the others at
the top of the struct.
"""
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402


class Table:
    def __init__(self, tables_path=None, widen_path=None):
        self.tables_path = tables_path or os.path.join(HERE, "tables.json")
        self.widen_path = widen_path or os.path.join(HERE, "widen.json")
        data = swiftmove.load_json(self.tables_path)
        self.base = data["base"]
        self.type = data["type"]
        self.struct = data["struct"]
        self.folder = data["folder"]
        self.stored_ranges = data["stored_properties"]
        self.mid_state = data["mid_file_state"]
        self.keep_together = data["keep_together"]
        self.types = data["types"]
        self.groups = data["groups"]
        self.stages = ["types"] + [group["name"] for group in self.groups]

    def main_file(self):
        return self.type + ".swift"

    def type_file(self, entry):
        return "%s/%s" % (self.folder, entry["file"])

    def group_file(self, name):
        return "%s/%s+%s.swift" % (self.folder, self.type, name)

    def opener(self):
        return "extension %s {" % self.type

    def parse_stages(self, text):
        """The stages named by a comma list or `all`, in table order."""
        wanted = self.stages if text == "all" else text.split(",")
        unknown = [stage for stage in wanted if stage not in self.stages]
        if unknown or not wanted:
            swiftmove.refuse("unknown stage %s: use `all` or a comma list of %s"
                             % (", ".join(unknown) or "(none)", ", ".join(self.stages)))
        return [stage for stage in self.stages if stage in wanted]

    def everything(self, stages):
        return all(stage in stages for stage in self.stages)

    def files(self, stages):
        """Relative paths of the files a set of stages produces, the main file first."""
        names = [self.main_file()]
        if "types" in stages:
            names += [self.type_file(entry) for entry in self.types]
        names += [self.group_file(group["name"]) for group in self.groups if group["name"] in stages]
        return names

    def widened(self, stages):
        """Base line -> its widen.json entry, for the declarations these stages open."""
        entries = swiftmove.load_json(self.widen_path)["declarations"]
        return {e["line"]: e for e in entries if any(stage in stages for stage in e["opened_by"])}


def without_private(line):
    """The declaration line without its first `private `, or None when it has none."""
    return line.replace("private ", "", 1) if "private " in line else None
