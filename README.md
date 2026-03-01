# Axolync Android Wrapper

Native Android application that hosts the Axolync karaoke companion web experience (axolync-browser v1.0.0) within a WebView.

## Project Structure

- `app/` - Android application module
  - `src/main/kotlin/com/axolync/android/` - Kotlin source code
    - `activities/` - Android activities (SplashActivity, MainActivity)
    - `services/` - Native services (AudioCaptureService, PermissionManager, LifecycleCoordinator)
    - `bridge/` - JavaScript bridge for native-web communication
    - `utils/` - Utility classes (PluginManager, NetworkMonitor)
  - `src/main/res/` - Android resources (layouts, drawables, strings)
  - `src/main/assets/axolync-browser/` - Built web application assets (copied from submodule)

## Setup

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK with API 34
- Git

### Clone and Initialize

```bash
# Clone the repository
git clone <repository-url>
cd axolync-android-wrapper

# Initialize and update the axolync-browser submodule
git submodule init
git submodule update

# Build axolync-browser (requires Node.js and npm)
cd axolync-browser
npm install
npm run build
cd ..

# Open in Android Studio
# File > Open > Select the project root directory
```

### Build

The Gradle build is configured to automatically copy built axolync-browser assets to `app/src/main/assets/axolync-browser/` during the build process.

```bash
# Build the project
./gradlew build

# Install on connected device
./gradlew installDebug
```

## Configuration

### Minimum SDK: 24 (Android 7.0)
### Target SDK: 34 (Android 14)

## Dependencies

- AndroidX Core, AppCompat, Material Components
- Kotlin Coroutines
- Lifecycle components
- Kotest (property-based testing)
- JUnit, Mockito (unit testing)

## Permissions

The app requires the following permissions:
- `RECORD_AUDIO` - For microphone access (song identification)
- `INTERNET` - For network connectivity (song identification, lyric sync)
- `ACCESS_NETWORK_STATE` - For network status monitoring

## Architecture

The Android wrapper follows a thin native wrapper pattern:
- Native Android layer handles platform-specific concerns (permissions, audio, lifecycle)
- JavaScript bridge provides minimal native-web communication
- Web application layer (axolync-browser) runs unmodified in WebView

See `.kiro/specs/android-apk-wrapper/design.md` for detailed architecture documentation.

## Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

## License

[License information]
