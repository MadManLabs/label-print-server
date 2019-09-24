'use strict';

/**
 *
 * @param {import('fastify').FastifyInstance} server
 */
function registerRoutes(server) {
  server.register(require('./labels'));
}

module.exports = registerRoutes;