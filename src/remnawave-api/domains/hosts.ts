import type { OperationRegistry, RuntimeOperationFactoryContext } from '../registry.js';

export function registerHostOperations(
  registry: OperationRegistry,
  context: RuntimeOperationFactoryContext,
): void {
  registry.register('hosts', 'bulk_update', context.supportedWriteOperation(
    'hosts',
    'bulk_update',
    'Update ports for a bounded host set.',
    'Send payload with hostUuids and port through the OpenAPI bulk-update endpoint.',
    'Atomic OpenAPI-backed host bulk-update action.',
    { hostUuids: ['host-uuid'], port: 443 },
    'hosts_bulk_update',
    'bulkUpdateHosts',
    context.validateHostsBulkUpdatePayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'bulkUpdateHosts', 'hosts.bulk_update')(
        context.readRequiredStringArrayField(payload, 'hostUuids', 'hosts.bulk_update'),
        { port: context.readRequiredIntegerField(payload, 'port', 'hosts.bulk_update') },
      ),
    }),
  ));
}
