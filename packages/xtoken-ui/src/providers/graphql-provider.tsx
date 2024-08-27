import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { PropsWithChildren } from "react";

const uri = import.meta.env.VITE_GRAPHQL_ENDPOINT || "";

export default function GraphqlProvider({ children }: PropsWithChildren<unknown>) {
  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
