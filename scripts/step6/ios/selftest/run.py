#!/usr/bin/env python3
"""Self-test of the Swift move tools: the layout tools write what they are pinned to write, the
verifiers pass a correct result and fail a broken one, and every tool refuses the wrong input.

It runs the real tools as separate processes on the real base files and reads their exit codes
and the `ok` / `FAILED` word each check prints. The cases:

  regroup verifier (view-model/verify_regroup.py)
    passes   what regroup.py writes
    fails    a line dropped                         -> (a) lines
             a method body reordered inside         -> (c) order, with (a) and (b) still ok
             a stored property moved into an        -> (b) stored, with (a) still ok
               extension
             an extra line                          -> (a) lines
             and four more: a method moved to another extension, a declaration that lost
             `private`, a renamed MARK comment, a dropped closing brace
    passes   a result that differs in blank lines only, which compare_files.py then reports
  split verifiers (view-model/verify_move.py, conversation-view/verify.py)
    pass     every stage the layout tools write
    fail     the wrong stage's files, a file the stage does not have, a declaration opened
             without being listed, a listed one left private, lines swapped, a stored property
             in an extension, a line moved into the middle of `inputView`
  layout tools
    every file they write has the sha256 recorded in outputs.json
    the main file of the `games` stage is the regrouped file without its five game blocks,
    apart from the 20 listed access words; the same holds for `all` with all ten blocks
  refusals (exit 2)
    a base file that is not the recorded one: another stage's file, and, for every tool that
    takes the base file, a copy with the same number of lines and one byte changed, which only
    the sha256 tells apart; an output folder inside the repository
  data files
    members.json, widen.json and xref.json are what their tools derive from the base files
  tree state (tree_state.py, compare_files.py)
    a folder laid out like apps/ios is named base, regroup, games or types as the generated
    files are copied in, and stops being named once one of them is edited

Input:  <work folder>: a new or empty folder outside the repository; everything is written
        there and nothing is deleted. The base files come from git history (see base_blob.py);
        on a clone without that history pass them with --base-view-model <file> and
        --base-conversation-view <file>.
Exit:   0 every case behaved as stated, 1 at least one did not, 2 the test could not start.

Run:
  python3 scripts/step6/ios/selftest/run.py <work folder>
"""
import hashlib
import os
import re
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
sys.path.insert(0, TOOLS)

import base_blob  # noqa: E402
import swiftmove  # noqa: E402

VM = "view-model"
CV = "conversation-view"
CHECK_LINE = re.compile(r"^(table|files|\(a\) lines|\(b\) stored|\(c\) order|\(d\) blocks)\s+(ok|FAILED)", re.M)


def tool(path, *arguments):
    """Runs one tool; returns (exit code, everything it printed)."""
    done = subprocess.run([sys.executable, os.path.join(TOOLS, path)] + list(arguments),
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return done.returncode, done.stdout.decode("utf-8", "replace")


def outcomes(output):
    return {tag.split()[-1]: word for tag, word in CHECK_LINE.findall(output)}


class Suite:
    def __init__(self):
        self.passed, self.failed = 0, []

    def section(self, title):
        print("\n" + title)

    def record(self, name, problems, output=""):
        if problems:
            self.failed.append(name)
            print("  FAIL  " + name)
            for problem in problems:
                print("          " + problem)
            for line in output.strip().split("\n")[-12:]:
                print("          | " + line)
        else:
            self.passed += 1
            print("  ok    " + name)

    def expect(self, name, result, code, **checks):
        """`result` is what `tool` returned. `checks` names checks by their last word (lines,
        stored, order, blocks, files, table) with the word each must have printed."""
        got_code, output = result
        problems = []
        if got_code != code:
            problems.append("exit code %d, expected %d" % (got_code, code))
        seen = outcomes(output)
        for check, word in checks.items():
            if seen.get(check) != word:
                problems.append("check `%s` printed %s, expected %s" % (check, seen.get(check), word))
        self.record(name, problems, output)

    def same(self, name, one, two):
        self.record(name, [] if one == two else ["the two differ"])


def read(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read().split("\n")


def write(path, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(lines))
    return path


def only(lines, text, after=0):
    """Index of the one line equal to `text` at or after index `after`."""
    found = [i for i in range(after, len(lines)) if lines[i] == text]
    if len(found) != 1:
        raise SystemExit("self-test: expected one line %r, found %d" % (text, len(found)))
    return found[0]


def first(lines, text, after=0):
    return next(i for i in range(after, len(lines)) if lines[i] == text)


def copy_folder(source, target):
    shutil.copytree(source, target)
    return target


def sha256_of(path):
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def one_byte_off(base, target):
    """Writes a copy of the base file whose first letter has the other case, and returns its path.

    The copy has the base file's length and line count, so the sha256 is the only check that can
    tell the two apart: a tool that accepts the copy is not tied to its blob."""
    with open(base, "rb") as handle:
        data = handle.read()
    changed = data[:1].swapcase() + data[1:]
    if changed == data:
        raise SystemExit("self-test: %s does not start with a letter" % base)
    os.makedirs(os.path.dirname(target))
    with open(target, "wb") as handle:
        handle.write(changed)
    return target


# ---------------------------------------------------------------------------------------------

def view_model_cases(suite, work, base):
    main = "HostRoomViewModel.swift"
    regroup_dir = os.path.join(work, VM, "regroup")
    suite.section("view model: regroup")
    suite.expect("regroup.py writes the regrouped file", tool(VM + "/regroup.py", base, regroup_dir), 0)
    good = os.path.join(regroup_dir, main)
    suite.expect("a correct regroup passes", tool(VM + "/verify_regroup.py", base, good), 0,
                 table="ok", lines="ok", stored="ok", order="ok")

    lines = read(good)
    guard = "        guard !pushRegistered else { return }"
    assign = "        pushRegistered = true"
    stored = "    private var pushRegistered = false"
    opener = "extension HostRoomViewModel {"

    def broken(name, change):
        changed = list(lines)
        change(changed)
        return write(os.path.join(work, VM, "broken-regroup", name, main), changed)

    def drop(changed):
        del changed[only(changed, guard)]

    def reorder(changed):
        i = only(changed, guard)
        assert changed[i + 1] == assign
        changed[i], changed[i + 1] = changed[i + 1], changed[i]

    def stored_into_extension(changed):
        line = changed.pop(only(changed, stored))
        changed.insert(first(changed, opener, only(changed, "// MARK: - Sync")) + 1, line)

    def extra(changed):
        changed.insert(only(changed, guard) + 1, assign)

    def method_to_other_extension(changed):
        start = only(changed, "    private func registerForPushIfNeeded() {")
        end = first(changed, "    }", start)
        method = changed[start:end + 1]
        del changed[start:end + 1]
        at = first(changed, opener, only(changed, "// MARK: - Room")) + 1
        changed[at:at] = method

    def lost_private(changed):
        i = only(changed, "    private func registerForPushIfNeeded() {")
        changed[i] = changed[i].replace("private ", "", 1)

    def renamed_mark(changed):
        changed[only(changed, "// MARK: - Sync")] = "// MARK: - Syncing"

    def dropped_brace(changed):
        del changed[first(changed, "}", only(changed, "// MARK: - Sync"))]

    def blank_lines_only(changed):
        changed.insert(only(changed, guard), "")

    verify = VM + "/verify_regroup.py"
    suite.expect("broken: a line dropped", tool(verify, base, broken("dropped-line", drop)), 1,
                 lines="FAILED", stored="ok")
    suite.expect("broken: a method body reordered inside", tool(verify, base, broken("reordered-body", reorder)), 1,
                 lines="ok", stored="ok", order="FAILED")
    suite.expect("broken: a stored property moved into an extension",
                 tool(verify, base, broken("stored-in-extension", stored_into_extension)), 1,
                 lines="ok", stored="FAILED")
    suite.expect("broken: an extra line", tool(verify, base, broken("extra-line", extra)), 1,
                 lines="FAILED", stored="ok")
    suite.expect("broken: a method moved to another extension",
                 tool(verify, base, broken("method-elsewhere", method_to_other_extension)), 1,
                 lines="ok", stored="ok", order="FAILED")
    suite.expect("broken: a declaration lost `private`", tool(verify, base, broken("lost-private", lost_private)), 1,
                 lines="FAILED")
    suite.expect("broken: a MARK comment renamed", tool(verify, base, broken("renamed-mark", renamed_mark)), 1,
                 lines="FAILED")
    suite.expect("broken: a closing brace dropped", tool(verify, base, broken("dropped-brace", dropped_brace)), 1,
                 lines="FAILED", stored="FAILED")
    blank = broken("blank-lines-only", blank_lines_only)
    suite.expect("blank lines only: the verifier passes", tool(verify, base, blank), 0)
    suite.expect("blank lines only: compare_files.py reports it",
                 tool("compare_files.py", regroup_dir, os.path.dirname(blank)), 1)

    suite.section("view model: split into files")
    games_dir, all_dir = os.path.join(work, VM, "games"), os.path.join(work, VM, "all")
    move = VM + "/verify_move.py"
    suite.expect("split_batch1.py writes six files", tool(VM + "/split_batch1.py", base, games_dir), 0)
    suite.expect("split.py writes eleven files", tool(VM + "/split.py", base, all_dir), 0)
    suite.expect("the games stage passes", tool(move, "--stage", "games", base, games_dir), 0,
                 table="ok", files="ok", lines="ok", stored="ok", order="ok")
    suite.expect("the full split passes", tool(move, "--stage", "all", base, all_dir), 0,
                 table="ok", files="ok", lines="ok", stored="ok", order="ok")
    suite.expect("broken: the games files checked as the full split", tool(move, "--stage", "all", base, games_dir), 1,
                 files="FAILED")

    def broken_split(name, source, file, change):
        folder = copy_folder(source, os.path.join(work, VM, "broken-split", name))
        changed = read(os.path.join(folder, file))
        change(changed)
        write(os.path.join(folder, file), changed)
        return folder

    def open_unlisted(changed):
        i = only(changed, "    private var cancellables = Set<AnyCancellable>()")
        changed[i] = changed[i].replace("private ", "", 1)

    def close_listed(changed):
        i = only(changed, "    let api: EnchattoAPI")
        changed[i] = "    private let api: EnchattoAPI"

    suite.expect("broken: a declaration opened that the list does not name",
                 tool(move, "--stage", "games", base, broken_split("opened-unlisted", games_dir, main, open_unlisted)), 1,
                 lines="FAILED")
    suite.expect("broken: a listed declaration left private",
                 tool(move, "--stage", "games", base, broken_split("left-private", games_dir, main, close_listed)), 1,
                 lines="FAILED")
    suite.expect("broken: two lines swapped in an extension file",
                 tool(move, "--stage", "all", base,
                      broken_split("swapped", all_dir, "HostRoomViewModel+Sync.swift", reorder)), 1,
                 lines="ok", stored="ok", order="FAILED")
    leftover = copy_folder(games_dir, os.path.join(work, VM, "broken-split", "leftover-file"))
    shutil.copy(os.path.join(all_dir, "HostRoomViewModel+Sync.swift"), leftover)
    suite.expect("broken: a file the stage does not have", tool(move, "--stage", "games", base, leftover), 1,
                 files="FAILED")

    widen = swiftmove.load_json(os.path.join(TOOLS, VM, "widen.json"))["declarations"]
    groups = swiftmove.load_json(os.path.join(TOOLS, VM, "groups.json"))["groups"]

    def regrouped_without(names, entries):
        """The regrouped file with the named extension blocks cut out and the listed words removed."""
        changed = list(lines)
        for name in names:
            mark = only(changed, "// MARK: - " + name)
            del changed[mark - 1:first(changed, "}", mark) + 1]
        for entry in entries:
            found = [i for i, line in enumerate(changed) if line.strip() == entry["declaration"]]
            if found:
                changed[found[0]] = changed[found[0]].replace(entry["loses"] + " ", "", 1)
        return changed

    suite.same("the games main file is the regrouped file without its five game blocks, apart from 20 access words",
               regrouped_without([g["name"] for g in groups if g["stage"] == "games"],
                                 [e for e in widen if e["stage"] == "games"]),
               read(os.path.join(games_dir, main)))
    suite.same("the full split's main file is the regrouped file without its ten blocks, apart from the listed words",
               regrouped_without([g["name"] for g in groups], widen), read(os.path.join(all_dir, main)))

    game_files = ["HostRoomViewModel+%s.swift" % g["name"] for g in groups if g["stage"] == "games"]
    suite.same("the five game files are the same whether or not the core groups have moved",
               [read(os.path.join(games_dir, name)) for name in game_files],
               [read(os.path.join(all_dir, name)) for name in game_files])

    suite.section("view model: refusals and data files")
    inside = os.path.join(HERE, "must-not-be-written")
    suite.expect("regroup.py refuses a file that is not the base file", tool(VM + "/regroup.py", good, os.path.join(work, VM, "refused")), 2)
    suite.expect("split_batch1.py refuses the regrouped file as its input",
                 tool(VM + "/split_batch1.py", good, os.path.join(work, VM, "refused")), 2)
    suite.expect("split.py refuses the regrouped file as its input", tool(VM + "/split.py", good, os.path.join(work, VM, "refused")), 2)
    suite.expect("verify_regroup.py refuses a base file that is not the recorded one", tool(verify, good, good), 2)
    suite.expect("verify_move.py refuses a base file that is not the recorded one", tool(move, "--stage", "all", good, all_dir), 2)
    near = one_byte_off(base, os.path.join(work, VM, "one-byte-off", main))
    refused = os.path.join(work, VM, "refused")
    for name, result in [
        ("regroup.py", tool(VM + "/regroup.py", near, refused)),
        ("split_batch1.py", tool(VM + "/split_batch1.py", near, refused)),
        ("split.py", tool(VM + "/split.py", near, refused)),
        ("verify_regroup.py", tool(verify, near, good)),
        ("verify_move.py", tool(move, "--stage", "all", near, all_dir)),
        ("members.py --check", tool(VM + "/members.py", "--check", near)),
        ("widen_calc.py --check", tool(VM + "/widen_calc.py", "--check", near)),
    ]:
        suite.expect("%s refuses a file one byte away from the base file" % name, result, 2)
    suite.record("and no refused run wrote anything", ["%s exists" % refused] if os.path.exists(refused) else [])
    suite.expect("regroup.py refuses an output folder inside the repository", tool(VM + "/regroup.py", base, inside), 2)
    suite.record("and writes nothing there", ["%s exists" % inside] if os.path.exists(inside) else [])
    suite.expect("members.json is what members.py derives", tool(VM + "/members.py", "--check", base), 0)
    suite.expect("widen.json is what widen_calc.py derives", tool(VM + "/widen_calc.py", "--check", base), 0)
    return {"regroup": regroup_dir, "games": games_dir, "all": all_dir}


def conversation_view_cases(suite, work, base):
    main = "HostConversationView.swift"
    table = swiftmove.load_json(os.path.join(TOOLS, CV, "tables.json"))
    verify = CV + "/verify.py"
    folders = {}
    suite.section("room screen: split into files")
    for stages in ["types", "all"] + ["types," + group["name"] for group in table["groups"]]:
        folder = os.path.join(work, CV, stages.replace(",", "-"))
        folders[stages] = folder
        suite.expect("split.py %s" % stages, tool(CV + "/split.py", base, folder, stages), 0)
        suite.expect("stages %s pass" % stages, tool(verify, "--stages", stages, base, folder), 0,
                     table="ok", files="ok", lines="ok", stored="ok", order="ok", blocks="ok")
    suite.expect("the type files are the same whether or not the members have moved",
                 tool("compare_files.py", os.path.join(folders["types"], "Conversation"),
                      os.path.join(folders["all"], "Conversation")), 0)
    suite.expect("broken: the type files checked as the full split", tool(verify, "--stages", "all", base, folders["types"]), 1,
                 files="FAILED")

    def broken(name, file, change, also=None):
        folder = copy_folder(folders["all"], os.path.join(work, CV, "broken", name))
        changed = read(os.path.join(folder, file))
        other = read(os.path.join(folder, also)) if also else None
        change(changed, other) if also else change(changed)
        write(os.path.join(folder, file), changed)
        if also:
            write(os.path.join(folder, also), other)
        return folder

    header = "Conversation/HostConversationView+Header.swift"
    input_file = "Conversation/HostConversationView+Input.swift"
    presentations = "Conversation/HostConversationView+Presentations.swift"
    opener = "extension HostConversationView {"

    def open_unlisted(changed):
        i = only(changed, "    @Environment(\\.scenePhase) private var scenePhase")
        changed[i] = changed[i].replace("private ", "", 1)

    def close_listed(changed):
        changed[only(changed, "struct SendButton: View {")] = "private struct SendButton: View {"

    def swap(changed):
        i = only(changed, "    var qrOverlay: some View {")
        changed[i - 1], changed[i] = changed[i], changed[i - 1]

    def stored_into_extension(changed, other):
        line = changed.pop(only(changed, "    @State var toolsOpen = false"))
        other.insert(only(other, opener) + 1, line)

    def into_input_view(changed):
        closing = max(i for i, line in enumerate(changed) if line == "    }")
        line = changed.pop(closing)
        changed.insert(only(changed, "    var inputView: some View {") + 3, line)

    cases = [
        ("a declaration opened that the list does not name", broken("opened-unlisted", main, open_unlisted),
         dict(lines="FAILED")),
        ("a listed declaration left private", broken("left-private", "Conversation/VoiceInputViews.swift", close_listed),
         dict(lines="FAILED")),
        ("two lines swapped in an extension file", broken("swapped", header, swap),
         dict(lines="ok", order="FAILED")),
        ("a stored property moved into an extension", broken("stored-in-extension", main, stored_into_extension, input_file),
         dict(lines="ok", stored="FAILED")),
        ("a line moved into the middle of inputView", broken("input-view-cut", presentations, into_input_view),
         dict(lines="ok", order="FAILED", blocks="FAILED")),
    ]
    for name, folder, checks in cases:
        suite.expect("broken: " + name, tool(verify, "--stages", "all", base, folder), 1, **checks)
    leftover = copy_folder(folders["types"], os.path.join(work, CV, "broken", "leftover-file"))
    shutil.copy(os.path.join(folders["all"], header), os.path.join(leftover, "Conversation"))
    suite.expect("broken: a file the stages do not have", tool(verify, "--stages", "types", base, leftover), 1,
                 files="FAILED", lines="ok", order="ok")

    suite.section("room screen: refusals and data files")
    wrong = os.path.join(folders["all"], main)
    suite.expect("split.py refuses a file that is not the base file", tool(CV + "/split.py", wrong, os.path.join(work, CV, "refused"), "all"), 2)
    suite.expect("verify.py refuses a base file that is not the recorded one", tool(verify, "--stages", "all", wrong, folders["all"]), 2)
    near = one_byte_off(base, os.path.join(work, CV, "one-byte-off", main))
    refused = os.path.join(work, CV, "refused")
    for name, result in [
        ("split.py", tool(CV + "/split.py", near, refused, "all")),
        ("verify.py", tool(verify, "--stages", "all", near, folders["all"])),
        ("widen_list.py --check", tool(CV + "/widen_list.py", "--check", near)),
        ("members.py --check", tool(CV + "/members.py", "--check", near)),
        ("xref.py --check", tool(CV + "/xref.py", "--check", near)),
    ]:
        suite.expect("%s refuses a file one byte away from the base file" % name, result, 2)
    suite.record("and no refused run wrote anything", ["%s exists" % refused] if os.path.exists(refused) else [])
    suite.expect("widen.json is what widen_list.py reads off the split", tool(CV + "/widen_list.py", "--check", base), 0)
    suite.expect("members.json is what members.py derives", tool(CV + "/members.py", "--check", base), 0)
    suite.expect("xref.json is what xref.py derives", tool(CV + "/xref.py", "--check", base), 0)
    suite.expect("widen.json agrees with the cross-reference", tool(CV + "/widen_xref.py"), 0)
    return {"types": folders["types"], "all": folders["all"]}


def tree_state_cases(suite, work, vm_base, cv_base, written):
    suite.section("tree state")
    ios = os.path.join(work, "tree", "ios")
    models, views = os.path.join(ios, "ViewModels"), os.path.join(ios, "Views")
    os.makedirs(models)
    os.makedirs(views)
    shutil.copy(vm_base, models)
    shutil.copy(cv_base, views)
    write(os.path.join(models, "HostStartRoomViewModel.swift"), ["// a file of the folder that is not part of the split", ""])

    def state(*expectations):
        arguments = [ios]
        for expectation in expectations:
            arguments += ["--expect", expectation]
        return tool("tree_state.py", *arguments)

    suite.expect("both base files: base, base", state("view-model=base", "conversation-view=base"), 0)
    shutil.copy(os.path.join(written[VM]["regroup"], "HostRoomViewModel.swift"), models)
    suite.expect("the regrouped file copied in: regroup", state("view-model=regroup", "conversation-view=base"), 0)
    suite.expect("and not games", state("view-model=games"), 1)
    shutil.copytree(written[VM]["games"], models, dirs_exist_ok=True)
    shutil.copytree(written[CV]["types"], views, dirs_exist_ok=True)
    suite.expect("the game files and the type files copied in: games, types",
                 state("view-model=games", "conversation-view=types"), 0)
    suite.expect("compare_files.py agrees for the view model", tool("compare_files.py", written[VM]["games"], models), 0)
    edited = os.path.join(models, "HostRoomViewModel+WordRush.swift")
    write(edited, read(edited) + ["// edited after it was generated"])
    suite.expect("a generated file edited afterwards: the state is unknown", state("view-model=games"), 1)
    suite.expect("and compare_files.py reports it", tool("compare_files.py", written[VM]["games"], models), 1)


def pinned_output_cases(suite, written):
    """`written` is split name -> stage -> the folder that stage was written to."""
    suite.section("pinned output")
    pinned = swiftmove.load_json(os.path.join(HERE, "outputs.json"))
    for split in (VM, CV):
        for stage, files in sorted(pinned[split].items()):
            folder = written[split][stage]
            present = sorted(os.path.relpath(os.path.join(root, name), folder)
                             for root, _, names in os.walk(folder) for name in names)
            problems = []
            if present != sorted(files):
                problems.append("files written: %s; recorded: %s" % (present, sorted(files)))
            problems += ["%s has sha256 %s, recorded %s" % (name, sha256_of(os.path.join(folder, name)), digest)
                         for name, digest in sorted(files.items())
                         if name in present and sha256_of(os.path.join(folder, name)) != digest]
            suite.record("%s, stage %s: %d file(s) with the recorded sha256" % (split, stage, len(files)), problems)


def main():
    arguments = sys.argv[1:]
    given = {}
    for option in ("--base-view-model", "--base-conversation-view"):
        if option in arguments:
            at = arguments.index(option)
            given[option] = arguments[at + 1] if at + 1 < len(arguments) else None
            del arguments[at:at + 2]
    if len(arguments) != 1 or arguments[0].startswith("-") or None in given.values():
        sys.stderr.write("usage: run.py <work folder> [--base-view-model <file>] [--base-conversation-view <file>]\n")
        sys.exit(swiftmove.EXIT_REFUSED)
    work = swiftmove.output_dir(arguments[0])
    if os.listdir(work):
        swiftmove.refuse("%s is not empty: give a new or empty folder" % work)
    bases = os.path.join(work, "base")
    os.makedirs(bases)
    vm_base = given.get("--base-view-model") or base_blob.fetch(VM, bases)
    cv_base = given.get("--base-conversation-view") or base_blob.fetch(CV, bases)
    print("python %s, work folder %s" % (sys.version.split()[0], work))

    suite = Suite()
    written = {VM: view_model_cases(suite, work, vm_base), CV: conversation_view_cases(suite, work, cv_base)}
    pinned_output_cases(suite, written)
    tree_state_cases(suite, work, vm_base, cv_base, written)

    total = suite.passed + len(suite.failed)
    if suite.failed:
        print("\nFAILED: %d of %d cases" % (len(suite.failed), total))
        for name in suite.failed:
            print("  " + name)
        sys.exit(swiftmove.EXIT_FAILED)
    print("\nall %d cases behaved as stated" % total)
    sys.exit(swiftmove.EXIT_OK)


if __name__ == "__main__":
    main()
