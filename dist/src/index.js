"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const schema_1 = require("./schema/schema");
const context_1 = require("./context/context");
const server = new apollo_server_1.ApolloServer({ schema: schema_1.schema, context: context_1.context });
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
//# sourceMappingURL=index.js.map