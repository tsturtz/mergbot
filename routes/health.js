const healthRoutes = (fastify, options, done) => {
  fastify.get("/", async (req, reply) => ({ status: "UP" }));

  done();
};

module.exports = healthRoutes;
