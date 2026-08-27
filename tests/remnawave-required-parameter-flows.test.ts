import { describe, expect, test, vi } from 'vitest';

import { RemnawaveClient } from '../src/client/index.js';
import { createRemnawaveApiClientAdapter } from '../src/remnawave-api/client-adapter.js';
import type { RemnawaveApiClient } from '../src/remnawave-api/registry.js';
import { routeRemnawaveApiRequest } from '../src/remnawave-api/router.js';

function createDiscoveryClient(): RemnawaveApiClient {
  return { getSystemStats: async () => ({}) };
}

function createFetchMock() {
  return vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) => new Response(
      JSON.stringify({ response: [] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ),
  );
}

describe('required OpenAPI parameter flows', () => {
  test('discovers hwid.get_user_devices as a supported read', async () => {
    const result = await routeRemnawaveApiRequest({ domain: 'hwid' }, createDiscoveryClient());

    expect(result).toMatchObject({
      domain: 'hwid',
      operations: expect.arrayContaining([
        expect.objectContaining({ name: 'get_user_devices', disposition: 'supported', write: false }),
      ]),
    });
  });

  test('describes hwid.get_user_devices with its required 3.3.2 userId', async () => {
    const result = await routeRemnawaveApiRequest(
      { domain: 'hwid', operation: 'get_user_devices' },
      createDiscoveryClient(),
    );

    expect(result).toMatchObject({
      domain: 'hwid',
      operation: expect.objectContaining({
        name: 'get_user_devices',
        payloadExample: { userId: 1 },
        validationRulesSummary: expect.arrayContaining([
          expect.stringContaining('payload.userId is required'),
        ]),
        openapi: {
          method: 'get',
          path: '/api/hwid/devices/{userId}',
          operationId: 'HwidUserDevicesController_getUserHwidDevices',
          requestSchemaKey: null,
          responseSchemaKeys: expect.any(Array),
        },
      }),
    });
  });

  test('rejects hwid.get_user_devices without userId before HTTP execution', async () => {
    const fetchMock = createFetchMock();
    const client = createRemnawaveApiClientAdapter(new RemnawaveClient({
      baseUrl: 'https://panel.example.test',
      apiToken: 'token-value',
      fetch: fetchMock,
    }));

    const result = await routeRemnawaveApiRequest(
      { domain: 'hwid', operation: 'get_user_devices', payload: {} },
      client,
    );

    expect(result).toMatchObject({
      error: {
        code: 'INVALID_PAYLOAD',
        issues: expect.arrayContaining([
          expect.objectContaining({ field: 'payload.userId', code: 'REQUIRED' }),
        ]),
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('substitutes hwid userId into the outgoing request path', async () => {
    const fetchMock = createFetchMock();
    const client = createRemnawaveApiClientAdapter(new RemnawaveClient({
      baseUrl: 'https://panel.example.test',
      apiToken: 'token-value',
      fetch: fetchMock,
    }));

    await routeRemnawaveApiRequest(
      { domain: 'hwid', operation: 'get_user_devices', payload: { userId: 2726 } },
      client,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://panel.example.test/api/hwid/devices/2726',
      expect.objectContaining({ method: 'GET', body: undefined }),
    );
  });

  test('rejects a missing required query parameter before HTTP execution', async () => {
    const fetchMock = createFetchMock();
    const client = createRemnawaveApiClientAdapter(new RemnawaveClient({
      baseUrl: 'https://panel.example.test',
      apiToken: 'token-value',
      fetch: fetchMock,
    }));

    const result = await routeRemnawaveApiRequest({
      domain: 'bandwidth_stats',
      operation: 'list_nodes_usage',
      payload: { start: '2026-05-01' },
    }, client);

    expect(result).toMatchObject({
      error: {
        code: 'INVALID_PAYLOAD',
        issues: expect.arrayContaining([
          expect.objectContaining({ field: 'payload.end', code: 'REQUIRED' }),
        ]),
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('serializes required query parameters', async () => {
    const fetchMock = createFetchMock();
    const client = createRemnawaveApiClientAdapter(new RemnawaveClient({
      baseUrl: 'https://panel.example.test',
      apiToken: 'token-value',
      fetch: fetchMock,
    }));

    await routeRemnawaveApiRequest({
      domain: 'bandwidth_stats',
      operation: 'list_nodes_usage',
      payload: { start: '2026-05-01', end: '2026-05-06' },
    }, client);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://panel.example.test/api/bandwidth-stats/nodes?start=2026-05-01&end=2026-05-06',
      expect.objectContaining({ method: 'GET', body: undefined }),
    );
  });
});
