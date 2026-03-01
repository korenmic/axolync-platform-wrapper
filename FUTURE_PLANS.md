# Future Plans and Improvements

## High Priority

### 1. CI/CD with Automated APK Testing
**Problem**: Currently delivering broken APKs to user without testing on actual Android runtime.

**Solution**: Set up budtmo/docker-android for headless Android testing
- **Tool**: https://github.com/budtmo/docker-android
- **Purpose**: Run APK in headless Android emulator before delivery
- **Benefits**:
  - Catch crashes before user sees them
  - Automated smoke testing
  - Faster feedback loop
  
**Implementation Steps**:
1. Add docker-android to development environment
2. Create script to:
   - Build APK
   - Start headless emulator
   - Install APK
   - Launch app
   - Check for crashes in logcat
   - Report success/failure
3. Integrate into build workflow

**Estimated Effort**: 2-4 hours

---

### 2. Smoke Test Suite
**Problem**: Full test suite takes 2-3 seconds, slowing down iteration.

**Solution**: Create fast smoke test subset (<1 second)
- **Location**: `app/src/test/kotlin/com/axolync/android/smoke/`
- **Naming**: `*SmokeTest.kt`
- **Run Command**: `./gradlew :app:testDebugUnitTest --tests "*SmokeTest"`

**Tests to Include**:
- Resource validation (splash_logo, themes, colors)
- Critical class compilation (MainActivity, ServerManager, LocalHttpServer)
- Basic configuration validation

**Estimated Effort**: 1 hour

---

### 3. Fix Current Crash
**Problem**: App crashes on startup (as of commit c04d711)

**Investigation Needed**:
- Bisect between bfe51c9 (working) and be588a2 (broken)
- Likely issue: MainActivity V5 fixes (retry loop, minimum duration)
- Check: Context usage in splash screen lambda
- Check: Early return vs retry loop logic

**Estimated Effort**: 1-2 hours

---

## Medium Priority

### 4. Version Tagging Strategy
**Goal**: Tag working versions so user knows what's stable

**Tags to Create**:
- `v0.1-alpha`: First version that launches without crashing
- `v0.2-alpha`: First version with working WebView + server
- `v0.3-alpha`: First version with all features working
- `v1.0.0`: Production ready

**Process**:
```bash
git tag -a v0.1-alpha -m "First working version"
git push origin v0.1-alpha
```

---

### 5. Automated Crash Reporting
**Goal**: Get crash logs automatically without manual adb logcat

**Options**:
- Firebase Crashlytics
- Sentry
- Custom crash handler writing to file

**Benefits**:
- See crashes user encounters
- Stack traces for debugging
- Crash frequency metrics

**Estimated Effort**: 2-3 hours

---

### 6. Improve Build Speed
**Current**: Clean build takes ~13 seconds

**Optimizations**:
- Enable Gradle build cache
- Enable Kotlin incremental compilation
- Use Gradle daemon
- Parallel builds

**Estimated Effort**: 1 hour

---

## Low Priority

### 7. Update Deprecated APIs
**Current Warnings**:
- NetworkMonitor uses deprecated connectivity APIs
- PluginManager type mismatch warning

**Fix**: Update to modern Android APIs
**Estimated Effort**: 2-3 hours

---

### 8. Add More Property-Based Tests
**Goal**: Validate correctness properties from spec

**Tests Needed** (from tasks.md):
- State machine parity
- Audio capture latency
- Permission-gated capture
- Network offline behavior
- Lifecycle state preservation

**Estimated Effort**: 4-6 hours

---

### 9. Physical Device Testing
**Goal**: Test on real devices (not just emulator)

**Devices Needed**:
- Mid-range Android 2019+ with 4GB RAM
- Various screen sizes (portrait/landscape)
- Different Android versions (API 24-34)

**Tests**:
- Audio capture latency
- Cold start performance
- Memory pressure handling
- Screen rotation

**Estimated Effort**: 2-4 hours

---

### 10. Release Build Optimization
**Goal**: Optimize APK size and performance

**Tasks**:
- Enable ProGuard/R8 optimization
- Remove unused resources
- Compress images
- Enable code shrinking

**Current APK Size**: 11 MB
**Target**: <8 MB

**Estimated Effort**: 2-3 hours

---

## Documentation Improvements

### 11. User-Facing Documentation
- Installation guide
- Troubleshooting guide
- Feature documentation
- FAQ

### 12. Developer Documentation
- Architecture diagrams
- API documentation
- Contributing guide
- Code style guide

---

## Technical Debt

### 13. Refactor MainActivity
**Issue**: onCreate() is getting complex with retry logic

**Solution**: Extract into separate coordinator classes
- SplashCoordinator
- ServerStateCoordinator
- BootstrapCoordinator

### 14. Improve Error Handling
**Current**: Generic error dialogs

**Improvement**:
- Specific error messages
- Recovery suggestions
- Retry mechanisms
- Fallback behaviors

### 15. Add Logging Framework
**Current**: Using Log.i/Log.e directly

**Improvement**:
- Timber or similar logging framework
- Log levels (DEBUG, INFO, WARN, ERROR)
- Log file rotation
- Remote logging

---

## Notes
- Priorities may change based on user feedback
- Estimated efforts are rough and may vary
- Some items may be combined or split as needed
