import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

let registry: OpenAPIRegistry | null = null;

export function getRegistry(): OpenAPIRegistry {
  if (!registry) {
    registry = new OpenAPIRegistry();
  }
  return registry;
}
