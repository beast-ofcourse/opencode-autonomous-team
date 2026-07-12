<!--
TEMPLATE: docs/api-contract.md
Owned by: planner (created during Phase 3 alongside architecture.md)
This is a living document that defines every frontend-backend contract.
AGENTS.md §"Integration contract rule" mandates this doc exists AND is
kept in sync before either side is implemented — no endpoint may be built
without its contract recorded here. The contract is the source of truth;
both frontend and backend implementations must match it.
Delete this comment block once the real file is created.
-->

# API Contract: <Project Name>

**Last updated:** <date>
**Status:** draft | active | finalized
**Owner:** planner

## Conventions

### Base URL
- **Development:** `http://localhost:<port>/api/v1`
- **Staging:** `<staging-url>/api/v1`
- **Production:** `<production-url>/api/v1`

### Authentication
<Describe auth mechanism, e.g. "All endpoints except /auth/* require a Bearer
token in the Authorization header. Tokens are JWT signed with RS256, expiry
24h.">

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### Standard Error Codes
| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed schema validation |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### <N>. <Method> <Path>

**Summary:** <one-line description>
**Auth:** <None | Bearer | Cookie | ...>
**Rate limit:** <if applicable>

#### Request

**Headers:**
| Header | Required | Value |
|---|---|---|
| Content-Type | Yes | application/json |
| Authorization | <Yes/No> | Bearer `<token>` |

**Path parameters:**
| Parameter | Type | Description |
|---|---|---|
| `<param>` | `<type>` | <description> |

**Query parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `<param>` | `<type>` | Yes/No | `<default>` | <description> |

**Request body** (if applicable):
```json
{
  "field1": "string (required)",
  "field2": "number (optional, default 0)",
  "field3": {
    "nested1": "boolean (required)"
  }
}
```

#### Responses

**<HTTP Status Code> — <description>**
```json
{
  "id": "uuid",
  "field1": "string",
  "createdAt": "ISO8601 datetime"
}
```

**<HTTP Status Code> — <error condition>**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of what went wrong"
  }
}
```

**Response model** (one table per status code):
| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | string (UUIDv7) | No | Unique resource identifier |
| `createdAt` | string (ISO 8601) | No | Timestamp of creation |

---

### <N+1>. <Next Method> <Next Path>

<Repeat the same structure for each endpoint>

---

## Data Models

### <Model Name>

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "user | admin"
}
```

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string (UUIDv7) | Required, immutable | Unique identifier |
| `name` | string | Required, 1-100 chars | Display name |
| `email` | string | Required, valid email format | Login identifier |
| `role` | enum | Required, one of: user, admin | Access level |

---

## Contract Change Log

| Date | Changed endpoint | Change | Reason | Approval |
|---|---|---|---|---|
| <date> | <endpoint> | <what changed> | <why> | <who approved> |

---

## Verification Status

| Endpoint | Frontend implements | Backend implements | Contract test passes |
|---|---|---|---|
| <method> <path> | Yes/No/PR# | Yes/No/PR# | Yes/No/n/a |

---

## Revision Log

| Date | Change | Reason |
|---|---|---|
| <date> | Initial API contract created | Phase 3 architecture |
