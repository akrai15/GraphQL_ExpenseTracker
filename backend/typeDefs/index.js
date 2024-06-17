import { mergeTypeDefs } from "@graphql-tools/merge";
import transactionTypeDef from "./transaction.typeDef.js";
import userTypeDef from "./user.typeDef.js";

const mergedTypeDefs=mergeTypeDefs([transactionTypeDef,userTypeDef]);
export default mergedTypeDefs;