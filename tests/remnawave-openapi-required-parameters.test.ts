import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { SUPPORTED_REMNAWAVE_OPERATIONS } from '../src/remnawave-api/domains/runtime-scope.js';
import { REMNAWAVE_OPENAPI_EXTRACT } from '../src/remnawave-api/generated/operations.js';
import { DEFAULT_OPERATION_REGISTRY } from '../src/remnawave-api/registry.js';

const PARAMETER_LOCATIONS = ['path', 'query', 'header', 'cookie'] as const;
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'] as const;
const parameterSchema = z.object({
  name: z.string(),
  in: z.enum(PARAMETER_LOCATIONS),
  required: z.boolean().optional(),
}).passthrough();
const operationSchema = z.object({
  parameters: z.array(parameterSchema).optional(),
}).passthrough();
const pathItemSchema = z.record(z.string(), z.unknown());
const openApiSchema = z.object({
  paths: z.record(z.string(), pathItemSchema),
});
const openApi = openApiSchema.parse(JSON.parse(readFileSync(
  resolve('src/remnawave-api/openapi/remnawave-openapi-3.3.2.json'),
  'utf8',
)));

type Parameter = z.infer<typeof parameterSchema>;
type ParameterLocation = Parameter['in'];

function getOperationParameters(
  pathItem: Readonly<Record<string, unknown>>,
  method: string,
): readonly Parameter[] {
  const operation = operationSchema.parse(pathItem[method]);
  const inherited = pathItem.parameters === undefined
    ? []
    : z.array(parameterSchema).parse(pathItem.parameters);
  const merged = new Map<string, Parameter>();

  for (const parameter of inherited) {
    merged.set(`${parameter.in}:${parameter.name}`, parameter);
  }
  for (const parameter of operation.parameters ?? []) {
    merged.set(`${parameter.in}:${parameter.name}`, parameter);
  }

  return [...merged.values()];
}

function countRequiredParameters(rows: readonly Parameter[]): Readonly<Record<ParameterLocation, number>> {
  const counts: Record<ParameterLocation, number> = {
    path: 0,
    query: 0,
    header: 0,
    cookie: 0,
  };

  for (const parameter of rows) {
    if (parameter.required === true) {
      counts[parameter.in] += 1;
    }
  }

  return counts;
}

describe('Remnawave 3.3.2 required OpenAPI parameters', () => {
  test('keeps every required supported path, query, and header parameter in the MCP contract', () => {
    const allRequired: Parameter[] = [];
    for (const pathItem of Object.values(openApi.paths)) {
      for (const method of HTTP_METHODS) {
        if (pathItem[method] !== undefined) {
          allRequired.push(
            ...getOperationParameters(pathItem, method).filter((parameter) => parameter.required === true),
          );
        }
      }
    }

    const supportedRequired: Parameter[] = [];
    const missingBindings: string[] = [];
    for (const contract of SUPPORTED_REMNAWAVE_OPERATIONS) {
      const pathItem = openApi.paths[contract.openapi.path];
      if (pathItem === undefined) {
        missingBindings.push(`${contract.key}:missing-path`);
        continue;
      }

      const required = getOperationParameters(pathItem, contract.openapi.method)
        .filter((parameter) => parameter.required === true);
      supportedRequired.push(...required);
      const extracted = REMNAWAVE_OPENAPI_EXTRACT.operations.find((operation) => operation.key === contract.key);
      const registration = DEFAULT_OPERATION_REGISTRY.get(contract.domain, contract.operation);

      for (const parameter of required) {
        if (parameter.in === 'cookie') {
          missingBindings.push(`${contract.key}:${parameter.in}:${parameter.name}:unsupported-location`);
          continue;
        }

        const locationAndNameExtracted = extracted?.parameters.some(
          (candidate) => candidate.in === parameter.in && candidate.name === parameter.name,
        ) === true;
        const propertyPublished = registration !== undefined
          && Object.hasOwn(registration.validation.validationSchema.properties, parameter.name);
        const requiredByValidator = registration?.validation.validationSchema.required.includes(parameter.name) === true;
        const examplePublished = registration !== undefined
          && Object.hasOwn(registration.validation.payloadExample, parameter.name);

        if (!locationAndNameExtracted || !propertyPublished || !requiredByValidator || !examplePublished) {
          missingBindings.push(`${contract.key}:${parameter.in}:${parameter.name}`);
        }
      }
    }

    expect(countRequiredParameters(allRequired)).toEqual({ path: 76, query: 18, header: 0, cookie: 0 });
    expect(countRequiredParameters(supportedRequired)).toEqual({ path: 56, query: 6, header: 0, cookie: 0 });
    expect(missingBindings).toEqual([]);
  });
});
