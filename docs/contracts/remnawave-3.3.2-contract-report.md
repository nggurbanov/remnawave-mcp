# Remnawave 3.3.2 Contract Report

This report is the current source-of-truth contract baseline for the MCP compatibility layer. It is based on the official Remnawave 3.3.2 OpenAPI snapshot supplied for this upgrade; no live panel mutation was performed.

## Provenance

- Panel/API version: `3.3.2`
- Vendored snapshot: `src/remnawave-api/openapi/remnawave-openapi-3.3.2.json`
- SHA-256: `60d2dabf9c170829f6e807135df84e78e0c8a005820bcb8dd78127cb9d33bc33`
- Inventory: 155 paths, 205 OpenAPI operations, 143 supported operations across 19 runtime domains
- Backend contract: exact `@remnawave/backend-contract@3.3.2`

## Material compatibility boundaries

| Boundary | 3.3.2 contract |
|---|---|
| User identity | Numeric `id`/`userId`; user response and resolver contracts no longer expose or accept user UUID selectors |
| User resolver | Exactly one of `id`, `shortUuid`, or `username` |
| User-scoped routes | `/api/users/{userId}`, `/api/hwid/devices/{userId}`, `/api/metadata/user/{userId}` |
| Protected subscriptions | `/api/subscriptions/by-id/{userId}` and `/api/subscriptions/connection-keys/{userId}` |
| Node restart | Both single-node and restart-all requests require `forceRestart` |
| Squad all-user mutations | `add-users`/`remove-users` accept only the squad `uuid`, use POST/DELETE respectively, and require MCP confirmation because they affect every user |
| Connection control | `/api/connections/*` is inventoried but explicitly excluded from MCP runtime discovery |

## Verification

- Deterministic extraction and generated inventory tests compare checked-in artifacts with the vendored snapshot.
- Numeric user-ID regression tests use official 3.3.2 response shapes without the removed `uuid` field.
- Current capability and scope documentation is checked against the runtime-supported inventory.
- Built stdio MCP smoke verifies the single-tool discovery boundary and representative 3.3.2 operation descriptions.

The older `remnawave-contract-report.md` is retained only as an explicitly historical 2.7.4 live-panel capture.
