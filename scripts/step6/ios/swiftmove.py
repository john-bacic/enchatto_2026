"""Shared helpers for the Swift move tools in this folder. Not run by itself.

The tools split two large Swift files by line range. A range table only fits the exact file it
was written for, so every tool reads its input through `read_base`, which refuses any other file,
and writes its results through `output_dir`, which refuses a folder inside this repository: a
tool never edits the tree in place. Its output is checked in a scratch folder and then copied in.

Exit codes used by every tool here:
  0  done, or every check passed
  1  a check failed
  2  refused: the input is not the file the tool is tied to, a path is wrong, or the output
     folder is inside the repository

Python 3.9 or later, standard library only.
"""
import hashlib
import json
import os
import re
import sys

EXIT_OK, EXIT_FAILED, EXIT_REFUSED = 0, 1, 2

HERE = os.path.dirname(os.path.abspath(__file__))

# Swift sources hold text in several scripts. A report that quotes a line must not stop on a
# terminal or a pipe whose encoding lacks a character.
for _stream in (sys.stdout, sys.stderr):
    _stream.reconfigure(encoding="utf-8", errors="backslashreplace")


def refuse(message):
    """Stops the tool with exit code 2. Used when running on would give a result nobody can trust."""
    sys.stderr.write("refused: " + message.rstrip() + "\n")
    sys.exit(EXIT_REFUSED)


def load_json(path):
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError) as error:
        refuse("cannot read %s: %s" % (path, error))


def sha256_hex(data):
    return hashlib.sha256(data).hexdigest()


def split_lines(text):
    """Lines without their newline. A file that ends in a newline has no empty last line."""
    lines = text.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    return lines


def read_lines(path):
    try:
        with open(path, "rb") as handle:
            data = handle.read()
    except OSError as error:
        refuse("cannot read %s: %s" % (path, error))
    try:
        return split_lines(data.decode("utf-8"))
    except UnicodeDecodeError as error:
        refuse("%s is not UTF-8: %s" % (path, error))


def read_base(path, base):
    """The lines of the base file, or a refusal when `path` is any other file.

    `base` is the record a range table carries: the repository path, the commit the file is taken
    from, its sha256 and its line count. Every line number in a table is a line of that one blob.
    """
    try:
        with open(path, "rb") as handle:
            data = handle.read()
    except OSError as error:
        refuse("cannot read %s: %s" % (path, error))
    found = sha256_hex(data)
    if found != base["sha256"]:
        refuse(
            "%s is not the file this tool is tied to.\n"
            "  expected sha256 %s\n"
            "           (%s at commit %s, %d lines)\n"
            "  found    sha256 %s (%d lines)\n"
            "The line ranges this tool uses are those of the expected file and fit no other.\n"
            "Run it on a copy of that file in a scratch folder:\n"
            "  git show %s:%s > <scratch folder>/%s\n"
            "or: python3 %s view-model|conversation-view <scratch folder>"
            % (path, base["sha256"], base["path"], base["commit"], base["lines"], found,
               data.count(b"\n"), base["commit"], base["path"], os.path.basename(base["path"]),
               os.path.join(os.path.relpath(HERE), "base_blob.py")))
    lines = split_lines(data.decode("utf-8"))
    if len(lines) != base["lines"]:
        refuse("%s has %d lines, the table says %d" % (path, len(lines), base["lines"]))
    return lines


def repository_root():
    """The working tree these tools live in: the nearest folder above them that holds `.git`."""
    folder = HERE
    while True:
        if os.path.exists(os.path.join(folder, ".git")):
            return folder
        parent = os.path.dirname(folder)
        if parent == folder:
            return None
        folder = parent


def output_dir(path, create=True):
    """The output folder, created unless `create` is off, or a refusal for one inside this repository."""
    real = os.path.realpath(path)
    root = repository_root()
    if root is not None:
        root = os.path.realpath(root)
        if real == root or real.startswith(root + os.sep):
            refuse(
                "the output folder %s is inside the repository %s.\n"
                "These tools never write into the tree. Give a scratch folder outside it, check the\n"
                "result there, then copy the files in." % (path, root))
    if create:
        os.makedirs(real, exist_ok=True)
    return real


def write_lines(path, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(lines) + "\n")


def write_json(path, value):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(value, handle, indent=1, ensure_ascii=False)
        handle.write("\n")


def data_tool_arguments(argv, usage):
    """Command line of a tool that derives a data file from the base file.

    `tool.py <base file> <output folder>` writes the file into the folder; `tool.py --check
    <base file>` writes nothing and compares the result with the copy kept next to the tool.
    Returns (base path, output folder or None for --check).
    """
    arguments = argv[1:]
    if len(arguments) == 2 and arguments[0] == "--check":
        return arguments[1], None
    if len(arguments) == 2 and not arguments[0].startswith("-"):
        return arguments[0], output_dir(arguments[1], create=False)   # made when the file is written
    sys.stderr.write(usage.strip() + "\n")
    sys.exit(EXIT_REFUSED)


def deliver_json(value, out_dir, kept_path):
    """Writes `value` into the output folder, or with --check compares it with the kept copy."""
    name = os.path.basename(kept_path)
    if out_dir is not None:
        write_json(os.path.join(out_dir, name), value)
        print("wrote " + os.path.join(out_dir, name))
        return
    kept = load_json(kept_path)
    if kept == value:
        print("ok: %s is what this tool derives from the base file" % os.path.relpath(kept_path))
        sys.exit(EXIT_OK)
    print("FAILED: %s differs from what this tool derives from the base file" % os.path.relpath(kept_path))
    sys.exit(EXIT_FAILED)


def is_blank(line):
    return line.strip() == ""


def nonblank(lines):
    return [line for line in lines if not is_blank(line)]


def squeeze(lines):
    """Drops blank lines at both ends and all but one of each run of blank lines."""
    out = []
    for line in lines:
        if is_blank(line) and (not out or is_blank(out[-1])):
            continue
        out.append(line)
    while out and is_blank(out[-1]):
        out.pop()
    return out


# ---------------------------------------------------------------------------------------------
# Reading Swift just far enough to count braces
# ---------------------------------------------------------------------------------------------

class ScanError(Exception):
    pass


def code_of(line):
    """The line without the contents of its string literals and without a trailing // comment.

    What is left is safe to count braces and parentheses in. Interpolations (`\\(...)`) are read as
    part of their literal. Only single-line literals are modelled: a multi-line literal, a raw
    literal or a block comment raises ScanError.
    """
    out = []
    stack = []   # "string", or [paren depth] for an interpolation inside a string
    i, n = 0, len(line)
    while i < n:
        c = line[i]
        if stack and stack[-1] == "string":
            if c == "\\":
                if i + 1 < n and line[i + 1] == "(":
                    stack.append([0])
                i += 2
                continue
            if c == '"':
                stack.pop()
            i += 1
            continue
        if c == '"':
            if line[i:i + 3] == '"""':
                raise ScanError("a multi-line string literal, which this scanner does not read: " + line.strip())
            stack.append("string")
            i += 1
            continue
        if c == "#" and line[i:i + 2] == '#"':
            raise ScanError("a raw string literal, which this scanner does not read: " + line.strip())
        if c == "/" and line[i:i + 2] == "/*":
            raise ScanError("a block comment, which this scanner does not read: " + line.strip())
        if stack:                                   # code inside an interpolation
            if c == "(":
                stack[-1][0] += 1
            elif c == ")":
                if stack[-1][0] == 0:
                    stack.pop()
                else:
                    stack[-1][0] -= 1
            i += 1
            continue
        if c == "/" and line[i:i + 2] == "//":
            break
        out.append(c)
        i += 1
    if stack:
        raise ScanError("a string literal is not closed on its line: " + line.strip())
    return "".join(out)


class Scan:
    """Brace depth around every line of a Swift file.

    `before[i]` and `after[i]` are the depth in front of and behind line i (0-based); `low[i]` is
    the lowest depth reached inside it. `code[i]` is the line as `code_of` leaves it.
    """

    def __init__(self, lines, label):
        """Raises ScanError for a file it cannot read: a file under test may be broken, and its
        checker reports that as a failed check. `scan_base` is the form for a trusted file."""
        self.lines = lines
        self.before, self.after, self.low, self.code = [], [], [], []
        depth = 0
        for number, line in enumerate(lines, 1):
            try:
                code = code_of(line)
            except ScanError as error:
                raise ScanError("%s line %d: %s" % (label, number, error))
            self.before.append(depth)
            low = depth
            for c in code:
                if c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    low = min(low, depth)
            self.code.append(code)
            self.low.append(low)
            self.after.append(depth)
        if depth != 0:
            raise ScanError("%s: braces do not balance (depth %d at the end of the file)" % (label, depth))

    def block_end(self, start):
        """Index of the line that closes the block opened on line `start` (0-based)."""
        if self.after[start] <= self.before[start]:
            return start
        for i in range(start, len(self.lines)):
            if self.after[i] <= self.before[start]:
                return i
        return len(self.lines) - 1

    def blocks(self, opener):
        """(first, last) line indexes of every top-level block whose first line matches `opener`."""
        found = []
        for i, line in enumerate(self.lines):
            if self.before[i] == 0 and re.match(opener, line) and self.after[i] == 1:
                found.append((i, self.block_end(i)))
        return found

    def balanced(self, first, last, depth):
        """Whether lines first..last (0-based, inclusive) start and end at `depth` and never go below it."""
        if self.before[first] != depth or self.after[last] != depth:
            return False
        return all(self.low[i] >= depth for i in range(first, last + 1))


LEAD_IN = re.compile(r"^\s*(///|@\w+(\(.*\))?\s*$)")


def stranded_lead_ins(lines, piece_of):
    """Line numbers (1-based) of doc comments and attribute lines cut off from their declaration.

    `piece_of(n)` names the piece line n moves with; lines of one piece stay together and in
    order. A `///` comment or a line holding only an attribute (`@ViewBuilder`) belongs to the
    declaration on the next line. If that line is in another piece, the attribute would land on
    a different declaration, which is a change to the code and not a move.
    """
    return [n for n in range(1, len(lines))
            if LEAD_IN.match(lines[n - 1]) and piece_of(n) != piece_of(n + 1)]


def scan_base(lines, label):
    """The scan of a base file. One that cannot be read is a refusal: no table can be checked on it."""
    try:
        return Scan(lines, label)
    except ScanError as error:
        refuse(str(error))


_DECLARATION = re.compile(
    r"^\s*(?:@\w+(?:\([^)]*\))?\s+)*"
    r"((?:(?:private\(set\)|fileprivate\(set\)|internal\(set\)|private|fileprivate|internal|public|"
    r"open|static|class|final|lazy|weak|unowned|nonisolated|override)\s+)*)"
    r"(var|let)\s+(\w+)")


def stored_properties_in(scan, first, last):
    """Instance stored properties declared directly in the block that spans lines first..last.

    Returns (line index, name) pairs. A `let` is stored. A `var` is stored unless its braces hold
    accessors: a body that opens without `=` and does not start with `didSet` or `willSet`.
    Static ones are left out: an extension may hold those.
    """
    member_depth = scan.before[first] + 1
    found = []
    for i in range(first + 1, last):
        if scan.before[i] != member_depth:
            continue
        match = _DECLARATION.match(scan.lines[i])
        if not match:
            continue
        modifiers = match.group(1).split()
        if "static" in modifiers or "class" in modifiers:
            continue
        if match.group(2) == "var" and _is_computed(scan, i):
            continue
        found.append((i, match.group(3)))
    return found


def _is_computed(scan, i):
    code = scan.code[i]
    brace = code.find("{")
    if brace < 0:
        return False
    if "=" in code[:brace]:
        return False                    # an initial value, with observers or a closure after it
    inside = code[brace + 1:].strip()
    j = i
    while not inside and j + 1 < len(scan.lines):
        j += 1
        inside = scan.code[j].strip()
    return not re.match(r"(didSet|willSet)\b", inside)


# ---------------------------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------------------------

class Report:
    """Collects the result of each named check and prints one line per check.

    The line starts with the check's tag and `ok` or `FAILED`, so a caller can read the outcome of
    one check without parsing the detail under it.
    """

    def __init__(self):
        self.failed = []

    def check(self, tag, title, problems, summary, notes=()):
        """`notes` are printed under the line of a check that passed: what it counted as allowed."""
        if problems:
            self.failed.append(tag)
            print("%-12s FAILED  %s" % (tag, title))
            for problem in problems[:20]:
                print("               " + problem)
            if len(problems) > 20:
                print("               ... and %d more" % (len(problems) - 20))
        else:
            print("%-12s ok      %s" % (tag, summary))
            for note in notes:
                print("               " + note)

    def finish(self):
        if self.failed:
            print("FAILED: " + ", ".join(self.failed))
            sys.exit(EXIT_FAILED)
        print("all checks passed")
        sys.exit(EXIT_OK)


def show(line, width=110):
    text = line.strip()
    return text if len(text) <= width else text[:width - 3] + "..."


def listing(counter):
    """A multiset of lines on one line: each distinct line once, with its count when above one."""
    return ", ".join(("%d x `%s`" % (count, line)) if count > 1 else "`%s`" % line
                     for line, count in sorted(counter.items(), key=lambda item: (-item[1], item[0])))


def counter_problems(counter, label):
    return ["%s (x%d): %s" % (label, count, show(line)) for line, count in sorted(counter.items())]


def first_difference(expected, actual):
    """Index of the first position where two sequences differ, or None when they are equal."""
    for i in range(min(len(expected), len(actual))):
        if expected[i] != actual[i]:
            return i
    if len(expected) != len(actual):
        return min(len(expected), len(actual))
    return None
