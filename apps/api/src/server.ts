import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { greetRoute } from './routes/greet.js';

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: ['http://localhost:3000'],
});

await server.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'TypeScript Template API',
      description: 'API for TypeScript monorepo template',
      version: '0.1.0',
    },
  },
});

await server.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

await server.register(greetRoute, { prefix: '/api' });

const start = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();