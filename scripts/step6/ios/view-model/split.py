#!/usr/bin/env python3
"""Splits HostRoomViewModel.swift into eleven files: every group is a file of its own.

The main file keeps the class body (stored properties, init, PollIssue, derived helpers). Each
of the ten groups in groups.json becomes HostRoomViewModel+<name>.swift: its imports, then one
`extension HostRoomViewModel` holding its lines in the order listed. The 51 declarations in
widen.json lose `private` or `private(set)`; no other line is edited.

Input:  the base file, exactly: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f,
        sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04, 2,106 lines.
        It is the file from before the regroup and before the game files left: every range in
        groups.json and every line in widen.json is a line of that blob. Any other file is
        refused (exit 2).
Output: eleven files in <output folder>, which must be outside the repository.

Run:
  git show 1b68a6f:apps/ios/ViewModels/HostRoomViewModel.swift > <scratch>/base/HostRoomViewModel.swift
  python3 scripts/step6/ios/view-model/split.py <scratch>/base/HostRoomViewModel.swift <scratch>/all
  python3 scripts/step6/ios/view-model/verify_move.py --stage all <scratch>/base/HostRoomViewModel.swift <scratch>/all
The new files still have to be listed in the Xcode project before the app builds.
"""
import sys

sys.dont_write_bytecode = True

import vm_layout  # noqa: E402

if __name__ == "__main__":
    vm_layout.run("all", sys.argv, "usage: split.py <base HostRoomViewModel.swift> <output folder>")
