import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import connectDB from "./config/db.js";

import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

await connectDB();


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chomelea-5c0yqodto-kinuthia110s-projects.vercel.app"
    ],
    credentials: true
  })
);
  


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
app.use("/api/mpesa", mpesaRoutes);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({
      embed: true
    })
  ]
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ req })
  })
);

app.get("/", (req, res) => {
  res.send("CHOMELEA Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});