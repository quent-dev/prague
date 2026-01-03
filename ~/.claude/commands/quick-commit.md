---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: "commit message"
description: Add all changes and commit with message (no push)
---

Add all changes to git staging and create a commit with the message $ARGUMENTS. This does not push to remote.

Show git status first, then stage all changes and commit with the provided message.