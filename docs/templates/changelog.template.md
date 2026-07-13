<!--
TEMPLATE: CHANGELOG.md
Owned by: docs-writer subagent (updated per release / per significant change)
This file follows the Keep a Changelog format (https://keepachangelog.com/en/1.1.0/).
Every release gets an entry. Entries are added/updated as part of Gate F
(docs updated) for each completed task. The Unreleased section accumulates
changes between releases and is promoted to a versioned section at ship time.

Sections (per release):
- Added: new features
- Changed: changes to existing functionality
- Deprecated: soon-to-be-removed features
- Removed: now-removed features
- Fixed: bug fixes
- Security: vulnerability fixes

Delete this comment block once the real file is created.
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- <New feature or component> — TASK-XXX
- <Another new feature> — TASK-XXX

### Changed
- <Change to existing behavior> — TASK-XXX

### Deprecated
- <Feature being phased out> — TASK-XXX

### Removed
- <Feature removed> — TASK-XXX

### Fixed
- <Bug fix> — TASK-XXX

### Security
- <Security fix> — TASK-XXX

---

## [<major>.<minor>.<patch>] — <YYYY-MM-DD>

### Added
- <Feature description> — TASK-XXX

### Fixed
- <Bug description> — TASK-XXX

---

## [<prev-version>] — <YYYY-MM-DD>

<Previous release entries follow the same pattern>

---

## Release Checklist Template

Before publishing a release:

- [ ] Unreleased section promoted to versioned section
- [ ] Tag created: `v<major>.<minor>.<patch>`
- [ ] Version bumped in package files (package.json, Cargo.toml, etc.)
- [ ] Release notes drafted from changelog content
- [ ] Quality gates re-verified for this release's tasks
- [ ] All referenced TASK-IDs are in `done` status
