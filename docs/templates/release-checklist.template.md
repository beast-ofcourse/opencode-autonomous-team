<!--
TEMPLATE: docs/release-checklist.md (created per release / phase gate)
Owned by: orchestrator (invoked at Phase 10 and between major milestones)
A structured pre-flight checklist executed before each release. This is
different from per-task quality gates — this covers cross-cutting concerns
at the release level: versioning, changelog, artifact build, deployment,
and final smoke tests.
Delete this comment block once the real file is created.
-->

# Release Checklist: <Release Name / Version>

**Project:** <Project Name>
**Version:** <major.minor.patch>
**Date:** <YYYY-MM-DD>
**Owner:** orchestrator

## Pre-release Verification

### Code & Versioning
- [ ] All tasks for this release are marked `done` in tasks.md
- [ ] All done tasks have quality-gates.md entries
- [ ] Version bump committed (package.json, Cargo.toml, etc.)
- [ ] Git tag created: `v<major.minor.patch>`
- [ ] Tag pushed to origin

### Quality Gates (Re-validation)
- [ ] Full test suite passes (unit + integration + contract)
- [ ] Coverage baseline maintained or improved
- [ ] Lint / typecheck / format — zero errors
- [ ] Dependency vulnerability audit: no critical/high issues
  - If issues exist: noted in docs/tech-debt.md with mitigation plan

### Documentation
- [ ] CHANGELOG.md updated — Unreleased section promoted to versioned entry
- [ ] README.md up to date (installation instructions, badges, screenshots)
- [ ] API contract docs in sync with implementation
- [ ] Deployment guide updated if infrastructure changed

### Security
- [ ] No unresolved security findings for this release's scope
- [ ] Auth/AuthZ boundary re-verified if touched
- [ ] Secrets and credentials confirmed absent from committed code

### Build & Deployment
- [ ] Production build succeeds (no errors, no warnings treated as errors)
- [ ] Bundle size within budget (if applicable)
- [ ] Deployment dry-run on staging environment — passes
- [ ] Smoke test on staging: critical user flows validated

### Final Approval
- [ ] Reviewer sign-off on release scope
- [ ] Orchestrator final approval
- [ ] Release artifacts published / deployed to production

---

## Release Artifacts

| Artifact | Location / Link | Status |
|---|---|---|
| Git tag | `v<version>` | Not yet / Done |
| Build output | `<path>` | Not yet / Done |
| npm package / binary | `<registry URL>` | Not yet / Done |
| Deployment | `<environment URL>` | Not yet / Done |

---

## Post-release

- [ ] Release notes published (GitHub Releases, mailing list, etc.)
- [ ] New ADR created for any release-process changes
- [ ] Tech debt items re-prioritized for next iteration

---

## Notes

<Any blockers, known issues shipped with this release, or
release-specific operational notes.>

---

## Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Reviewer | <name> | <date> | <approval> |
| Orchestrator | <name> | <date> | <approval> |
