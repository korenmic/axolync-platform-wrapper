# Developer Handoff Documentation

## Project Overview
Android APK wrapper for Axolync karaoke companion web app. The app hosts a WebView that loads from an embedded HTTP server (localhost).

## Critical Context

### Current Status
- **BROKEN**: App crashes on startup (as of commit c04d711)
- **Last Known Working**: Commit `bfe51c9` (before V5 splash screen fixes)
- **Issue**: Likely in MainActivity.onCreate() - the V5 fixes added retry loop logic that may be causing crashes

### Key Architecture
1. **AxolyncApplication** starts ServerManager on app launch (async, background thread)
2. **ServerManager** starts LocalHttpServer (binds to localhost:<random_port>)
3. **MainActivity** loads WebView from `http://localhost:<port>/index.html` (NOT file://)
4. **Splash Screen** shows for minimum 2 seconds while server starts

## Development Environment

### System Requirements
- **OS**: Linux (SteamDeck)
- **Container**: distrobox with devbox container
- **Shell**: bash
- **Java**: JDK 17
- **Android SDK**: API 24-34

### Build Commands

#### All commands MUST be run through distrobox:
```bash
# Pattern: distrobox enter devbox -- <gradle_command>
```

#### Clean Build
```bash
distrobox enter devbox -- ./gradlew clean
```

#### Compile Kotlin (Fast Check)
```bash
distrobox enter devbox -- ./gradlew :app:compileDebugKotlin
```

#### Run Unit Tests (Full Suite - Slow)
```bash
distrobox enter devbox -- ./gradlew :app:testDebugUnitTest
```

#### Run Smoke Tests (Fast - TODO: Not yet implemented)
```bash
# TODO: Create smoke test suite for faster validation
distrobox enter devbox -- ./gradlew :app:testDebugUnitTest --tests "*SmokeTest"
```

#### Build Debug APK
```bash
distrobox enter devbox -- ./gradlew :app:assembleDebug
```

#### Build Release APK
```bash
distrobox enter devbox -- ./gradlew :app:assembleRelease
```

### APK Output Location
```
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/release/app-release-unsigned.apk
```

### Install APK to Device
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Testing Strategy

### Test Types

#### 1. Unit Tests (Current - Slow)
- Location: `app/src/test/kotlin/`
- Run: `distrobox enter devbox -- ./gradlew :app:testDebugUnitTest`
- Duration: ~2-3 seconds
- Coverage: Structural tests, resource validation

#### 2. Instrumentation Tests
- Location: `app/src/androidTest/kotlin/`
- Run: `distrobox enter devbox -- ./gradlew :app:connectedDebugAndroidTest`
- Requires: Physical device or emulator connected
- Coverage: WebView localhost loading, cleartext verification

#### 3. Smoke Tests (TODO - Not Yet Implemented)
- **NEEDED**: Fast subset of critical tests
- **Purpose**: Quick validation before delivering APK
- **Target Duration**: <1 second
- **Should Test**:
  - Resources exist (splash_logo, themes, colors)
  - MainActivity compiles
  - ServerManager compiles
  - No obvious syntax errors

### Resource Validation Tests
Critical tests in `SplashScreenResourceTest.kt`:
- Validates splash_logo drawable exists
- Validates splash_background color exists
- Validates Theme.App.Starting exists
- **Purpose**: Prevent crashes due to missing resources

## Git Workflow

### Branch Strategy
- **master**: Main development branch
- **origin/master**: Last pushed state (currently 7 commits behind)
- **Feature branches**: Use for investigation/fixes

### Important Commits
```
bfe51c9 - Last known working version (before V5 fixes)
be588a2 - Added minimum splash duration (LIKELY BROKE IT)
4e739b1 - Added V5 blocking fix tests
c04d711 - Current HEAD (BROKEN)
```

### Creating Investigation Branches
```bash
# Save current work
git checkout -b fix-<issue-name>
git add -A
git commit -m "WIP: <description>"

# Go back to investigate
git checkout master
git checkout <commit-hash>  # Detached HEAD for testing
```

### Never Use git stash
- **Reason**: Not reliable, doesn't survive conflicts
- **Instead**: Create a branch and commit

## Debugging Crashes

### Get Crash Logs from Device
```bash
# Connect device via USB
adb logcat | grep -E "(AndroidRuntime|FATAL|MainActivity|ServerManager|AxolyncApplication)"
```

### Common Crash Causes
1. **Missing Resources**: splash_logo, themes, colors
   - Check: `app/src/main/res/drawable/splash_logo.png` exists
   - Check: `app/src/main/res/values/themes.xml` has Theme.App.Starting
   
2. **Context Issues**: Using `this` in lambda before super.onCreate()
   - Check: MainActivity.onCreate() splash screen setup
   
3. **Server Startup**: ServerManager fails to start
   - Check: AxolyncApplication.onCreate() calls startServerAsync()
   - Check: LocalHttpServer can bind to port

### Bisecting to Find Breaking Commit
```bash
git bisect start
git bisect bad HEAD
git bisect good bfe51c9

# For each commit git checks out:
distrobox enter devbox -- ./gradlew clean :app:assembleDebug
# Test APK on device
# If works: git bisect good
# If crashes: git bisect bad
```

## Key Files to Know

### MainActivity.kt
- **Path**: `app/src/main/kotlin/com/axolync/android/activities/MainActivity.kt`
- **Purpose**: Hosts WebView, coordinates services
- **Critical**: onCreate() splash screen setup and server state handling
- **Known Issue**: V5 fixes added retry loop that may cause crashes

### ServerManager.kt
- **Path**: `app/src/main/kotlin/com/axolync/android/server/ServerManager.kt`
- **Purpose**: Manages LocalHttpServer lifecycle
- **Startup**: Async on background thread
- **States**: STARTING, READY, FAILED

### LocalHttpServer.kt
- **Path**: `app/src/main/kotlin/com/axolync/android/server/LocalHttpServer.kt`
- **Purpose**: Embedded HTTP server using NanoHTTPD
- **Binding**: localhost only (security)
- **Assets**: Serves from `app/src/main/assets/axolync-browser/`

### AxolyncApplication.kt
- **Path**: `app/src/main/kotlin/com/axolync/android/AxolyncApplication.kt`
- **Purpose**: App entry point, starts ServerManager
- **Critical**: Must call serverManager.startServerAsync() in onCreate()

### Splash Screen Resources
- **Theme**: `app/src/main/res/values/themes.xml` (Theme.App.Starting)
- **Logo**: `app/src/main/res/drawable/splash_logo.png` (default)
- **Logo Portrait**: `app/src/main/res/drawable-port-xhdpi/splash_logo.png`
- **Logo Landscape**: `app/src/main/res/drawable-land-xhdpi/splash_logo.png`
- **Background Color**: `app/src/main/res/values/colors.xml` (splash_background)

## Known Issues

### Current Crash (Unfixed)
- **Symptom**: App crashes immediately on startup
- **Started**: Between commits bfe51c9 and be588a2 (1-4 releases ago)
- **Not Related To**: Splash image changes (those came later)
- **Likely Cause**: MainActivity V5 fixes (retry loop, minimum duration logic)

### Splash Screen Issues (Fixed)
- ✅ Missing default splash_logo.png (fixed in 95326b0)
- ✅ White background (fixed - now dark gray #1A1A1A)
- ✅ Too short duration (fixed - now 2 seconds minimum)

## Version Tagging

### When to Tag
- **0.1-alpha**: First version that launches without crashing
- **0.2-alpha**: First version with working WebView + server
- **0.3-alpha**: First version with all features working
- **1.0.0**: Production ready

### How to Tag
```bash
git tag -a v0.1-alpha -m "First working version - launches without crash"
git push origin v0.1-alpha
```

## Future Plans (See FUTURE_PLANS.md)
1. **CI/CD**: Set up budtmo/docker-android for automated testing
2. **Smoke Tests**: Create fast test suite (<1 second)
3. **Crash Prevention**: Add more resource validation tests
4. **Automated APK Testing**: Test APK launches before delivery

## Quick Reference

### Fast Validation Workflow
```bash
# 1. Compile check (fastest)
distrobox enter devbox -- ./gradlew :app:compileDebugKotlin

# 2. Run smoke tests (when implemented)
# distrobox enter devbox -- ./gradlew :app:testDebugUnitTest --tests "*SmokeTest"

# 3. Build APK
distrobox enter devbox -- ./gradlew :app:assembleDebug

# 4. Install and test
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 5. Watch logs
adb logcat | grep -E "(AndroidRuntime|FATAL|MainActivity)"
```

### Emergency Rollback
```bash
# Go back to last working version
git checkout bfe51c9
distrobox enter devbox -- ./gradlew clean :app:assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
```

## Contact Points
- **Spec Files**: `.kiro/specs/android-apk-wrapper/`
- **Design Doc**: `.kiro/specs/android-apk-wrapper/design.md`
- **Requirements**: `.kiro/specs/android-apk-wrapper/requirements.md`
- **Tasks**: `.kiro/specs/android-apk-wrapper/tasks.md`

## Critical Reminders
1. ⚠️ **ALWAYS** run gradle through distrobox
2. ⚠️ **NEVER** use `git stash` - use branches instead
3. ⚠️ **ALWAYS** test APK on device before delivering
4. ⚠️ **ALWAYS** check logcat for crashes
5. ⚠️ When working version achieved, tag it immediately
