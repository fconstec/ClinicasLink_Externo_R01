import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API ClínicasLink_Externo',
      version: '1.0.0',
      description: 'Documentação da API ClínicasLink_Externo utilizando Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João da Silva' },
            birthDate: { type: 'string', format: 'date', example: '1980-01-01' },
            email: { type: 'string', example: 'joao@email.com' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/controllers/clinicSettingsController/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default function swaggerDocs(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}