import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN SENT:", token);

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ""
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;