# Panel Action Registry (Task 1)

This registry is the authoritative Task 1 inventory for panel-parity MCP planning.
It is action-oriented (human admin intents), not endpoint-oriented.

Historical note: this document is a planning inventory, not the current runtime contract. Current runtime support is defined by the compact v2 docs in `README.md` and `docs/scope/remnawave-api-v1-scope.md`. When this registry discusses broader product actions, treat them as planning context unless they are mirrored there as current supported runtime operations.

## Scope and source precedence

1. Sidebar-domain seed list from the panel-parity planning inventory.
2. Hosted API docs root: `https://docs.rw/api/`.
3. Vendored OpenAPI artifact: `src/remnawave-api/openapi/remnawave-openapi-3.3.2.json`.
4. Overview docs root: `https://docs.rw/docs/overview/introduction/` (+ linked overview/features pages).
5. Current capability context: `docs/scope/capability-matrix.md`.

## Classification legend

- `support_class`: `supported` | `compat` | `advanced` | `sensitive-read` | `dangerous-write` | `deferred` | `dropped` | `unresolved-ui-action`
- `risk_tier`: `low` | `medium` | `high`
- `preview_requirement`: `required` | `recommended` | `not-required` | `blocked-until-designed`
- `sensitive_read`: `none` | `redacted-default` | `explicit-reveal`
- `shape`: `atomic` | `composite`

## Version availability

`mcp-remnawave` currently hard-gates verified runtime support to Remnawave `3.3.2`.
Action families below are source-backed planning inventory and marked as:

- `3.3.2-verified-surface` when already represented in current verified capabilities.
- `3.3.2-openapi-evidenced` when evidenced in OpenAPI/docs but not yet implemented in current MCP surface.
- `version-uncertain` when durable source evidence for concrete action semantics is missing.

## Domain coverage summary

Sidebar seed domains covered in this registry (16/16):

1. users
2. internal squads
3. external squads
4. profiles
5. hosts
6. nodes
7. management
8. plugins
9. statistics
10. infra billing
11. traffic
12. metrics
13. settings
14. templates
15. response rules
16. subscription page

## Action-family registry

| sidebar_domain | action_family | semantic_mcp_name | shape | risk_tier | support_class | preview_requirement | sensitive_read | version_availability | source_traceability | blocker_note |
|---|---|---|---|---|---|---|---|---|---|---|
| users | User lifecycle management (create/edit/enable-disable/delete) | `users.lifecycle.manage` | atomic | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | plan seed domain; OpenAPI `UsersController_createUser` `POST /api/users`, `UsersController_updateUser` `PATCH /api/users`; hosted API `/api` | — |
| users | User identity resolution and directory lookup | `users.identity.resolve` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | capability matrix stable core users + users resolve; OpenAPI `UsersController_resolveUser` `POST /api/users/resolve`; hosted API `/api` | — |
| users | User subscription request-history inspection (detail drawer flow) | `users.subscription_history.inspect` | composite | medium | sensitive-read | not-required | redacted-default | 3.3.2-openapi-evidenced | OpenAPI `UsersController_getUserSubscriptionRequestHistory` `GET /api/users/{userId}/subscription-request-history`; plan modal/detail flow requirement | — |
| users | User bulk lifecycle campaigns | `users.bulk.lifecycle_campaign` | composite | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | OpenAPI `UsersBulkActionsController_bulkUpdateUsers` `POST /api/users/bulk/update`, `UsersBulkActionsController_bulkAllResetUserTraffic` `POST /api/users/bulk/all/reset-traffic`; plan bulk-flow requirement | — |
| internal squads | Internal squad definition update | `internal_squads.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | OpenAPI `InternalSquadController_updateInternalSquad` `PATCH /api/internal-squads`; current runtime inventory. | — |
| internal squads | All-user internal squad membership update | `internal_squads.add_users` / `internal_squads.remove_users` | atomic | high | supported | required | none | 3.3.2-verified-surface | OpenAPI `InternalSquadController_addUsersToInternalSquad` `POST /api/internal-squads/{uuid}/bulk-actions/add-users`, `InternalSquadController_removeUsersFromInternalSquad` `DELETE /api/internal-squads/{uuid}/bulk-actions/remove-users`; runtime inventory and tier3 confirmation gate. | Both operations affect every user; selected-user add/remove-many routes remain outside the current MCP surface. |
| external squads | External squad delivery-definition update | `external_squads.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | OpenAPI `ExternalSquadController_updateExternalSquad` `PATCH /api/external-squads`; current runtime inventory. | — |
| external squads | All-user external squad membership update | `external_squads.add_users` / `external_squads.remove_users` | atomic | high | supported | required | none | 3.3.2-verified-surface | OpenAPI `ExternalSquadController_addUsersToExternalSquad` `POST /api/external-squads/{uuid}/bulk-actions/add-users`, `ExternalSquadController_removeUsersFromExternalSquad` `DELETE /api/external-squads/{uuid}/bulk-actions/remove-users`; runtime inventory and tier3 confirmation gate. | Both operations affect every user and require confirmation. |
| profiles | Config profile lifecycle management | `profiles.lifecycle.manage` | atomic | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | OpenAPI `ConfigProfileController_createConfigProfile` `POST /api/config-profiles`; plan domain `profiles` | — |
| profiles | Computed profile preview/inspection | `profiles.computed.inspect` | composite | medium | sensitive-read | not-required | redacted-default | 3.3.2-openapi-evidenced | OpenAPI `ConfigProfileController_getComputedConfigProfileByUuid` `GET /api/config-profiles/{uuid}/computed-config`; plan detail-flow requirement | — |
| hosts | Host lifecycle management | `hosts.lifecycle.manage` | atomic | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | OpenAPI `HostsController_createHost` `POST /api/hosts`; hosted API `/api` | — |
| hosts | Host bulk rollout (enable/disable/delete/update) | `hosts.bulk.rollout` | composite | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | OpenAPI `HostsBulkActionsController_setPortToHosts` `PATCH /api/hosts/bulk/update`, `HostsBulkActionsController_enableHosts` `POST /api/hosts/bulk/enable`; plan bulk-flow requirement | — |
| nodes | Node restart control | `nodes.restart` / `nodes.restart_all` | atomic | high | supported | required | none | 3.3.2-verified-surface | The current runtime exposes single-node and all-node restart actions through the shared tier3 confirmation flow; both require `forceRestart`. | Other inventory-listed node operations are current atomic runtime operations; only composite maintenance orchestration remains planning-only here. |
| management | Auth + API token administration | `management.auth_and_tokens.manage` | composite | high | dangerous-write | required | explicit-reveal | 3.3.2-openapi-evidenced | OpenAPI `AuthController_oauth2Authorize` `POST /api/auth/oauth2/authorize`; `ApiTokensController_createApiToken` `POST /api/tokens`; overview docs mention OAuth and API key management in web UI | — |
| management | Connections async jobs (fetch-ips/poll/drop-connections) | `management.connections.orchestrate` | composite | high | dangerous-write | required | redacted-default | 3.3.2-openapi-evidenced | OpenAPI `ConnectionsController_connectionsByUser` `POST /api/connections/by-user/{userId}`, `ConnectionsController_connectionsByUserResult` `GET /api/connections/by-user/{jobId}`, `ConnectionsController_dropConnections` `POST /api/connections/drop` | — |
| plugins | Node plugin lifecycle management | `plugins.lifecycle.manage` | atomic | high | dangerous-write | required | none | 3.3.2-openapi-evidenced | OpenAPI `NodePluginController_createConfig` `POST /api/node-plugins`, `NodePluginController_updateConfig` `PATCH /api/node-plugins` | — |
| plugins | Plugin execution + torrent-blocker investigation flow | `plugins.investigate_and_execute` | composite | high | denied | blocked-until-designed | redacted-default | 3.3.2-verified-surface | The `node_plugins` domain is excluded from the current MCP runtime; no plugin executor or reporting actions are supported. Plugin executor actions stay denied because `src/server.ts` does not inject a truthful executor seam into the current compact v2 single-tool runtime contract. | Treat executor behavior as out of scope until a bounded model-facing contract exists; do not assume OpenAPI executor routes are MCP-supported. |
| statistics | Panel/system health and stats overview | `statistics.panel.overview` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | capability matrix stable `system_get_stats` and `system_get_health`; OpenAPI `SystemController_getStats` `GET /api/system/stats`, `SystemController_getRemnawaveHealth` `GET /api/system/health` | — |
| statistics | Recap statistics drilldown | `system.get_recap` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | OpenAPI `SystemController_getRecap` `GET /api/system/stats/recap`; current runtime inventory. | — |
| infra billing | Provider and node billing configuration | `infra_billing.update_provider` / `infra_billing.update_node` | atomic | high | supported | required | none | 3.3.2-verified-surface | OpenAPI `InfraBillingController_updateInfraProvider` `PATCH /api/infra-billing/providers`, `InfraBillingController_updateInfraBillingNode` `PATCH /api/infra-billing/nodes`; current runtime inventory. | Guarded atomic operations; broader combined billing orchestration remains planning-only. |
| infra billing | Billing history recording | `infra_billing.create_history_record` | atomic | high | supported | required | redacted-default | 3.3.2-verified-surface | OpenAPI `InfraBillingController_createInfraBillingRecord` `POST /api/infra-billing/history`; current runtime inventory. | — |
| traffic | User/node bandwidth consumption drilldown | `traffic.consumption.inspect` | composite | medium | advanced | not-required | redacted-default | 3.3.2-openapi-evidenced | OpenAPI `BandwidthStatsUsersController_getStatsNodesUsage` `GET /api/bandwidth-stats/users/{userId}`, `BandwidthStatsNodesController_getStatsNodeUsersUsage` `GET /api/bandwidth-stats/nodes/{uuid}/users` | — |
| metrics | Node metrics series and operational diagnostics | `metrics.nodes.inspect` | composite | medium | advanced | not-required | none | 3.3.2-openapi-evidenced | OpenAPI `SystemController_getNodesMetrics` `GET /api/system/nodes/metrics`; overview comparison docs mention built-in metrics in panel | — |
| settings | Remnawave panel settings management | `settings.panel.manage` | atomic | high | dangerous-write | required | explicit-reveal | 3.3.2-openapi-evidenced | OpenAPI `RemnawaveSettingsController_getSettings` `GET /api/remnawave-settings`, `RemnawaveSettingsController_updateSettings` `PATCH /api/remnawave-settings`; plan seed `settings` | — |
| settings | Subscription settings and HWID policy administration | `settings.subscription_policy.manage` | composite | high | dangerous-write | required | explicit-reveal | 3.3.2-openapi-evidenced | OpenAPI `SubscriptionSettingsController_getSettings` `GET /api/subscription-settings`, `SubscriptionSettingsController_updateSettings` `PATCH /api/subscription-settings`; feature docs `HWID device limit` shows settings flow | — |
| templates | Subscription template list | `templates.list` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports listing subscription templates through `templates.list`. | — |
| templates | Subscription template read | `templates.get` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports reading one subscription template through `templates.get`. | — |
| templates | Subscription template create | `templates.create` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports creating one subscription template through `templates.create`. | — |
| templates | Subscription template update | `templates.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports updating one subscription template through `templates.update`. | — |
| templates | Subscription template delete | `templates.delete` | atomic | high | supported | required | none | 3.3.2-verified-surface | Current single-tool contract supports deleting one subscription template through `templates.delete`, gated by the shared tier3 confirmation flow. | — |
| templates | Broader subscription-template delivery workflows | `templates.delivery_workflows` | composite | medium | deferred | blocked-until-designed | none | 3.3.2-openapi-evidenced | OpenAPI `SubscriptionTemplateController_reorderSubscriptionTemplates` `POST /api/subscription-templates/actions/reorder` is already exposed atomically; plan seed domain `templates`. | Atomic reorder is current; only composite delivery workflows remain outside the current MCP surface. |
| response rules | Response-rules management surface | `response_rules.manage` | composite | medium | unresolved-ui-action | blocked-until-designed | none | version-uncertain | sidebar seed includes `response rules`; OpenAPI has no `/response-rules` paths and no `ResponseRulesController_*` operations (`grep` count 0) | Missing durable API/UI evidence for semantic action model |
| subscription page | Subscription page config lifecycle | `subscription_page_configs.create` / `subscription_page_configs.update` / `subscription_page_configs.delete` / `subscription_page_configs.clone` / `subscription_page_configs.reorder` | atomic | high | supported | required | none | 3.3.2-verified-surface | OpenAPI `SubscriptionPageConfigController_updateConfig` `PATCH /api/subscription-page-configs`; current runtime inventory. | Guarded atomic lifecycle operations are current; composite page-delivery management remains planning-only. |
| snippets | Snippet list | `snippets.list` | atomic | low | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports listing snippets through `snippets.list`, backed by runtime `listSnippets` wiring in `src/server.ts` and registry execution in `src/remnawave-api/registry.ts`. | — |
| snippets | Snippet create | `snippets.create` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports creating one snippet through `snippets.create`. | — |
| snippets | Snippet update | `snippets.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface | Current single-tool contract supports updating one snippet through `snippets.update`. | — |
| snippets | Snippet delete | `snippets.delete` | atomic | high | supported | required | none | 3.3.2-verified-surface | Current single-tool contract supports deleting one snippet through `snippets.delete`, gated by the shared tier3 confirmation flow. | — |
| snippets | Snippet sync and broader lifecycle workflows | `snippets.sync_and_lifecycle` | composite | medium | deferred | blocked-until-designed | none | 3.3.2-openapi-evidenced | OpenAPI `SnippetsController_syncSnippet` `POST /api/snippets/actions/sync`; plan seed domain `snippets`. | Snippet sync and broader lifecycle workflows remain outside the current MCP surface. |

## Explicit unresolved-ui-action index

1. `response_rules.manage` (response rules domain)

This inventory entry remains intentionally unresolved until durable API/UI evidence exists for a truthful model-facing contract.
