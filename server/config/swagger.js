/**
 * ============================================================
 * Crudier CRM — Swagger OpenAPI 3.0 Specifications
 * ============================================================
 * Export OpenAPI specifications for the platform routes.
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Crudier CRM API',
    version: '1.0.0',
    description: 'Enterprise-grade Workspace + CRM + Collaboration platform REST API documentation',
    contact: {
      name: 'API Support',
      email: 'support@crudier-crm.local',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API version 1 root',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
      cookieAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check API and Database Health Status',
        responses: {
          200: {
            description: 'API and database are healthy',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user & retrieve tokens',
        responses: {
          200: { description: 'Authenticated and token returned' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
