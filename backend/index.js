import { ApolloServer } from "@apollo/server"

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildContext } from "graphql-passport";
import path from "path";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

import mergedResolvers from "./resolvers/index.js"
import mergedTypeDefs from "./typeDefs/index.js" 
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from "./db/connectDB.js";
import { configurePassport } from "./passport/passport.config.js";

dotenv.config();
configurePassport();

const __dirname = path.resolve();
const app=express();
const httpServer = http.createServer(app);

const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection:"sessions",
  
});
store.on("error", function (error) {
  console.log(error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,//this option specifies whether you want to save the session data back to the session store, even if the session was never modified during the request.
    saveUninitialized: false,
    cookie:{
      maxAge: 1000*60*60*24*7,//1 week
      httpOnly:true,//prevents client side js from accessing the cookie
    },
    store: store,

  })
)
app.use(passport.initialize());
app.use( passport.session());




app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});



const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],//
})

await server.start()







app.use(
  '/graphql',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req,res }) =>buildContext({ req,res}),
  }),
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/graphql`);