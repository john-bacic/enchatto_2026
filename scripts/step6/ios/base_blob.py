#!/usr/bin/env python3
"""Writes the base file of a split into a scratch folder, straight from the repository's history.

Every range table in this folder is tied to one exact file, the base file: the Swift source as
it is before any of the moves. Once a move is in the tree, the working copy holds the moved file
and only history holds the base file. This fetches it by its git object id (or, failing that, by
commit and path), checks its sha256 against the table and writes it out. The other tools take
the written file as their <base file> argument and refuse anything else.

  view-model          apps/ios/ViewModels/HostRoomViewModel.swift at 1b68a6f
                      sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04
                      (recorded in view-model/groups.json)
  conversation-view   apps/ios/Views/HostConversationView.swift at 1b68a6f
                      sha256 16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83
                      (recorded in conversation-view/tables.json)

Input:  which split, and an output folder outside the repository. Needs `git` and a clone whose
        history still holds the object.
Output: <output folder>/HostRoomViewModel.swift or <output folder>/HostConversationView.swift;
        the path is printed. Exit 2 when git cannot supply the file or its sha256 is not the
        recorded one.

Run:
  python3 scripts/step6/ios/base_blob.py view-model <output folder>
  python3 scripts/step6/ios/base_blob.py conversation-view <output folder>
The same by hand:
  git show 1b68a6f:apps/ios/ViewModels/HostRoomViewModel.swift > <output folder>/HostRoomViewModel.swift
"""
import os
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import swiftmove  # noqa: E402

TABLES = {
    "view-model": os.path.join(HERE, "view-model", "groups.json"),
    "conversation-view": os.path.join(HERE, "conversation-view", "tables.json"),
}


def from_git(root, arguments):
    try:
        done = subprocess.run(["git", "-C", root] + arguments, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError:
        return None
    return done.stdout if done.returncode == 0 else None


def fetch(name, out_dir):
    """Writes the base file of split `name` into `out_dir` and returns its path."""
    base = swiftmove.load_json(TABLES[name])["base"]
    root = swiftmove.repository_root()
    if root is None:
        swiftmove.refuse("these tools are not inside a git working tree, so history cannot be read")
    data = from_git(root, ["cat-file", "blob", base["git_blob"]])
    if data is None or swiftmove.sha256_hex(data) != base["sha256"]:
        data = from_git(root, ["show", "%s:%s" % (base["commit"], base["path"])])
    if data is None:
        swiftmove.refuse("git has neither object %s nor %s:%s in %s.\nFetch more history, or copy the file from a "
                         "clone that has it." % (base["git_blob"][:12], base["commit"], base["path"], root))
    if swiftmove.sha256_hex(data) != base["sha256"]:
        swiftmove.refuse("%s:%s has sha256 %s, the table records %s"
                         % (base["commit"], base["path"], swiftmove.sha256_hex(data), base["sha256"]))
    path = os.path.join(out_dir, os.path.basename(base["path"]))
    with open(path, "wb") as handle:
        handle.write(data)
    return path


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in TABLES:
        sys.stderr.write("usage: base_blob.py view-model|conversation-view <output folder>\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    print(fetch(sys.argv[1], swiftmove.output_dir(sys.argv[2])))


if __name__ == "__main__":
    main()
