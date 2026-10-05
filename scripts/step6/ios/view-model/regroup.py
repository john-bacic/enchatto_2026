#!/usr/bin/env python3
"""Regroups HostRoomViewModel.swift inside its one file.

The class body keeps its stored properties, init, the PollIssue type and the derived helpers.
Everything else is written after it as ten `extension HostRoomViewModel` blocks in the same file
(Sync, Room, MessagePipeline, Messages, SendQueue, LostInTranslation, WordRush, EmojiMatch,
EmojiBingo, TruthOrDare), each under a `// MARK: - <name>` line. No line is edited and no access
level changes: `private` reaches an extension in the same file. Which lines go where is
groups.json.

Input:  the base file, exactly: apps/ios/ViewModels/HostRoomViewModel.swift at commit 1b68a6f,
        sha256 c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04, 2,106 lines.
        Any other file is refused (exit 2): the ranges fit that blob only.
Output: <output folder>/HostRoomViewModel.swift (2,147 lines). The folder must be outside the
        repository; the tree is never written.

Run:
  git show 1b68a6f:apps/ios/ViewModels/HostRoomViewModel.swift > <scratch>/base/HostRoomViewModel.swift
  python3 scripts/step6/ios/view-model/regroup.py <scratch>/base/HostRoomViewModel.swift <scratch>/regroup
  python3 scripts/step6/ios/view-model/verify_regroup.py <scratch>/base/HostRoomViewModel.swift <scratch>/regroup/HostRoomViewModel.swift
Copy the file into apps/ios/ViewModels only after the verifier exits 0.
"""
import sys

sys.dont_write_bytecode = True

import vm_layout  # noqa: E402

if __name__ == "__main__":
    vm_layout.run("regroup", sys.argv, "usage: regroup.py <base HostRoomViewModel.swift> <output folder>")
