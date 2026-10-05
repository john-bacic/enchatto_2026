# Swift move tools

These regroup and split two large Swift files of the iPhone app by line range, and prove that the result is the original file moved around and nothing else. This page says what each script is for and the order to run them in. Each script's header says what it reads and writes, what it checks and what it does not prove. Python 3.9 or later, standard library only. Nothing here is run by `npm test` or by CI.

| Split | Base file | sha256 of the base file | Folder |
| --- | --- | --- | --- |
| The host room's view model | `apps/ios/ViewModels/HostRoomViewModel.swift` at `1b68a6f` (2,106 lines) | `c68ccc30a76aecc1ada2a21715b76344297cd4bb4b859ed7fddd1ee0a6ba6b04` | `view-model/` |
| The room screen | `apps/ios/Views/HostConversationView.swift` at `1b68a6f` (3,694 lines) | `16833fd7d44439a44b1c271d264c2641eb83c0b2da9adaf4a9f4bcdb4021cd83` | `conversation-view/` |

Every line number in a range table is a line of the base file, the file as it is before any move. So every tool runs on that exact file, also when an earlier step is already in the tree, and refuses any other. No tool writes into the repository: each takes an output folder, which must be outside it.

Exit codes: `0` done, or every check passed. `1` a check failed. `2` refused: not the base file, a wrong path or argument, or an output folder inside the repository.

## The order

1. Fetch the base file into a scratch folder: `python3 scripts/step6/ios/base_blob.py view-model <scratch>/base`.
2. Check that the tree is in the state the step starts from: `python3 scripts/step6/ios/tree_state.py apps/ios --expect view-model=<state>`.
3. Write the step's files into the scratch folder (the table below).
4. Run the step's verifier on the scratch folder. Go on only at exit 0.
5. Copy the files into `apps/ios`, then check the copy byte for byte: `python3 scripts/step6/ios/compare_files.py <scratch>/<stage> apps/ios/ViewModels`, and `tree_state.py` again for the state the step ends in.
6. A step that adds Swift files needs them listed in the Xcode project. `conversation-view/pbx_add.py` and `view-model/patch_pbxproj.py` write a project file with the lines inserted; `pbx_insert_only.py` shows that nothing else changed in it.
7. Build. The verifiers prove a move; only the compiler proves that the moved code compiles and that the project lists the files. `swiftc -frontend -parse <file>` is a quick look at syntax before the build; it does not type-check.

| Step | Write | Verify |
| --- | --- | --- |
| Regroup the view model inside its one file | `view-model/regroup.py <base> <out>` | `view-model/verify_regroup.py <base> <out>/HostRoomViewModel.swift` |
| Five game groups of the view model become files | `view-model/split_batch1.py <base> <out>` | `view-model/verify_move.py --stage games <base> <out>` |
| The other five groups become files | `view-model/split.py <base> <out>` | `view-model/verify_move.py --stage all <base> <out>` |
| The room screen's helper types become eight files | `conversation-view/split.py <base> <out> types` | `conversation-view/verify.py --stages types <base> <out>` |
| The room screen's members become five extension files | `conversation-view/split.py <base> <out> all` | `conversation-view/verify.py --stages all <base> <out>` |

A later step is written from the base file like the first, not from the step before it. The files an earlier step added come out again unchanged, and `compare_files.py` shows that the ones already in the tree are the ones written now.

After changing a tool, run the self-test: `python3 scripts/step6/ios/selftest/run.py <new empty folder outside the repository>`.

## The scripts

Shared:

- `swiftmove.py`: what the others share. It reads the base file and refuses another, refuses an output folder inside the repository, scans Swift braces and prints the reports. Not run by itself.
- `base_blob.py`: fetches a base file from git history into a scratch folder.
- `tree_state.py`: names the state an `apps/ios` folder is in (`base`, `regroup`, `games`, `all`, `types`).
- `compare_files.py`: generated files against the tree, byte for byte.
- `pbx_insert_only.py`: one `project.pbxproj` is another with lines inserted and nothing else. Compare with a copy saved just before the edit, not with `HEAD`.

`view-model/`:

- `regroup.py`, `split_batch1.py`, `split.py`: write the three layouts (one regrouped file, six files, eleven files). `vm_layout.py` does the writing.
- `verify_regroup.py`, `verify_move.py`: the verifiers. `vm_checks.py` holds their checks.
- `groups.json`: the range table. `vm_table.py` reads the data files for the others.
- `widen.json`: the declarations that lose `private` or `private(set)`. `widen_calc.py` derives it; `--check` compares the kept copy with what it derives.
- `members.json`: every member of the class with its range, from `members.py`.
- `patch_pbxproj.py`: adds the new files' project lines, copied from a generated project. It refuses a target it could not patch by inserting only.

`conversation-view/`:

- `split.py`: writes the stages it is given: `types`, any of the five member groups, or `all`. `cv_layout.py` does the writing.
- `verify.py`: the verifier. `cv_checks.py` holds its checks.
- `tables.json`: the range table. `cv_table.py` reads it for the others.
- `widen.json`: the declarations that lose `private`. `widen_list.py` reads it off the split itself; `--check` compares.
- `members.json`, `xref.json`: every member of the struct and which members it names, from `members.py` and `xref.py`. `widen_xref.py` uses them for a second look at `widen.json`.
- `pbx_add.py`: adds new files to a project file by inserting the lines XcodeGen writes for them.

`selftest/`:

- `run.py`: runs every tool on the real base files. It holds the layout tools to the sha256 values in `outputs.json`, shows that the verifiers pass a correct result and fail broken ones, each for the stated reason, and shows the refusals.
- `outputs.json`: sha256 of every file each stage writes. `tree_state.py` reads it too.
