#!/usr/bin/env python3
"""Splits HostRoomViewModel.swift into six files: the five game groups leave, the core stays.

HostRoomViewModel+LostInTranslation.swift, +WordRush, +EmojiMatch, +EmojiBingo and +TruthOrDare
each hold one `extension HostRoomViewModel` with the imports the group needs. The main file is
the regrouped file (see regroup.py) without those five blocks: the class body, then Sync, Room,
MessagePipeline, Messages and SendQueue as extension blocks. The 20 declarations marked `games`
in widen.json lose `private` or `private(set)`, because another file now uses them; no other
line is edited.

Input:  the base file, exactly: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f,
        sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04, 2,106 lines.
        It is the file from before the regroup, not the regrouped one: every range in
        groups.json and every line in widen.json is a line of that blob. Any other file is
        refused (exit 2).
Output: six files in <output folder>, which must be outside the repository.

Run:
  git show 1b68a6f:apps/ios/ViewModels/HostRoomViewModel.swift > <scratch>/base/HostRoomViewModel.swift
  python3 scripts/step6/ios/view-model/split_batch1.py <scratch>/base/HostRoomViewModel.swift <scratch>/games
  python3 scripts/step6/ios/view-model/verify_move.py --stage games <scratch>/base/HostRoomViewModel.swift <scratch>/games
The new files still have to be listed in the Xcode project before the app builds.
"""
import sys

sys.dont_write_bytecode = True

import vm_layout  # noqa: E402

if __name__ == "__main__":
    vm_layout.run("games", sys.argv, "usage: split_batch1.py <base HostRoomViewModel.swift> <output folder>")
