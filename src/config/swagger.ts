import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { getRegistry } from "./openApiRegistry";

const registry = getRegistry();

registry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  in: "header",
});

export function setupSwagger(app: Express) {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  const swaggerDoc = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description:
        "API documentation generated with zod-to-openapi + swagger-ui-express",
    },
    security: [{ Bearer: [] }],
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local dev server",
      },
    ],
  });

  app.get("/api-docs/json", (req, res) => {
    res.json(swaggerDoc);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}
