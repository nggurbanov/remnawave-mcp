import { describe, expect, test, vi } from 'vitest';

import { routeRemnawaveV3Request } from '../src/remnawave-api/v3.js';

const client = (fetch: typeof globalThis.fetch) => ({
  baseUrl: 'https://panel.example.test/',
  apiToken: 'test-token',
  fetch,
});

describe('Remnawave 3.4.4 route', () => {
  test('discovers user operations from the pinned 3.4.4 contract', async () => {
    const result = await routeRemnawaveV3Request({ domain: 'users' }, client(vi.fn()));
    expect(result).toMatchObject({ domain: 'users', version: '3.4.4' });
    expect((result as { operations: { operation: string }[] }).operations.map((item) => item.operation)).toContain('get_user_by_id');
  });

  test('uses numeric userId and encoded path for user reads', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ response: { id: 42 } }), {
      headers: { 'Content-Type': 'application/json' },
    }));
    const result = await routeRemnawaveV3Request({ domain: 'users', operation: 'get_user_by_id', payload: { userId: 42 } }, client(fetch));
    expect(fetch).toHaveBeenCalledWith('https://panel.example.test/api/users/42', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual({ response: { id: 42 } });
    expect(await routeRemnawaveV3Request({ domain: 'users', operation: 'get_user_by_id', payload: { userId: 'old-uuid' } }, client(fetch))).toMatchObject({ error: { code: 'INVALID_PATH_PARAMETER' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('requires confirmation before host cloning and forwards the JSON body once', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 204 }));
    const request = { domain: 'hosts', operation: 'clone_host', payload: { body: { uuid: 'host-uuid' } } };
    const challenge = await routeRemnawaveV3Request(request, client(fetch)) as { error: { token: string } };
    expect(challenge.error.token).toEqual(expect.any(String));
    expect(fetch).not.toHaveBeenCalled();
    const result = await routeRemnawaveV3Request({ ...request, confirmToken: challenge.error.token }, client(fetch));
    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith('https://panel.example.test/api/hosts/actions/clone', expect.objectContaining({ method: 'POST', body: JSON.stringify({ uuid: 'host-uuid' }) }));
  });
});
