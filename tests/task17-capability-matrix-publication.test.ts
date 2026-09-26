import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '..');

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('task 17 published capability matrix and support boundary', () => {
  test('keeps the README focused on single-tool v1 API', () => {
    const readme = readRepoFile('README.md');

    expect(readme).toContain('## Current status');
    expect(readme).toContain('- Runtime model: local stdio server only');
    expect(readme).toContain('- Supported Remnawave version gate: `3.3.2`');
    expect(readme).toContain('## Quickstart: Using the single-tool API');
    expect(readme).toContain('remnawave_api');
    expect(readme).toContain('### Currently executable operations');
    expect(readme).toContain('system.get_stats');
    expect(readme).toContain('users.create');
    expect(readme).toContain('These operations are currently `supported` and executable');
    expect(readme).not.toContain('remote hosted transport');
    expect(readme).not.toContain('This README claims all OpenAPI paths are supported.');
  });

  test('publishes capability classes without endpoint-inventory framing', () => {
    const matrix = readRepoFile('docs/scope/capability-matrix.md');

    expect(matrix).toContain('| Capability class | Meaning |');
    expect(matrix).toContain('`supported`');
    expect(matrix).toContain('`sensitive-read`');
    expect(matrix).toContain('`dangerous-write`');
    expect(matrix).toContain('`deferred`');
    expect(matrix).toContain('`dropped`');

    expect(matrix).toContain('Do not read this matrix as endpoint coverage or as a claim that all OpenAPI paths are supported.');
    expect(matrix).not.toContain('This matrix is endpoint coverage.');
    expect(matrix).not.toContain('This matrix claims all OpenAPI paths are supported.');
  });

  test('keeps release readiness aligned with single-tool MVP boundary', () => {
    const readiness = readRepoFile('docs/release/production-readiness.md');

    expect(readiness).toContain('published capability matrix remains the authoritative capability-level support record');
    expect(readiness).toContain('single-tool contract');
    expect(readiness).toContain('remnawave_api');
    expect(readiness).toContain('This is a capability boundary, not an endpoint inventory.');

    expect(readiness).not.toContain('This report claims all OpenAPI paths are supported.');
    expect(readiness).not.toContain('This report is endpoint coverage.');
  });

  test('publishes current internal squad all-user operations with confirmation semantics', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');

    expect(actionRegistry).toContain('| internal squads | Internal squad definition update | `internal_squads.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| internal squads | All-user internal squad membership update | `internal_squads.add_users` / `internal_squads.remove_users` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('DELETE /api/internal-squads/{uuid}/bulk-actions/remove-users');

    expect(actionRegistry).not.toContain('| internal squads | Internal squad lifecycle | `internal_squads.lifecycle.manage` | atomic | high | dangerous-write | required |');
    expect(actionRegistry).not.toContain('| internal squads | Internal squad membership bulk assignment | `internal_squads.membership.bulk_assign` | composite | high | dangerous-write | required |');
  });

  test('publishes current external squad all-user operations with confirmation semantics', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');

    expect(actionRegistry).toContain('| external squads | External squad delivery-definition update | `external_squads.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| external squads | All-user external squad membership update | `external_squads.add_users` / `external_squads.remove_users` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('DELETE /api/external-squads/{uuid}/bulk-actions/remove-users');
    expect(actionRegistry).not.toContain('| external squads | External squad lifecycle | `external_squads.lifecycle.manage` | atomic | high | dangerous-write | required |');
    expect(actionRegistry).not.toContain('| external squads | External squad membership bulk assignment | `external_squads.membership.bulk_assign` | composite | high | dangerous-write | required |');
  });

  test('publishes dangerous node actions as supported only through the shared tier3 confirmation gate', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');
    const scopeDoc = readRepoFile('docs/scope/remnawave-api-v1-scope.md');
    const readiness = readRepoFile('docs/release/production-readiness.md');

    expect(actionRegistry).toContain('Historical note: this document is a planning inventory, not the current runtime contract.');
    expect(actionRegistry).toContain('| nodes | Node restart control | `nodes.restart` / `nodes.restart_all` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('shared tier3 confirmation flow');
    expect(actionRegistry).not.toContain('`nodes.manage_lifecycle`');
    expect(actionRegistry).not.toContain('`nodes.manage_maintenance`');

    for (const publishedText of [scopeDoc, readiness]) {
      expect(publishedText).toContain('nodes.restart');
      expect(publishedText).toContain('tier3 confirmation');
    }
  });

  test('publishes template atomic operations as supported runtime operations and defers only broader delivery workflows', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');

    expect(actionRegistry).toContain('| templates | Subscription template list | `templates.list` | atomic | low | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| templates | Subscription template read | `templates.get` | atomic | low | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| templates | Subscription template create | `templates.create` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| templates | Subscription template update | `templates.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| templates | Subscription template delete | `templates.delete` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| templates | Broader subscription-template delivery workflows | `templates.delivery_workflows` | composite | medium | deferred | blocked-until-designed | none | 3.3.2-openapi-evidenced |');

    expect(actionRegistry).not.toContain('`templates.manage_subscription`');
    expect(actionRegistry).not.toContain('Create/update/delete/reorder semantics remain deferred');
    expect(actionRegistry).not.toContain('Template inventory selection and broader delivery workflows are not promoted');
    expect(actionRegistry).not.toContain('| templates | Subscription template lifecycle | `templates.subscription.manage` | atomic | high | dangerous-write | required |');
    expect(actionRegistry).not.toContain('| templates | Client-specific template variant editors | `templates.client_variant_editor` | composite | medium | unresolved-ui-action | blocked-until-designed |');
  });

  test('publishes snippet atomic operations as supported runtime operations and defers only sync/broader lifecycle workflows', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');

    expect(actionRegistry).toContain('| snippets | Snippet list | `snippets.list` | atomic | low | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| snippets | Snippet create | `snippets.create` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| snippets | Snippet update | `snippets.update` | atomic | medium | supported | not-required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| snippets | Snippet delete | `snippets.delete` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).toContain('| snippets | Snippet sync and broader lifecycle workflows | `snippets.sync_and_lifecycle` | composite | medium | deferred | blocked-until-designed | none | 3.3.2-openapi-evidenced |');

    expect(actionRegistry).not.toContain('`snippets.manage_lifecycle`');
    expect(actionRegistry).not.toContain('snippet create/update/delete semantics are not promoted');
    expect(actionRegistry).not.toContain('Snippet create/update/delete behavior remains deferred');
  });

  test('publishes subscription page config lifecycle as supported guarded operations', () => {
    const actionRegistry = readRepoFile('docs/panel/action-registry.md');
    expect(actionRegistry).toContain('| subscription page | Subscription page config lifecycle | `subscription_page_configs.create` / `subscription_page_configs.update` / `subscription_page_configs.delete` / `subscription_page_configs.clone` / `subscription_page_configs.reorder` | atomic | high | supported | required | none | 3.3.2-verified-surface |');
    expect(actionRegistry).not.toContain('| subscription page | Subscription page configuration lifecycle | `subscription_page.configuration.manage` | atomic | high | dangerous-write | required |');
    expect(actionRegistry).not.toContain('| subscription page | Public subscription page delivery/read flow | `subscription_page.delivery.inspect` | composite | medium | sensitive-read | not-required |');
  });

  test('publishes the admin-safe system observability boundary without speculative debug helpers', () => {
    const readme = readRepoFile('README.md');
    const scopeDoc = readRepoFile('docs/scope/remnawave-api-v1-scope.md');
    const matrix = readRepoFile('docs/scope/capability-matrix.md');
    const readiness = readRepoFile('docs/release/production-readiness.md');

    expect(readme).toContain('system.get_metadata');
    expect(readme).toContain('system.get_bandwidth_stats');
    expect(readme).toContain('system.get_node_statistics');
    expect(readme).toContain('keygen.generate_node_secret');
    expect(readme).toContain('system.generate_x25519_keypairs');
    expect(readme).not.toContain('system.debug_srr_matcher');

    for (const publishedText of [scopeDoc]) {
      expect(publishedText).toContain('system.get_bandwidth_stats');
      expect(publishedText).toContain('system.get_node_statistics');
      expect(publishedText).toContain('keygen.generate_node_secret');
      expect(publishedText).toContain('system.generate_x25519_keypairs');
      expect(publishedText).not.toContain('system.debug_srr_matcher');
    }
    const readinessBeforeDenied = readiness.split('## Deferred and excluded surfaces')[0] ?? readiness;
    expect(readinessBeforeDenied).toContain('system.generate_x25519_keypairs');
    expect(readinessBeforeDenied).not.toContain('system.debug_srr_matcher');

    expect(matrix).toContain('| system observability | `system` | partially supported | `get_stats`, `get_metadata`, `get_health`, `get_nodes_metrics`, `get_recap`, and `get_node_statistics` are supported; debug endpoints are denied, while `system.generate_x25519_keypairs` is published as a sensitive key-generation workflow. |');
    expect(matrix).toContain('| bandwidth stats | `system` | supported | `get_bandwidth_stats` operation provides aggregate bandwidth statistics. |');
    expect(matrix).toContain('keygen.generate_node_secret');
    expect(matrix).toMatch(/\| Fully supported \| 16 \|[^\n]*keygen \|/u);
    expect(matrix).toContain('| keygen | `supported` | Key generation is supported as a bounded, read-only utility operation. |');
    expect(matrix).not.toContain('get_request_history');
  });

  test('publishes routing and control-plane rule management as deferred rather than as a generic executable surface', () => {
    const readme = readRepoFile('README.md');
    const scopeDoc = readRepoFile('docs/scope/remnawave-api-v1-scope.md');
    const matrix = readRepoFile('docs/scope/capability-matrix.md');
    const readiness = readRepoFile('docs/release/production-readiness.md');
    const workflowContract = readRepoFile('docs/contracts/priority-workflow-contract.md');

    expect(readme).toContain('Runtime discovery is supported-only.');
    expect(readme).not.toContain('routing.manage_rules');

    // Scope the check to the supported operations section; migration section may mention legacy grouped names
    const supportedSection = readme.split('### Currently executable operations')[1]?.split('###')[0] ?? '';
    expect(supportedSection).not.toContain('hosts.manage_routing');
    expect(readme).not.toContain('routing.manage_rules');

    expect(scopeDoc).toContain('`routing` | excluded |');
    expect(scopeDoc).toContain('No operations are currently executable; routing remains deferred from the MCP surface.');
    expect(scopeDoc).toContain('No operations are currently executable; routing remains deferred from the MCP surface.');

    expect(matrix).toContain('| Routing / control-plane rule management | `deferred` | No standalone executable seam | No routing-rule or response-rule management seam is currently exposed through the model-facing MCP runtime; generic topology/control-plane orchestration remains deferred. |');
    expect(matrix).not.toContain('hosts.manage_routing');

    const readinessBeforeMigration = readiness.split('## Migration and compatibility')[0] ?? readiness;
    expect(readinessBeforeMigration).not.toContain('hosts.manage_routing');
    expect(readiness).toContain('No standalone routing or response-rule control-plane seam is published as executable in this release.');

    expect(workflowContract).toContain('Routing / server-routing / response-rule change remains deferred from the current MCP support promise.');
  });
});
