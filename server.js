const fastify = require("fastify");
const fastifyEnv = require("@fastify/env");
const healthRoute = require("./routes/health");

const app = fastify({ logger: true });

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: {
      type: "string",
      default: 3001,
    },
  },
};

const options = {
  schema,
  dotenv: true,
};

app.register(fastifyEnv, options).ready((err) => {
  if (err) console.error(err);
});

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
  console.dir(body, { depth: null });

  if (body.object === "page") {
    const senderId = body.entry[0].messaging[0].sender.id;
    // Returns a '200 OK' response to all requests
    getMessages(senderId);
    return reply.status(200).send("EVENT_RECEIVED");
  }
  return reply.status(404).send("EVENT_REJECTED");
});

const getMessages = (senderId) => {
  const mergbotResponses = [
    "merg is the werd",
    "wut",
    "FOR NO REASON",
    "meats pies whiskeys",
    "wanna go to a music festival?",
    "scooby dooby skit scat scattle doot",
    "joey this is where you come in - i need more things to say",
  ];
  const baseUrlGraphFacebook = "https://graph.facebook.com/v18.0";

  fetch(
    `${baseUrlGraphFacebook}/${process.env.PAGE_ID}/messages
  ?recipient={id:${senderId}}
  &message={text: ${
    mergbotResponses[Math.floor(Math.random() * mergbotResponses.length)]
  }}
  &messaging_type=RESPONSE
  &access_token=${process.env.PAT}`,
    { method: "POST" }
  )
    .then((res) => res.json())
    .then((res) => console.log("send msg resp: ", res))
    .catch((err) => console.log("ruh roh: ", err));
};

const port = process.env.PORT || 3001;
const host = "RENDER" in process.env ? "0.0.0.0" : "localhost";

const start = async () => {
  try {
    app.listen({ host, port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
