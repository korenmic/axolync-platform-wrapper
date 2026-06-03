# Platform Wrapper Descriptor-Owned Test Command Exports Design

## Overview

Publish Platform Wrapper validation command metadata through descriptor exports.

## Design

- Add build, sanity, and full-test command exports.
- Preserve wrapper runtime behavior and unrelated platform PR scope.
- Validate Builder report discovery without fallback config.

## Non-Goals

- No native capture changes.
- No artifact packaging behavior changes.
