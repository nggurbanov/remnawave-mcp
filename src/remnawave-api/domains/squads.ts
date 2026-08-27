import { validateSquadBulkUsersPayload } from '../schema.js';
import type { OperationRegistry, RuntimeOperationFactoryContext } from '../registry.js';

function uuid(payload: Record<string, unknown>): string {
  return String(payload.uuid ?? '');
}

export function registerSquadOperations(registry: OperationRegistry, context: RuntimeOperationFactoryContext): void {
  registry.register('internal_squads', 'add_users', context.supportedWriteOperation(
    'internal_squads',
    'add_users',
    'Add all users to one internal squad.',
    'Send the squad uuid. This affects every user and requires confirmation.',
    'OpenAPI-backed internal squad membership mutation.',
    { uuid: 'squad-uuid' },
    'internal_squads_add_users',
    'bulkAddUsersToInternalSquad',
    validateSquadBulkUsersPayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'bulkAddUsersToInternalSquad', 'internal_squads.add_users')(uuid(payload)),
    }),
  ));

  registry.register('internal_squads', 'remove_users', context.supportedWriteOperation(
    'internal_squads',
    'remove_users',
    'Remove all users from one internal squad.',
    'Send the squad uuid. This affects every user and requires confirmation.',
    'OpenAPI-backed internal squad membership mutation.',
    { uuid: 'squad-uuid' },
    'internal_squads_remove_users',
    'bulkRemoveUsersFromInternalSquad',
    validateSquadBulkUsersPayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'bulkRemoveUsersFromInternalSquad', 'internal_squads.remove_users')(uuid(payload)),
    }),
  ));

  registry.register('external_squads', 'add_users', context.supportedWriteOperation(
    'external_squads',
    'add_users',
    'Add all users to one external squad.',
    'Send the squad uuid. This affects every user and requires confirmation.',
    'OpenAPI-backed external squad membership mutation.',
    { uuid: 'squad-uuid' },
    'external_squads_add_users',
    'bulkAddUsersToExternalSquad',
    validateSquadBulkUsersPayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'bulkAddUsersToExternalSquad', 'external_squads.add_users')(uuid(payload)),
    }),
  ));

  registry.register('external_squads', 'remove_users', context.supportedWriteOperation(
    'external_squads',
    'remove_users',
    'Remove all users from one external squad.',
    'Send the squad uuid. This affects every user and requires confirmation.',
    'OpenAPI-backed external squad membership mutation.',
    { uuid: 'squad-uuid' },
    'external_squads_remove_users',
    'bulkRemoveUsersFromExternalSquad',
    validateSquadBulkUsersPayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'bulkRemoveUsersFromExternalSquad', 'external_squads.remove_users')(uuid(payload)),
    }),
  ));
}
