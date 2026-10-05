#!/usr/bin/env python3
"""Splits HostConversationView.swift: helper types into eight files, members into five
extension files, leaving a short main file.

Stages (a comma list, or `all`):
  types          the helper types below the main view move to Conversation/VoiceInputViews.swift,
                 GameSummaryBanner.swift, SystemMessageRow.swift, TypingBubble.swift,
                 QRCodeFloatingPanel.swift, OfflineTranslator.swift, VibeMeter.swift and
                 ConversationHeaderParts.swift; 12 of them lose `private`
  Sheets, Header, MessageList, Input, Presentations
                 the main view's members move to Conversation/HostConversationView+<stage>.swift,
                 each one `extension HostConversationView`
`types` has to be in the tree before Header, MessageList or Input compile: they use those types.
With `all`, 82 declarations lose `private` in total and the main file is 192 lines; the nine
stored properties declared mid-file move up beside the others, because an extension cannot hold
them. tables.json holds every range; widen.json lists every declaration that loses `private`.

Input:  the base file, exactly: apps/ios/Views/HostConversationView.swift at commit 1b68a6f,
        sha256 16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83, 3,694 lines.
        It is the file from before any stage, also when some stages are already in the tree: run
        the larger set of stages on the same blob and copy in the files that are new. Any other
        file is refused (exit 2): the ranges fit that blob only.
Output: <output folder>/HostConversationView.swift and <output folder>/Conversation/*.swift,
        laid out like apps/ios/Views. The folder must be outside the repository.

Run:
  git show 1b68a6f:apps/ios/Views/HostConversationView.swift > <scratch>/base/HostConversationView.swift
  python3 scripts/step6/ios/conversation-view/split.py <scratch>/base/HostConversationView.swift <scratch>/types types
  python3 scripts/step6/ios/conversation-view/verify.py --stages types <scratch>/base/HostConversationView.swift <scratch>/types
  python3 scripts/step6/ios/conversation-view/split.py <scratch>/base/HostConversationView.swift <scratch>/all all
  python3 scripts/step6/ios/conversation-view/verify.py --stages all <scratch>/base/HostConversationView.swift <scratch>/all
The new files still have to be listed in the Xcode project before the app builds.
"""
import os
import sys

sys.dont_write_bytecode = True

from cv_table import Table  # noqa: E402  (first: it puts swiftmove's folder on the import path)
import swiftmove  # noqa: E402
import cv_layout  # noqa: E402


def main():
    if len(sys.argv) not in (3, 4) or sys.argv[1].startswith("-"):
        sys.stderr.write("usage: split.py <base HostConversationView.swift> <output folder> [stages, default all]\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    table = Table()
    stages = table.parse_stages(sys.argv[3] if len(sys.argv) == 4 else "all")
    lines = swiftmove.read_base(sys.argv[1], table.base)
    out_dir = swiftmove.output_dir(sys.argv[2])
    files, opened, _ = cv_layout.build(lines, table, stages)
    for path in table.files(stages):
        swiftmove.write_lines(os.path.join(out_dir, path), files[path])
        print("%5d lines  %s" % (len(files[path]), os.path.join(out_dir, path)))
    print("stages %s: %d file(s), %d declaration(s) without `private`, main file %d lines"
          % (",".join(stages), len(files), len(opened), len(files[table.main_file()])))


if __name__ == "__main__":
    main()
