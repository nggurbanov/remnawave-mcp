import { describe, expect, test, vi } from 'vitest';

import { routeRemnawaveV3Request } from '../src/remnawave-api/v3.js';

const client = (fetch: typeof globalThis.fetch) => ({
  baseUrl: 'https://panel.example.test/',
  apiToken: 'test-token',
  fetch,
});

describe.each(['3.4.4', '3.4.11'] as const)('Remnawave %s route', (version) => {
  test('discovers user operations from the matching OpenAPI contract', async () => {
    const result = await routeRemnawaveV3Request({ domain: 'users' }, client(vi.fn()), version);
    expect(result).toMatchObject({ domain: 'users', version });
    expect((result as { operations: { operation: string }[] }).operations.map((item) => item.operation)).toContain('get_user_by_id');
  });

  test('uses numeric userId and encoded path for user reads', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ response: { id: 42 } }), {
      headers: { 'Content-Type': 'application/json' },
    }));
    const result = await routeRemnawaveV3Request({ domain: 'users', operation: 'get_user_by_id', payload: { userId: 42 } }, client(fetch), version);
    expect(fetch).toHaveBeenCalledWith('https://panel.example.test/api/users/42', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual({ response: { id: 42 } });
    expect(await routeRemnawaveV3Request({ domain: 'users', operation: 'get_user_by_id', payload: { userId: 'old-uuid' } }, client(fetch), version)).toMatchObject({ error: { code: 'INVALID_PATH_PARAMETER' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('requires confirmation before host cloning and forwards the JSON body once', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 204 }));
    const request = { domain: 'hosts', operation: 'clone_host', payload: { body: { uuid: 'host-uuid' } } };
    const challenge = await routeRemnawaveV3Request(request, client(fetch), version) as { error: { token: string } };
    expect(challenge.error.token).toEqual(expect.any(String));
    expect(fetch).not.toHaveBeenCalled();
    const result = await routeRemnawaveV3Request({ ...request, confirmToken: challenge.error.token }, client(fetch), version);
    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith('https://panel.example.test/api/hosts/actions/clone', expect.objectContaining({ method: 'POST', body: JSON.stringify({ uuid: 'host-uuid' }) }));
  });
});

test.each([
  ['create_host', 'CreateHostBodyDto'],
  ['update_host', 'UpdateHostBodyDto'],
  ['set_port_to_hosts', 'UpdateManyHostsBodyDto'],
])('describes %s using the matching version’s host schema', async (operation, schemaName) => {
  const request = { domain: 'hosts', operation };
  const fetch = vi.fn();
  const old = await routeRemnawaveV3Request(request, client(fetch), '3.4.4');
  const current = await routeRemnawaveV3Request(request, client(fetch), '3.4.11');

  expect(old).toMatchObject({ components: { schemas: { [schemaName]: { type: 'object' } } } });
  expect(old).not.toHaveProperty(['components', 'schemas', schemaName, 'properties', 'includeInSrrRules']);
  expect(current).toMatchObject({
    requestBody: { content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` } } } },
    components: {
      schemas: {
        [schemaName]: { properties: { includeInSrrRules: { type: 'array', items: { type: 'string' } } } },
      },
    },
    confirmationRequired: true,
  });
  const requiredPath = ['components', 'schemas', schemaName, 'required'];
  expect(current).not.toHaveProperty(requiredPath, expect.arrayContaining(['includeInSrrRules']));
  expect(fetch).not.toHaveBeenCalled();
});

test('forwards includeInSrrRules on 3.4.11 host updates after confirmation', async () => {
  const response = { response: { includeInSrrRules: ['rule-1'] } };
  const fetch = vi.fn(async () => Response.json(response));
  const body = { uuid: '57f8bd78-2851-43a8-9c86-50d24a596cbb', includeInSrrRules: ['rule-1'] };
  const request = { domain: 'hosts', operation: 'update_host', payload: { body } };
  const challenge = await routeRemnawaveV3Request(request, client(fetch), '3.4.11') as { error: { token: string } };
  expect(fetch).not.toHaveBeenCalled();
  expect(challenge).toMatchObject({ error: { code: 'CONFIRMATION_REQUIRED', token: expect.any(String) } });

  const result = await routeRemnawaveV3Request({ ...request, confirmToken: challenge.error.token }, client(fetch), '3.4.11');
  expect(result).toEqual(response);
  expect(fetch).toHaveBeenCalledExactlyOnceWith('https://panel.example.test/api/hosts', expect.objectContaining({
    method: 'PATCH',
    body: JSON.stringify(body),
  }));
});
