import { ApolloServer } from "apollo-server";
import { schema } from "./schema/schema";
import { context } from "./context/context";

const server = new ApolloServer({ schema, context });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
