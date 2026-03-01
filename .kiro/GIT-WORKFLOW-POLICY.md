# Git Workflow Policy for Spec-Driven Development

## Overview

This document defines the git commit workflow for implementing features and fixes using the spec-driven development methodology. The goal is to maintain clear, traceable, and atomic commits that map directly to tasks in the specification.

## Core Principle

**One Task = One Commit = One Checkbox Update**

Every task completion must be reflected in both the codebase AND the tasks.md file in a single atomic commit.

## Commit Structure

### Required Components

Each commit for a spec task MUST include:

1. **Implementation files** - All code/config files for that specific task
2. **tasks.md update** - The checkbox for ONLY that task marked as `[x]`
3. **Test files** (if applicable) - Tests written for that task
4. **Descriptive commit message** - Following the format below

### Commit Message Format

```
<type>: task <number> - <brief description>

<detailed description with bullet points>

Requirements: <requirement IDs>
```

**Types:**
- `feat:` - New feature implementation
- `fix:` - Bug fix
- `test:` - Test implementation (for optional test tasks)
- `refactor:` - Code refactoring
- `docs:` - Documentation updates
- `chore:` - Build/tooling changes

**Example:**
```
feat: task 7.1 - create NativeBridge class with JavaScript interface

- Implement @JavascriptInterface methods for web-to-native communication
- Add startAudioCapture(), stopAudioCapture() with JSON responses
- Add checkMicrophonePermission(), requestMicrophonePermission()
- Add getNetworkStatus() returning JSON with connectivity info
- All methods return JSON strings for security

Requirements: 3.3, 3.4, 7.3
```

## Workflow Steps

### For Each Task

1. **Implement the task** - Write the code, tests, etc.

2. **Update tasks.md** - Mark ONLY the current task as complete
   ```markdown
   - [x] 7.1 Create NativeBridge class
   ```

3. **Stage files** - Add implementation files AND tasks.md
   ```bash
   git add app/src/main/kotlin/.../NativeBridge.kt
   git add .kiro/specs/feature-name/tasks.md
   ```

4. **Commit** - Use descriptive message
   ```bash
   git commit -m "feat: task 7.1 - create NativeBridge class
   
   - Implement @JavascriptInterface methods
   - Add JSON response handling
   
   Requirements: 3.3, 3.4"
   ```

5. **Repeat** - Move to next task

### For Checkpoint Tasks

Checkpoint tasks (e.g., "Ensure all tests pass") follow the same pattern:

1. **Run tests** - Execute the test suite
2. **Fix any issues** - If tests fail, fix them first
3. **Update tasks.md** - Mark checkpoint as complete
4. **Commit** - Include test output summary in message

```bash
git add .kiro/specs/feature-name/tasks.md
git commit -m "test: task 10 - checkpoint passed

All tests pass successfully:
- 48 actionable tasks executed
- 0 failures
- Build successful in 8s

Validates tasks 7.1, 7.2, 8.1, 9.1"
```

## Sub-Tasks

For tasks with sub-tasks (e.g., 7.1, 7.2 under task 7):

**Option 1: Commit each sub-task separately** (preferred for large sub-tasks)
```bash
# Commit 7.1
git add NativeBridge.kt tasks.md
git commit -m "feat: task 7.1 - create NativeBridge class"

# Commit 7.2
git add NativeBridge.kt tasks.md
git commit -m "feat: task 7.2 - implement native-to-web communication"
```

**Option 2: Commit parent task when all sub-tasks complete** (for small sub-tasks)
```bash
# After completing 7.1 and 7.2
git add NativeBridge.kt tasks.md
git commit -m "feat: task 7 - implement NativeBridge JavaScript interface

Sub-tasks completed:
- 7.1: JavaScript interface methods
- 7.2: Native-to-web communication

Requirements: 3.3, 3.4, 7.3"
```

## Optional Tasks

Optional tasks (marked with `(Optional)` in tasks.md) should still follow the same commit pattern if implemented:

```bash
git add test/NativeBridgeTest.kt tasks.md
git commit -m "test: task 7.3 (optional) - add NativeBridge unit tests

- Test all JavaScript interface methods return valid JSON
- Test native-to-web calls execute correctly
- Test audio chunk delivery with Float32Array format

Requirements: 3.3, 3.4"
```

If skipping optional tasks, do NOT mark them as complete in tasks.md.

## Benefits of This Workflow

### Traceability
```bash
# See all task completions
git log --oneline --follow .kiro/specs/feature-name/tasks.md

# See what was implemented for a specific task
git show <commit-hash>
```

### Atomic Changes
- Each commit is a complete, working unit
- Can cherry-pick individual tasks
- Can revert specific tasks without affecting others

### Clear History
- Git history tells the story of feature development
- Easy to understand what changed and why
- Reviewers can see task-by-task progress

### Debugging
- Bisect works better with atomic commits
- Easy to identify which task introduced an issue
- Can test individual task implementations

## Anti-Patterns (What NOT To Do)

### ❌ Bundling Multiple Tasks
```bash
# BAD: Multiple tasks in one commit
git commit -m "feat: implement tasks 7, 8, and 9"
```

### ❌ Forgetting tasks.md
```bash
# BAD: Implementation without tasks.md update
git add NativeBridge.kt
git commit -m "feat: add NativeBridge"
# tasks.md not included!
```

### ❌ Premature Checkbox Updates
```bash
# BAD: Marking task complete before implementing
# Edit tasks.md to mark task 7.1 as [x]
git commit -m "docs: update tasks.md"
# Then implement later - NO!
```

### ❌ Vague Commit Messages
```bash
# BAD: No context
git commit -m "update code"

# BAD: No task reference
git commit -m "feat: add bridge class"

# GOOD: Clear task reference
git commit -m "feat: task 7.1 - create NativeBridge class"
```

## Fixing Mistakes

### If you committed without tasks.md:
```bash
# Add tasks.md to the last commit
git add .kiro/specs/feature-name/tasks.md
git commit --amend --no-edit
```

### If you bundled multiple tasks:
```bash
# Reset to before the bundled commit
git reset --soft HEAD~1

# Create separate commits for each task
git add file1.kt tasks.md
git commit -m "feat: task 7.1 - ..."

git add file2.kt tasks.md
git commit -m "feat: task 8.1 - ..."
```

### If you marked wrong task as complete:
```bash
# Fix tasks.md
# Then amend the commit
git add .kiro/specs/feature-name/tasks.md
git commit --amend --no-edit
```

## Integration with CI/CD

This workflow enables:
- **Per-task testing** - CI can test each commit individually
- **Progressive deployment** - Deploy tasks incrementally
- **Automated tracking** - Parse tasks.md changes to track progress
- **Quality gates** - Ensure each task passes tests before merging

## Summary

**Remember:**
1. One task = One commit
2. Always include tasks.md with the checkbox update
3. Use descriptive commit messages with task numbers
4. Keep commits atomic and focused
5. Reference requirements in commit messages

This workflow ensures that your git history is a clear, traceable record of feature development that maps directly to your specification.
