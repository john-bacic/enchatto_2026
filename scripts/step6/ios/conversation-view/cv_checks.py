"""The checks behind verify.py. Not run by itself.

It never calls the code that writes the files (cv_layout.py). It reads the base file, the range
table, the widen list and the files under test, and decides from those alone whether the files
are the base file moved around and nothing else. Blank lines are left out of every comparison.

  table       tables.json and widen.json fit the base file: no line is in two ranges, a moved type
              is a whole top-level declaration, a moved member range is a whole number of members
              of the struct, no range boundary parts a doc comment or an attribute line from its
              declaration, no stored property lies in a moved range, every listed declaration is
              the line it is said to be and has a `private` to lose, and each keep-together range
              lies in one piece
  files       the folder holds exactly the files of the stages and no other file of the split
  (a) lines   across the files there are exactly the non-blank lines of the base file, the same
              number of times each, plus the listed added lines: the imports of each new file
              (an import that leaves the main file with its code is a moved line, not an added
              one) and one extension opener and closing brace per group. The declarations
              widen.json lists for the stages count without `private`; no other line may differ,
              and a listed one may not keep the word
  (b) stored  every stored property of the main view is declared once, directly in the struct, in
              the main file, and no extension holds a stored property
  (c) order   every file's non-blank lines are the expected ones in the expected order: each
              range unbroken, in base order, the ranges one after another as the table lists them
  (d) blocks  each keep-together range (the modifiers on `body`, the whole of `inputView`) is one
              unbroken run of lines in exactly one file
"""
import collections
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import swiftmove  # noqa: E402
from swiftmove import show  # noqa: E402
from cv_table import without_private  # noqa: E402

_STORED = re.compile(r"^    (?:@\w+(?:\([^)]*\))? )*(?:private )?(let|var) (\w+)")


def _text(base, n, widened):
    line = base[n - 1]
    if n in widened:
        new = without_private(line)
        if new is None:
            swiftmove.refuse("widen.json says line %d loses `private`, but the line is: %s" % (n, line.strip()))
        return new
    return line


def stored_declarations(base, table):
    """(base line, name) of every stored property of the main view."""
    found = []
    for first, last in table.stored_ranges:
        for n in range(first, last + 1):
            match = _STORED.match(base[n - 1])
            if match:
                found.append((n, match.group(2)))
    return found


def owners(table, stages):
    """Base line -> the file it goes to, for every line that leaves its place in the main file."""
    owner = {}
    clashes = []

    def claim(first, last, path):
        for n in range(first, last + 1):
            if n in owner:
                clashes.append((n, owner[n], path))
            owner[n] = path

    if "types" in stages:
        for entry in table.types:
            for first, last in entry["ranges"]:
                claim(first, last, table.type_file(entry))
            for n in entry["moved_import_lines"]:
                claim(n, n, table.type_file(entry))
    for group in table.groups:
        if group["name"] in stages:
            path = table.group_file(group["name"])
            for first, last in group["top_level"] + group["members"]:
                claim(first, last, path)
            for n in group["moved_import_lines"]:
                claim(n, n, path)
    return owner, clashes


def added_lines(table, stages):
    added = collections.Counter()
    if "types" in stages:
        for entry in table.types:
            added.update("import " + module for module in entry["imports"])
    for group in table.groups:
        if group["name"] in stages:
            added.update("import " + module for module in group["imports"])
            added[table.opener()] += 1
            added["}"] += 1
    return added


def moved_imports(base, table, stages):
    """The import lines of the base file that leave the main file, as a multiset of their text."""
    moved = collections.Counter()
    entries = (table.types if "types" in stages else []) + [g for g in table.groups if g["name"] in stages]
    for entry in entries:
        moved.update(base[n - 1] for n in entry["moved_import_lines"])
    return moved


def expected_sequences(base, table, stages, widened):
    """Relative path -> [(line text, where it comes from)], blank lines left out."""
    def run(first, last, what):
        return [(_text(base, n, widened), "line %d of the base file (%s, range %d-%d)" % (n, what, first, last))
                for n in range(first, last + 1) if not swiftmove.is_blank(base[n - 1])]

    sequences = {}
    if "types" in stages:
        for entry in table.types:
            path = table.type_file(entry)
            sequence = [("import " + module, "an import of " + path) for module in entry["imports"]]
            for first, last in entry["ranges"]:
                sequence += run(first, last, entry["file"])
            sequences[path] = sequence
    for group in table.groups:
        name = group["name"]
        if name not in stages:
            continue
        path = table.group_file(name)
        sequence = [("import " + module, "an import of " + path) for module in group["imports"]]
        for first, last in group["top_level"]:
            sequence += run(first, last, name + ", above the extension")
        sequence.append((table.opener(), "the opening line of the %s extension" % name))
        for first, last in group["members"]:
            sequence += run(first, last, name)
        sequence.append(("}", "the closing brace of the %s extension" % name))
        sequences[path] = sequence

    owner, _ = owners(table, stages)
    everything = table.everything(stages)
    mid_first, mid_last = table.mid_state["range"]
    main = []
    for n in range(1, len(base) + 1):
        in_mid = everything and mid_first <= n <= mid_last
        if n not in owner and not in_mid and not swiftmove.is_blank(base[n - 1]):
            main.append((_text(base, n, widened), "line %d of the base file (main file)" % n))
        if everything and n == table.mid_state["after"]:
            main += run(mid_first, mid_last, "the stored properties declared mid-file")
    sequences[table.main_file()] = main
    return sequences


def check_table(base, table, stages, widened, report):
    problems = []
    scan = swiftmove.scan_base(base, table.base["path"])
    struct_first, struct_last = table.struct
    if not re.match(r"^struct %s\b" % re.escape(table.type), base[struct_first - 1]) \
            or scan.block_end(struct_first - 1) != struct_last - 1:
        swiftmove.refuse("lines %d-%d of the base file are not the struct %s" % (struct_first, struct_last, table.type))
    owner, clashes = owners(table, table.stages)
    for n, one, two in clashes:
        problems.append("line %d is in two ranges: %s and %s" % (n, one, two))
    ranges = 0
    for entry in table.types:
        for first, last in entry["ranges"]:
            ranges += 1
            if first <= struct_last or not scan.balanced(first - 1, last - 1, 0):
                problems.append("%s range %d-%d is not whole top-level declarations below the struct"
                                % (entry["file"], first, last))
    for group in table.groups:
        for first, last in group["top_level"]:
            ranges += 1
            if last >= struct_first or not scan.balanced(first - 1, last - 1, 0):
                problems.append("%s range %d-%d is not whole top-level declarations above the struct"
                                % (group["name"], first, last))
        for first, last in group["members"]:
            ranges += 1
            if not (struct_first < first <= last < struct_last) or not scan.balanced(first - 1, last - 1, 1):
                problems.append("%s range %d-%d is not a whole number of members of the struct"
                                % (group["name"], first, last))
    for entry in table.types + table.groups:
        for n in entry["moved_import_lines"]:
            if base[n - 1] not in ["import " + module for module in entry["imports"]]:
                problems.append("line %d is not an import of %s" % (n, entry.get("file") or entry["name"]))
    pieces = {}
    for entry in table.types:
        for first, last in entry["ranges"]:
            pieces.update((n, (entry["file"], first)) for n in range(first, last + 1))
    for group in table.groups:
        for first, last in group["top_level"] + group["members"]:
            pieces.update((n, (group["name"], first)) for n in range(first, last + 1))
    mid_first, mid_last = table.mid_state["range"]
    pieces.update((n, "mid-file state") for n in range(mid_first, mid_last + 1))
    stranded = swiftmove.stranded_lead_ins(base, lambda n: pieces.get(n, "main file"))
    if swiftmove.LEAD_IN.match(base[table.mid_state["after"] - 1]):
        stranded.append(table.mid_state["after"])
    for n in stranded:
        problems.append("line %d is a doc comment or an attribute, and the line after it changes: %s"
                        % (n, show(base[n - 1])))
    stored = stored_declarations(base, table)
    counts = collections.Counter(swiftmove.nonblank(base))
    for n, name in stored:
        if n in owner:
            problems.append("stored property `%s` (line %d) lies in a range of %s: an extension cannot hold it"
                            % (name, n, owner[n]))
        if counts[base[n - 1]] != 1:
            problems.append("the declaration of `%s` (line %d) is not unique in the base file" % (name, n))
    for n, entry in sorted(widened.items()):
        if base[n - 1].strip() != entry["declaration"]:
            problems.append("widen.json line %d is not `%s` in the base file" % (n, entry["declaration"]))
        elif without_private(base[n - 1]) is None:
            problems.append("widen.json line %d has no `private` to lose" % n)
    for block in table.keep_together:
        first, last = block["range"]
        homes = {owner.get(n, table.main_file()) for n in range(first, last + 1)}
        cut = first <= table.mid_state["after"] < last or not (mid_last < first or last < mid_first)
        if len(homes) != 1 or cut:
            problems.append("%s (lines %d-%d) is cut by a range boundary" % (block["what"], first, last))
    report.check("table", "the range table does not fit the base file", problems,
                 "%d ranges, each whole declarations with their doc comments and attributes; "
                 "%d stored properties, none in a range; "
                 "%d declarations listed to lose `private` for these stages; %d keep-together ranges uncut"
                 % (ranges, len(stored), len(widened), len(table.keep_together)))


def check_files(table, stages, folder, report):
    expected = set(table.files(stages))
    present = set()
    if os.path.isfile(os.path.join(folder, table.main_file())):
        present.add(table.main_file())
    split_folder = os.path.join(folder, table.folder)
    if os.path.isdir(split_folder):
        present.update("%s/%s" % (table.folder, name) for name in os.listdir(split_folder) if name.endswith(".swift"))
    problems = (["missing file: " + name for name in sorted(expected - present)]
                + ["a file these stages do not have: " + name for name in sorted(present - expected)])
    report.check("files", "the folder does not hold the files of these stages", problems,
                 "%d file(s): %s and %d in %s/" % (len(expected), table.main_file(), len(expected) - 1, table.folder))


def check_lines(base, table, stages, widened, files, report):
    base_counter = collections.Counter(
        _text(base, n, widened) for n in range(1, len(base) + 1) if not swiftmove.is_blank(base[n - 1]))
    new_counter = collections.Counter()
    for lines in files.values():
        new_counter.update(swiftmove.nonblank(lines))
    moved = moved_imports(base, table, stages)
    listed = added_lines(table, stages) - moved          # a moved import is the base file's own line
    missing = base_counter - new_counter
    surplus = new_counter - base_counter
    unlisted = surplus - listed
    absent = listed - surplus

    hints = []
    original_of = {_text(base, n, widened): base[n - 1] for n in widened}
    for line in missing:
        if original_of.get(line) in unlisted:
            hints.append("listed in widen.json for these stages but still private: " + show(original_of[line]))
    for line in unlisted:
        for candidate in missing:
            if without_private(candidate) == line:
                hints.append("lost `private` but is not listed in widen.json for these stages: " + show(candidate))
    problems = (hints
                + swiftmove.counter_problems(missing, "line of the base file not found")
                + swiftmove.counter_problems(unlisted, "extra line, not a listed addition")
                + swiftmove.counter_problems(absent, "listed addition not found"))
    kinds = collections.Counter(
        "imports" if line.startswith("import ") else "closing braces" if line == "}" else "extension openers"
        for line in listed.elements())
    report.check("(a) lines", "the files are not the base file's lines plus the listed additions", problems,
                 "%d non-blank lines of the base file, each present the same number of times; %d added lines, "
                 "all listed (%s); %d import line(s) moved with their code; %d declarations without `private`, "
                 "all listed"
                 % (sum(base_counter.values()), sum(listed.values()),
                    ", ".join("%d %s" % (kinds[k], k) for k in ("imports", "extension openers", "closing braces")
                              if kinds[k]),
                    sum(moved.values()), len(widened)),
                 notes=["added: " + swiftmove.listing(listed)]
                 + (["moved with their code: " + swiftmove.listing(moved)] if moved else []))


def check_stored(base, table, widened, files, report):
    main_name = table.main_file()
    problems = []
    scans = {}
    for name, lines in sorted(files.items()):
        try:
            scans[name] = swiftmove.Scan(lines, name)
        except swiftmove.ScanError as error:
            problems.append("cannot read the structure of %s" % error)

    extensions = 0
    for name, scan in sorted(scans.items()):
        for first, last in scan.blocks(r"^extension %s\b" % re.escape(table.type)):
            extensions += 1
            for index, found in swiftmove.stored_properties_in(scan, first, last):
                problems.append("%s line %d: stored property `%s` inside an extension: %s"
                                % (name, index + 1, found, show(scan.lines[index])))

    stored = stored_declarations(base, table)
    span = "?"
    if main_name in scans:
        scan = scans[main_name]
        structs = scan.blocks(r"^struct %s\b" % re.escape(table.type))
        if len(structs) != 1:
            problems.append("%s declares the struct %s %d times" % (main_name, table.type, len(structs)))
        else:
            struct_first, struct_last = structs[0]
            span = "%d-%d" % (struct_first + 1, struct_last + 1)
            for n, property_name in stored:
                text = _text(base, n, widened)
                places = [(name, index) for name, lines in sorted(files.items())
                          for index, candidate in enumerate(lines) if candidate == text]
                if len(places) != 1:
                    problems.append("stored property `%s` (base line %d) is declared %d times"
                                    % (property_name, n, len(places)))
                    continue
                name, index = places[0]
                if not (name == main_name and struct_first < index < struct_last and scan.before[index] == 1):
                    problems.append("stored property `%s` (base line %d) is at %s line %d, outside the struct"
                                    % (property_name, n, name, index + 1))
            in_body = collections.Counter(
                found for _, found in swiftmove.stored_properties_in(scan, struct_first, struct_last))
            want = collections.Counter(property_name for _, property_name in stored)
            if in_body != want:
                problems.append("the struct's stored properties are not the %d listed: missing %s, unlisted %s"
                                % (len(stored), sorted((want - in_body).elements()), sorted((in_body - want).elements())))
    report.check("(b) stored", "a stored property is not in the struct", problems,
                 "%d stored properties, each declared once, directly in the struct (lines %s of %s); "
                 "%d extension blocks hold none" % (len(stored), span, main_name, extensions))


def check_order(base, table, stages, widened, files, report):
    problems = []
    sequences = expected_sequences(base, table, stages, widened)
    for name in sorted(sequences):
        if name not in files:
            continue                              # reported by the `files` check
        expected = sequences[name]
        actual = [(number, line) for number, line in enumerate(files[name], 1) if not swiftmove.is_blank(line)]
        at = swiftmove.first_difference([text for text, _ in expected], [line for _, line in actual])
        if at is None:
            continue
        if at >= len(actual):
            problems.append("%s ends early: expected %s: %s" % (name, expected[at][1], show(expected[at][0])))
        elif at >= len(expected):
            problems.append("%s line %d: a line after the expected end: %s" % (name, actual[at][0], show(actual[at][1])))
        else:
            problems.append("%s line %d: expected %s" % (name, actual[at][0], expected[at][1]))
            problems.append("    expected: " + show(expected[at][0]))
            problems.append("    found:    " + show(actual[at][1]))
    moved = sum(len(sequence) for name, sequence in sequences.items() if name != table.main_file())
    report.check("(c) order", "a moved range is broken up, out of order or in the wrong place", problems,
                 "%d files, each with its ranges unbroken, in base order and in the order the table lists; "
                 "%d lines in the new files, %d left in the main file"
                 % (len(sequences), moved, len(sequences[table.main_file()])))


def check_blocks(base, table, widened, files, report):
    problems = []
    found_in = []
    for block in table.keep_together:
        first, last = block["range"]
        wanted = [_text(base, n, widened) for n in range(first, last + 1) if not swiftmove.is_blank(base[n - 1])]
        places = []
        for name, lines in sorted(files.items()):
            packed = swiftmove.nonblank(lines)
            for start in range(len(packed) - len(wanted) + 1):
                if packed[start] == wanted[0] and packed[start:start + len(wanted)] == wanted:
                    places.append(name)
        if len(places) != 1:
            problems.append("%s (base lines %d-%d, %d non-blank lines) is an unbroken run in %d places, not one"
                            % (block["what"], first, last, len(wanted), len(places)))
        else:
            found_in.append("%s (%d lines) in %s" % (block["what"], len(wanted), places[0]))
    report.check("(d) blocks", "a keep-together range is broken up", problems, "; ".join(found_in))


def run(base, table, stages, files, folder):
    """Runs every check and exits: 0 when all pass, 1 otherwise. `files` is relative path -> lines."""
    widened = table.widened(stages)
    report = swiftmove.Report()
    check_table(base, table, stages, widened, report)
    check_files(table, stages, folder, report)
    check_lines(base, table, stages, widened, files, report)
    check_stored(base, table, widened, files, report)
    check_order(base, table, stages, widened, files, report)
    check_blocks(base, table, widened, files, report)
    report.finish()
