// index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Updated import for React 18
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Import the Bootstrap JS bundle
import "./App.css"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root")); // Use createRoot instead of ReactDOM.render
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
