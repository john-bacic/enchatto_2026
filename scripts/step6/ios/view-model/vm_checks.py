"""The checks behind verify_regroup.py and verify_move.py. Not run by itself.

It never calls the code that writes the files (vm_layout.py). It reads the base file, the range
table and the files under test, and decides from those alone whether the files are the base file
moved around and nothing else. Blank lines are left out of every comparison.

  table       the table itself is sound: ranges do not overlap, each is a whole number of members
              of the class (braces balance at member level), no range boundary parts a doc
              comment or an attribute line from its declaration, every listed declaration has the
              access word it is said to lose, and no stored property lies in a moved range
  (a) lines   the files hold exactly the non-blank lines of the base file plus the listed added
              lines (MARK comments, extension openers and closers, imports), the same number of
              times each. A declaration listed in widen.json for the stage counts without its
              access word; any other changed line is a missing line and an unlisted one
  (b) stored  every stored property of the class is declared once, directly in the class body,
              and no extension block holds a stored property
  (c) order   in each file the non-blank lines are, one after another: the kept lines in base
              order, then each range of each group in the order the table lists them, every range
              unbroken and in its base order
  files       (folders only) the folder holds the stage's files and no other file of the type
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
from vm_table import text_of, without_access_word  # noqa: E402

_STORED = re.compile(r"^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:private\(set\)|private)\s+)*(var|let)\s+(\w+)")


def added_lines(table, stage):
    """The lines a stage adds to the base file's own, with how many of each."""
    out = set(table.groups_out(stage))
    added = collections.Counter()
    for group in table.groups:
        added[table.opener()] += 1
        added["}"] += 1
        if group["name"] in out:
            for module in group["imports"]:
                added["import " + module] += 1
        else:
            added["// MARK: - " + group["name"]] += 1
    return added


def expected_sequences(base, table, stage):
    """File name -> [(line text, where it comes from)], blank lines left out."""
    widened = table.widened(stage)
    out = set(table.groups_out(stage))
    main = [(text_of(base, n, widened), "line %d of the base file (class body)" % n)
            for n in range(1, len(base) + 1)
            if n not in table.owner and not swiftmove.is_blank(base[n - 1])]
    sequences = {}
    for group in table.groups:
        name = group["name"]
        inner = []
        for first, last in group["blocks"]:
            inner += [(text_of(base, n, widened),
                       "line %d of the base file (%s, range %d-%d)" % (n, name, first, last))
                      for n in range(first, last + 1) if not swiftmove.is_blank(base[n - 1])]
        block = ([(table.opener(), "the opening line of the %s extension" % name)] + inner
                 + [("}", "the closing brace of the %s extension" % name)])
        if name in out:
            sequences[table.group_file(name)] = (
                [("import " + module, "an import of %s" % table.group_file(name))
                 for module in group["imports"]] + block)
        else:
            main += [("// MARK: - " + name, "the MARK line of the %s extension" % name)] + block
    sequences[table.main_file()] = main
    return sequences


def check_table(base, table, stage, report):
    problems = []
    scan = swiftmove.scan_base(base, table.base["path"])
    class_first = table.class_line - 1
    if not re.match(r"^(?:final )?class %s\b" % re.escape(table.type), base[class_first]) \
            or scan.before[class_first] != 0 or scan.after[class_first] != 1:
        swiftmove.refuse("line %d of the base file does not open the class %s" % (table.class_line, table.type))
    class_last = scan.block_end(class_first)
    for n, one, two in table.overlaps:
        problems.append("line %d is in both %s and %s" % (n, one, two))
    ranges = 0
    for group in table.groups:
        for first, last in group["blocks"]:
            ranges += 1
            where = "%s range %d-%d" % (group["name"], first, last)
            if not (class_first + 1 < first <= last < class_last + 1):
                problems.append("%s is not inside the class body (lines %d-%d)"
                                % (where, class_first + 2, class_last))
            elif not scan.balanced(first - 1, last - 1, 1):
                problems.append("%s cuts through a member: its braces do not balance at member level" % where)
    pieces = {}
    for group in table.groups:
        for first, last in group["blocks"]:
            for n in range(first, last + 1):
                pieces[n] = (group["name"], first)
    for n in swiftmove.stranded_lead_ins(base, lambda n: pieces.get(n, "class body")):
        problems.append("line %d is a doc comment or an attribute, and its declaration on line %d moves "
                        "without it: %s" % (n, n + 1, show(base[n - 1])))
    widened = table.widened(stage)
    if widened:
        for entry in swiftmove.load_json(table.widen_path)["declarations"]:
            line = entry["line"]
            if line not in widened:
                continue
            if base[line - 1].strip() != entry["declaration"]:
                problems.append("widen.json line %d is not `%s` in the base file" % (line, entry["declaration"]))
            elif without_access_word(base[line - 1], entry["loses"]) is None:
                problems.append("widen.json line %d has no `%s` to lose" % (line, entry["loses"]))
    stored = table.stored_properties()
    counts = collections.Counter(swiftmove.nonblank(base))
    for line, name in stored:
        match = _STORED.match(base[line - 1])
        if not match or match.group(2) != name:
            problems.append("members.json line %d is not the declaration of `%s`" % (line, name))
        elif line in table.owner:
            problems.append("stored property `%s` (line %d) lies in a range of %s: an extension cannot hold it"
                            % (name, line, table.owner[line]))
        elif counts[base[line - 1]] != 1:
            problems.append("the declaration of `%s` (line %d) is not unique in the base file" % (name, line))
    report.check("table", "the range table does not fit the base file", problems,
                 "%d ranges in %d groups, each a whole number of members with its doc comments and attributes; "
                 "%d stored properties, none in a range; %d declarations listed to lose an access word"
                 % (ranges, len(table.groups), len(stored), len(widened)))


def check_lines(base, table, stage, files, report):
    widened = table.widened(stage)
    base_counter = collections.Counter(
        text_of(base, n, widened) for n in range(1, len(base) + 1) if not swiftmove.is_blank(base[n - 1]))
    new_counter = collections.Counter()
    for lines in files.values():
        new_counter.update(swiftmove.nonblank(lines))
    listed = added_lines(table, stage)
    missing = base_counter - new_counter
    surplus = new_counter - base_counter
    unlisted = surplus - listed
    absent = listed - surplus

    # Name the two ways a declaration's access word can be wrong, which otherwise read as an
    # unrelated missing line and an unrelated extra one.
    hints = []
    original_of = {text_of(base, n, widened): base[n - 1] for n in widened}
    for line in missing:
        if original_of.get(line) in unlisted:
            hints.append("listed in widen.json for this stage but still has its access word: "
                         + show(original_of[line]))
    for line in unlisted:
        for loses in ("private", "private(set)"):
            for candidate in missing:
                if without_access_word(candidate, loses) == line:
                    hints.append("lost `%s` but is not listed in widen.json for this stage: %s"
                                 % (loses, show(candidate)))
    problems = (hints
                + swiftmove.counter_problems(missing, "line of the base file not found")
                + swiftmove.counter_problems(unlisted, "extra line, not a listed addition")
                + swiftmove.counter_problems(absent, "listed addition not found"))
    kinds = collections.Counter(
        "MARK comments" if line.startswith("// MARK") else "imports" if line.startswith("import ")
        else "closing braces" if line == "}" else "extension openers"
        for line in listed.elements())
    report.check("(a) lines", "the files are not the base file's lines plus the listed additions", problems,
                 "%d non-blank lines of the base file, each present the same number of times; %d added lines, "
                 "all listed (%s); %d declarations without their access word, all listed"
                 % (sum(base_counter.values()), sum(listed.values()),
                    ", ".join("%d %s" % (kinds[k], k)
                              for k in ("MARK comments", "extension openers", "closing braces", "imports") if kinds[k]),
                    len(widened)),
                 notes=["added: " + swiftmove.listing(listed)])


def check_stored(base, table, stage, files, report):
    widened = table.widened(stage)
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

    stored = table.stored_properties()
    span = "?"
    if main_name in scans:
        scan = scans[main_name]
        classes = scan.blocks(r"^(?:final )?class %s\b" % re.escape(table.type))
        if len(classes) != 1:
            problems.append("%s declares the class %s %d times" % (main_name, table.type, len(classes)))
        else:
            class_first, class_last = classes[0]
            span = "%d-%d" % (class_first + 1, class_last + 1)
            for line, property_name in stored:
                text = text_of(base, line, widened)
                places = [(name, index) for name, lines in sorted(files.items())
                          for index, candidate in enumerate(lines) if candidate == text]
                if len(places) != 1:
                    problems.append("stored property `%s` (base line %d) is declared %d times"
                                    % (property_name, line, len(places)))
                    continue
                name, index = places[0]
                inside = (name == main_name and class_first < index < class_last and scan.before[index] == 1)
                if not inside:
                    problems.append("stored property `%s` (base line %d) is at %s line %d, outside the class body"
                                    % (property_name, line, name, index + 1))
            in_body = sorted(found for _, found in swiftmove.stored_properties_in(scan, class_first, class_last))
            if in_body != sorted(property_name for _, property_name in stored):
                want = collections.Counter(property_name for _, property_name in stored)
                have = collections.Counter(in_body)
                problems.append("the class body's stored properties are not the %d listed: missing %s, unlisted %s"
                                % (len(stored), sorted((want - have).elements()), sorted((have - want).elements())))
    report.check("(b) stored", "a stored property is not in the class body", problems,
                 "%d stored properties, each declared once, directly in the class body (lines %s of %s); "
                 "%d extension blocks hold none" % (len(stored), span, main_name, extensions))


def check_order(base, table, stage, files, report):
    problems = []
    sequences = expected_sequences(base, table, stage)
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
    ranges = sum(len(group["blocks"]) for group in table.groups)
    kept = sum(1 for n in range(1, len(base) + 1) if n not in table.owner and not swiftmove.is_blank(base[n - 1]))
    report.check("(c) order", "a moved range is broken up, out of order or in the wrong place", problems,
                 "%d moved ranges in %d groups, each unbroken and in base order, in the order the table lists; "
                 "%d kept lines in base order in the class body" % (ranges, len(table.groups), kept))


def check_files(table, stage, folder, report):
    expected = {table.main_file()} | {table.group_file(name) for name in table.groups_out(stage)}
    present = {name for name in os.listdir(folder)
               if name == table.main_file() or (name.startswith(table.type + "+") and name.endswith(".swift"))}
    problems = (["missing file: " + name for name in sorted(expected - present)]
                + ["a file the stage does not have: " + name for name in sorted(present - expected)])
    report.check("files", "the folder does not hold the stage's files", problems,
                 "%d file(s): %s" % (len(expected), ", ".join(sorted(expected))))
    return sorted(expected & present)


def run(base, table, stage, files, folder=None):
    """Runs every check and exits: 0 when all pass, 1 otherwise. `files` is name -> lines."""
    report = swiftmove.Report()
    check_table(base, table, stage, report)
    if folder is not None:
        check_files(table, stage, folder, report)
    check_lines(base, table, stage, files, report)
    check_stored(base, table, stage, files, report)
    check_order(base, table, stage, files, report)
    report.finish()
