const fastify = require("fastify");
const healthRoute = require("./routes/health");

const app = fastify({ logger: true });

app.register(healthRoute, { prefix: "/health" });

app.get("/", async (req, reply) => ({ root: true }));

app.get("/webhook", (req, reply) => {
  // Parse the query params
  const mode = req.query["hub.mode"];
  console.log("🚀 ~ file: server.js:13 ~ app.get ~ mode:", mode);
  const token = req.query["hub.verify_token"];
  console.log("🚀 ~ file: server.js:15 ~ app.get ~ token:", token);
  const challenge = req.query["hub.challenge"];
  console.log("🚀 ~ file: server.js:17 ~ app.get ~ challenge:", challenge);

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === "mytoken") {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      reply.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      reply.sendStatus(403);
    }
  }
});

app.post("/webhook", async (req, reply) => {
  const body = req.body;

  console.log(`\u{1F7EA} Received webhook:`);
  console.log("body.object = ", body.object);
  console.dir(body, { depth: null });

  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    return reply.status(200).send("EVENT_RECEIVED");
  }
  return reply.status(404).send("EVENT_REJECTED");
});

const start = async () => {
  try {
    await app.listen({ port: 3001 });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
