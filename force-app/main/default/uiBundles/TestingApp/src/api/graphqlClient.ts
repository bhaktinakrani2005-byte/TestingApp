/**
 * Thin GraphQL client: createDataSDK + data.graphql with centralized error handling.
 * Use with gql-tagged queries and generated operation types for type-safe calls.
 */
import { createDataSDK } from '@salesforce/sdk-data';

export async function executeGraphQL<
  TData,
  TVariables extends Record<string, unknown> | undefined = undefined,
>(query: string, variables?: TVariables): Promise<TData> {
  const data = await createDataSDK();
  // SDK types graphql() first param as string; at runtime it may accept gql DocumentNode too
  const response = await data.graphql?.<TData>({
    query,
    variables: variables as Record<string, unknown> | undefined,
  });

  if (!response) {
    throw new Error('GraphQL response is undefined');
  }

  if (response?.errors?.length) {
    const msg = response.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL Error: ${msg}`);
  }

  return response.data;
}

/**
 * GraphQL can return a complex nested structure for UI API fields (e.g., { value: "..." }).
 * This helper flattens these objects into a simple key-value record for easier consumption.
 *
 * @param data - The record or object to flatten.
 * @returns A flattened object where { value: x } becomes x.
 */
export function flattenGraphQLRecord<T>(data: any): T {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, field]) => [
      key,
      field !== null && typeof field === 'object' && 'value' in (field as any)
        ? (field as any).value
        : field,
    ])
  ) as T;
}

/**
 * Helper to fetch a single record from a UI API GraphQL query that returns a collection.
 * Extracts the first node from edges and flattens it.
 * 
 * @param query - GraphQL query string
 * @param objectName - The name of the object in the query (e.g., 'Contact')
 * @param variables - Query variables
 * @returns Flattened node data or null
 */
export async function fetchSingle<
  TNode,
  TQuery,
  TVariables extends Record<string, unknown> | undefined = undefined,
>(query: string, objectName: string, variables: TVariables): Promise<TNode | null> {
  const data = await executeGraphQL<TQuery, TVariables>(query, variables);
  const result = (data as any)?.uiapi?.query?.[objectName]?.edges?.[0]?.node;

  if (!result) {
    return null;
  }

  return flattenGraphQLRecord<TNode>(result);
}
