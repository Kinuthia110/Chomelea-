import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { ApolloServer } from "apollo-server-express";

import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";

import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use(
  "/quotations",
  express.static(path.join(process.cwd(), "src/invoices/generated"))
);

app.use(
  "/invoices",
  express.static(path.join(process.cwd(), "src/invoices/generated"))
);

app.use("/api/uploads", uploadRoutes);


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

await server.start();

server.applyMiddleware({
  app,
  path: "/graphql",
  cors: false
});

app.get("/", (req, res) => {
  res.send("CHOMELEA Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});