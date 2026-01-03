---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*)
argument-hint: "commit message"
description: Add all changes, commit with message, and push to main branch
---

Add all changes to git staging, create a commit with the message $ARGUMENTS, and push to origin main branch.

First show the current git status, then stage all changes, commit with the provided message, and push to the remote main branch.