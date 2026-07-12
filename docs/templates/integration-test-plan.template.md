<!--
TEMPLATE: docs/integration-test-plan.md (optional — created when a project
has frontend+backend that need contract verification)
Owned by: tester subagent
Created alongside contract tests to document what integration points exist
and how they are verified.
Delete this comment block once the real file is created.
-->

# Integration Test Plan

**Project:** <Project Name>
**Last updated:** <date>

## Integration Points

| # | Endpoint / Contract | Frontend component(s) | Backend route | Auth required | Contract doc ref |
|---|---|---|---|---|---|
| 1 | <e.g. User registration> | RegisterForm.tsx | POST /api/auth/register | No | architecture.md §API |
| 2 | | | | | |

## Test Strategy

| Type | Tool | What it covers | Frequency |
|---|---|---|---|
| Contract test | <e.g. supertest + jest> | Each endpoint returns correct status, shape, and error codes — tested by invoking the real frontend client or data layer against the real backend (no mocks on either side) | Every task that touches the endpoint |
| Integration test | <e.g. supertest + test DB> | Full request lifecycle: route → middleware → handler → DB → response | Per task |
| E2E flow | <e.g. Playwright> | Critical user flows through real UI + real API | Phase 8 / Phase 10 |

## Contract Test Details

### Endpoint 1: <method> <path>

**Request shape:**
```json
{
  "field1": "string (required)",
  "field2": "number (optional, default 0)"
}
```

**Success response (<success status>):**
```json
{
  "id": "string",
  "field1": "string"
}
```

**Error responses:**
- 400: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }`
- 401: `{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required" } }`
- 500: `{ "error": { "code": "INTERNAL_ERROR", "message": "An unexpected error occurred" } }`

**Auth:** None (public endpoint) / Bearer token in Authorization header

**Contract test assertions:**
- [ ] <method> <path> with valid body → <success status> + response matches success shape
- [ ] <method> <path> with missing required field → 400 + VALIDATION_ERROR
- [ ] <method> <path> with invalid field type → 400 + VALIDATION_ERROR
- [ ] <method> <path> without auth (if required) → 401 + UNAUTHORIZED
- [ ] <method> <path> with malicious input → 400 (not 500 — no crash)

## Edge Case Coverage

- [ ] Concurrent requests to the same resource
- [ ] Large payloads (boundary testing)
- [ ] Missing/empty optional fields
- [ ] Very long string inputs (buffer overflow / truncation)
- [ ] Unicode/special characters in string fields
- [ ] Negative numbers / zero in numeric fields

## Test Data / Fixtures

<Describe test database setup, seed data, or mock services needed.>

---

## Revision Log

| Date | Change | Reason |
|---|---|---|
| <date> | Initial integration test plan | Start of Phase 6 |
