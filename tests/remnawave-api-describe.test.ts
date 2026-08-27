import { describe, expect, test, vi } from 'vitest';

import { REMNAWAVE_OPENAPI_EXTRACT } from '../src/remnawave-api/generated/operations.js';
import { routeRemnawaveApiRequest } from '../src/remnawave-api/router.js';
import { DEFAULT_OPERATION_REGISTRY, type RemnawaveApiClient } from '../src/remnawave-api/registry.js';

function createClient(overrides: Partial<RemnawaveApiClient> = {}): RemnawaveApiClient {
  return {
    getSystemStats: async () => ({
      cpu: { cores: 4 },
      memory: { totalBytes: 10, freeBytes: 4, usedBytes: 6 },
      uptimeSeconds: 120,
      generatedAtUnixMs: 123,
      users: { total: 8, active: 6, disabled: 1, limited: 1, expired: 0 },
      online: { now: 2, lastDay: 4, lastWeek: 6, never: 0 },
      nodes: { totalOnlineUsers: 3, lifetimeBytes: 0n },
    }),
    createUser: async (payload) => ({ uuid: 'user-1', ...payload }),
    deleteNode: async (nodeUuid: string) => ({ uuid: nodeUuid, deleted: true }),
    ...overrides,
  };
}

function expectCompact(value: unknown): void {
  const serialized = JSON.stringify(value, (_key, item) => (typeof item === 'bigint' ? item.toString() : item));
  expect(serialized).not.toContain('"ok"');
  expect(serialized).not.toContain('"details"');
  expect(serialized).not.toContain('suggested_next_step');
  expect(serialized).not.toContain('recommended_next_operations');
  expect(serialized).not.toContain('execution_eligibility');
  expect(serialized).not.toContain('coaching');
}

describe('remnawave_api compact describe responses', () => {
  test('describes supported operations as compact metadata', async () => {
    const result = await routeRemnawaveApiRequest({ domain: 'system', operation: 'get_stats' }, createClient());

    expect(result).toMatchObject({
      domain: 'system',
      operation: expect.objectContaining({
        name: 'get_stats',
        disposition: 'supported',
        payloadExample: {},
        supportedOperations: expect.arrayContaining(['get_stats']),
      }),
      risk: { tier: 'tier1' },
    });
    expectCompact(result);
  });

  test('publishes every supported OpenAPI path and query parameter in discovery metadata', () => {
    const missingParameters: string[] = [];

    for (const operation of REMNAWAVE_OPENAPI_EXTRACT.operations) {
      const separator = operation.key.indexOf('.');
      const domain = operation.key.slice(0, separator);
      const operationName = operation.key.slice(separator + 1);
      const registration = DEFAULT_OPERATION_REGISTRY.get(domain, operationName);
      if (!registration) continue;

      for (const parameter of operation.parameters) {
        if (!Object.hasOwn(registration.validation.validationSchema.properties, parameter.name)) {
          missingParameters.push(`${operation.key}:${parameter.name}`);
        }
      }
    }

    expect(missingParameters).toEqual([]);
    expect(DEFAULT_OPERATION_REGISTRY.describeOperation('hosts', 'get')).toMatchObject({
      validationRulesSummary: expect.arrayContaining([
        expect.stringContaining('payload.uuid is required'),
      ]),
      payloadExample: { uuid: expect.any(String) },
    });
  });

  test('publishes executable payload examples for every supported operation', () => {
    const invalidExamples: Array<{ key: string; issues: unknown }> = [];

    for (const domain of DEFAULT_OPERATION_REGISTRY.listDomains()) {
      for (const registration of DEFAULT_OPERATION_REGISTRY.listOperations(domain)) {
        const issues = registration.validation.validatePayload(registration.validation.payloadExample);
        if (issues.length > 0) {
          invalidExamples.push({
            key: `${domain}.${registration.discovery.operation}`,
            issues,
          });
        }
      }
    }

    expect(invalidExamples).toEqual([]);
  });

  test('denied operations return compact unsupported_operation errors', async () => {
    const result = await routeRemnawaveApiRequest({ domain: 'auth', operation: 'login', payload: {} }, createClient());

    expect(result).toMatchObject({
      error: {
        code: expect.stringMatching(/DENIED_OPERATION|UNSUPPORTED_OPERATION|UNSUPPORTED_DOMAIN/),
        kind: 'unsupported_operation',
        retryable: false,
      },
    });
    expectCompact(result);
  });
});
