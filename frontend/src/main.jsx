import React from "react";

import ReactDOM
from "react-dom/client";

import {
  ApolloProvider
} from "@apollo/client/react";

import client
from "./apollo/client.js";

import "./index.css";

import App
from "./App.jsx";
import { Toaster } from "react-hot-toast";
ReactDOM.createRoot(

  document.getElementById("root")

).render(
<React.StrictMode>
  <ApolloProvider client={client}>
    <App />
    <Toaster position="top-right" />
  </ApolloProvider>
</React.StrictMode>
);