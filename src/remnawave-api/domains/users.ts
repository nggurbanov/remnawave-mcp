import type { OperationRegistry, RuntimeOperationFactoryContext } from '../registry.js';

export function registerUserOperations(
  registry: OperationRegistry,
  context: RuntimeOperationFactoryContext,
): void {
  registry.register('users', 'list', context.supportedReadOperation(
    'users',
    'list',
    'List users from the panel-backed user surface.',
    'Send optional size/start, filters, filterModes, globalFilterMode, and sorting query fields.',
    'Generated OpenAPI-backed users collection read.',
    'users_list',
    'getUsers',
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'getUsers', 'users.list')(payload),
    }),
  ));

  registry.register('users', 'create', context.supportedWriteOperation(
    'users',
    'create',
    'Create a user when the payload is complete and valid.',
    'Provide username, telegramId, and expireAt to create a single user.',
    'Generated OpenAPI-backed user creation.',
    { username: 'new-user', telegramId: 123456, expireAt: '2026-05-01T00:00:00.000Z' },
    'users_create',
    'createUser',
    context.validateCreateUserPayload,
    async (client, payload) => ({
      result: await context.requireClientMethod(client, 'createUser', 'users.create')(payload),
    }),
  ));

}
