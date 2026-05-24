# Requirements: macOS Tauri Microphone Permission POC

## Introduction

Packaged macOS Tauri apps must declare why they request microphone access.

## Requirements

### Requirement 1: macOS Microphone Usage Metadata

**User Story:** As an Axolync macOS tester, I want the packaged app to declare microphone usage so macOS can present a truthful permission prompt.

#### Acceptance Criteria

1. WHEN the Tauri workspace template is packaged on macOS THEN the bundle SHALL include an `NSMicrophoneUsageDescription` value.
2. WHEN the metadata is added THEN it SHALL not alter Windows, Android, or web runtime behavior.
