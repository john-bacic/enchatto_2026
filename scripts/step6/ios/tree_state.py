#!/usr/bin/env python3
"""Says which state of each split an apps/ios folder is in, by the bytes of its files.

A step of a split starts from a known state of the tree and ends in another. This names the
state without regenerating anything: it compares the sha256 of the files in the folder with the
base file's (recorded in the range tables) and with what each stage's layout tool writes
(recorded in selftest/outputs.json).

  view-model          ViewModels/HostRoomViewModel.swift and ViewModels/HostRoomViewModel+*.swift
      base            the file as it is before any move
      regroup         one file, regrouped (regroup.py)
      games           six files (split_batch1.py)
      all             eleven files (split.py)
  conversation-view   Views/HostConversationView.swift and Views/Conversation/*.swift
      base            the file as it is before any move, no Conversation folder
      types           the main file and eight type files (split.py ... types)
      all             the main file and thirteen files (split.py ... all)
A folder that is none of these is reported as `unknown`, with the first file that does not fit:
either someone edited a file after it was generated, or a file is missing or left over.

Input:  the apps/ios folder to look at (the tree's, or a copy). Nothing is written.
Exit:   0, or 1 when an --expect is not met, 2 when the folder cannot be read.

Run:
  python3 scripts/step6/ios/tree_state.py apps/ios
  python3 scripts/step6/ios/tree_state.py apps/ios --expect view-model=regroup --expect conversation-view=types
"""
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import swiftmove  # noqa: E402

SPLITS = {
    # name: (range table, the folder under apps/ios that holds the split's files)
    "view-model": ("view-model/groups.json", "ViewModels"),
    "conversation-view": ("conversation-view/tables.json", "Views"),
}


def files_of(name, folder, base_name):
    """Relative path -> sha256 of the split's files now in `folder`."""
    paths = []
    if os.path.isfile(os.path.join(folder, base_name)):
        paths.append(base_name)
    if name == "view-model":
        stem = os.path.splitext(base_name)[0] + "+"
        paths += sorted(entry for entry in os.listdir(folder) if entry.startswith(stem) and entry.endswith(".swift"))
    else:
        sub = os.path.join(folder, "Conversation")
        if os.path.isdir(sub):
            paths += sorted("Conversation/" + entry for entry in os.listdir(sub) if entry.endswith(".swift"))
    found = {}
    for path in paths:
        with open(os.path.join(folder, path), "rb") as handle:
            found[path] = swiftmove.sha256_hex(handle.read())
    return found


def state_of(name, ios):
    """(state, why it is unknown or None)."""
    table_path, sub = SPLITS[name]
    base = swiftmove.load_json(os.path.join(HERE, table_path))["base"]
    folder = os.path.join(ios, sub)
    if not os.path.isdir(folder):
        swiftmove.refuse("%s is not a folder" % folder)
    base_name = os.path.basename(base["path"])
    found = files_of(name, folder, base_name)
    states = {"base": {base_name: base["sha256"]}}
    states.update(swiftmove.load_json(os.path.join(HERE, "selftest", "outputs.json"))[name])
    for state, files in states.items():
        if found == files:
            return state, None
    # Name the nearest state and the first file that keeps the folder from being it.
    nearest = max(states, key=lambda state: sum(1 for path, digest in states[state].items() if found.get(path) == digest))
    for path in sorted(set(states[nearest]) | set(found)):
        if path not in found:
            return "unknown", "nearest is `%s`, but %s is missing" % (nearest, path)
        if path not in states[nearest]:
            return "unknown", "nearest is `%s`, but it has no %s" % (nearest, path)
        if found[path] != states[nearest][path]:
            return "unknown", "nearest is `%s`, but %s has sha256 %s, not %s" % (
                nearest, path, found[path][:16], states[nearest][path][:16])
    return "unknown", None


def main():
    arguments = sys.argv[1:]
    expected = {}
    while "--expect" in arguments:
        at = arguments.index("--expect")
        pair = arguments[at + 1] if at + 1 < len(arguments) else ""
        name, _, state = pair.partition("=")
        if name not in SPLITS or not state:
            swiftmove.refuse("--expect takes view-model=<state> or conversation-view=<state>, not %r" % pair)
        expected[name] = state
        del arguments[at:at + 2]
    if len(arguments) != 1 or arguments[0].startswith("-"):
        sys.stderr.write("usage: tree_state.py <apps/ios folder> [--expect view-model=<state>] "
                         "[--expect conversation-view=<state>]\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    unmet = 0
    for name in SPLITS:
        state, why = state_of(name, arguments[0])
        line = "%-18s %s" % (name, state) + (" (%s)" % why if why else "")
        if name in expected and expected[name] != state:
            unmet += 1
            line += "   FAILED: expected " + expected[name]
        print(line)
    sys.exit(swiftmove.EXIT_FAILED if unmet else swiftmove.EXIT_OK)


if __name__ == "__main__":
    main()
