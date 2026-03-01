# AI System Instructions - Development Environment

## System Architecture

This project runs on a **Steam Deck** (Arch Linux host) with development work isolated in an **Ubuntu container** called `dev` using **distrobox**.

## Command Execution Rules

### Host System (Arch Linux - Steam Deck)
**ALLOWED:**
- File read/write operations
- Git commands (commit, status, add, diff, log, etc.)
- Simple file system operations (ls, cat, find, etc.)

**FORBIDDEN:**
- Build commands (gradlew, npm, cargo, etc.)
- Test execution
- Package installation
- Any critical/heavy compilation or execution tasks

### Dev Container (Ubuntu - distrobox)
**REQUIRED FOR:**
- All Gradle/Android build commands
- Test execution
- Package installation (if needed)
- Any compilation or build tasks

## How to Execute Commands in Container

Use the `distrobox enter` command to run one-liners in the dev container:

```bash
distrobox enter dev -- <command>
```

### Examples:

```bash
# Build Android debug APK
distrobox enter devbox -- ./gradlew assembleDebug

# Run tests
distrobox enter devbox -- ./gradlew test

# Run specific test
distrobox enter devbox -- ./gradlew test --tests "com.axolync.android.ExampleTest"

# Clean build
distrobox enter devbox -- ./gradlew clean build
```

**Note:** Container name is `devbox`, not `dev`.

## Git Configuration Rules

### CRITICAL - DO NOT MODIFY GLOBAL GIT CONFIG

**NEVER** run these commands:
```bash
git config --global user.name "..."    # FORBIDDEN
git config --global user.email "..."   # FORBIDDEN
```

**WHY:** Global git config affects the user's entire system and all repositories. This is the user's personal computer.

**WHAT TO USE:** The repository already has local git configuration set up. Just use git commands normally - they will use the existing config.

### Allowed Git Operations

```bash
# These are fine - they use existing config
git add <files>
git commit -m "message"
git status
git log
git diff
# etc.
```

## Repository Boundaries

### This Repository (axolync-android-wrapper)
- **Full access:** Read, write, commit, modify
- **Purpose:** Active development workspace

### Other Repositories
- **Read-only access:** Can read files for reference
- **NO modifications:** Do not change, commit, or execute anything
- **NO git operations:** Do not commit, push, or modify git state

## Java/JDK

Java is installed in the `devbox` container, not on the host. Always use the container for Java-dependent operations.

## Android SDK

**Status:** ✅ Installed in the `devbox` container

**Location:** `/opt/android-sdk`

**Configuration:**
- `ANDROID_SDK_ROOT=/opt/android-sdk` (set in `/etc/profile.d/android-sdk.sh`)
- `PATH` includes `cmdline-tools/latest/bin` and `platform-tools`
- Project `local.properties` contains `sdk.dir=/opt/android-sdk`
- All required packages installed and licenses accepted

**Ready for:**
- Building Android applications
- Running Android unit tests
- Running Android instrumented tests

## Summary

| Operation Type | Host | Container |
|----------------|------|-----------|
| File I/O | ✅ | ✅ |
| Git commands | ✅ | ✅ |
| Gradle/builds | ❌ | ✅ |
| Tests | ❌ | ✅ |
| Package install | ❌ | ✅ |
| Global git config | ❌ | ❌ |

**Remember:** When in doubt, use the container for anything that compiles, builds, or executes code.
