## What does this MR do?

Briefly describe what this MR is about here.

## Related Issues

Mention the issues in this MR.

## Solution

Describe what was done to fix this issue.
What alternative solutions did you consider?

## Steps to reproduce the issue

How one can reproduce the issue.

## Parts that were changed during refactoring

If you refactored something outside the scope of the task, please
add a list of system components that were affected by the changes.

## Author's checklist

- [ ] My changes are documented, existing documentation is updated
- [ ] My changes follow our JS, CSS and Python guidelines
- [ ] If applicable, the task in Jira has `Greater Value` or `Greater Effort` label
- [ ] Migrations are up to date with model changes (
run `makemigrations` even if there were no database changes)
- [ ] Translations are up-to-date
- [ ] There are no conflicts with master branch
- [ ] Corresponding JIRA issue is updated with the link to this MR and task passed to QA

## Review checklist

- [ ] Merge request title contains the correct issue number
- [ ] The merge request is opened against the correct base branch
- [ ] The MR description matches the changes in the code
- [ ] There is no apparent way to improve the performance & design of the new code
- [ ] The covered test cases are reasonable, there are no other obvious things to test
- [ ] There are no other obvious edge/special cases that should be explicitly covered in code/tests
- [ ] The refactored parts were described in the MR description

/assign me
/label ~bug
