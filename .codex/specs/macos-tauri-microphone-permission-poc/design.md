# Design: macOS Tauri Microphone Permission POC

## Overview

Tauri supports extending the generated macOS bundle `Info.plist` by placing `Info.plist` under `src-tauri`. The wrapper template will provide only the microphone usage description.

## Components

- `wrappers/desktop/tauri/workspace-template/src-tauri/Info.plist`

## Testing

Add a focused proof test that the template contains `NSMicrophoneUsageDescription` and a non-empty user-facing purpose string.
