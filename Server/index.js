// GraphQL Libraries && TypeDefs && Resolvers
import GraphQLJSON from "graphql-type-json";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
// Apollo Libraries
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { MemcachedCache } from "apollo-server-cache-memcached";

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import http from 'http';

import { join } from "path";

import bodyParser from "body-parser";

import resolvers from "./src/GraphQL/Resolvers/index.js";

import jwt from 'jsonwebtoken';
import models from "./src/models/index.js";
import * as dotenv from "dotenv";

import { Server as SocketIOServer } from "socket.io";

// Start DotENV
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env",
});

// Extract JWT_SECRET
const secret = process.env.JWT_SECRET;

const connectSocketIO = () => {
  
}
const startServer = async () => {
    try{
        const app = express();

        app.use(express.json());
        
        /// CORS middleware'ini ekleyin
        app.use(cors({
            origin: 'http://localhost:3000', // React uygulamanızın URL'sini buraya yazın
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // İzin vermek istediğiniz HTTP metodları
            credentials: true, // Eğer cookie ya da authorization bilgisi gönderiyorsanız
        }));
        
        /*app.use(cors({
          origin: 'https://quoridor-game.vercel.app', // React uygulamanızın URL'sini buraya yazın
          methods: ['GET', 'POST', 'PUT', 'DELETE'], // İzin vermek istediğiniz HTTP metodları
          credentials: true, // Eğer cookie ya da authorization bilgisi gönderiyorsanız
      }));*/
        const PORT = 5000;
        
        
        mongoose.connect(process.env.MONGO_URI
        ).then(() => {
            console.log('MongoDB connection successful');
            
        }).catch(err => {
            console.log('MongoDB connection failed', err);
        }); 
        
        
            // Create the GraphQL schema using the type definitions and resolvers
        const schema = makeExecutableSchema({
          typeDefs: mergeTypeDefs(
            loadFilesSync(join("./src/GraphQL/**/**/**/*.graphql"), "utf8")
          ), // Read and Merge TypeDefs
          resolvers: {
            ...mergeResolvers(resolvers), // Merge Resolvers
            JSON: GraphQLJSON, // Import Scalar JSON Schema
          },
        });
        
        
        // Create an HTTP server using the Express app
        const httpServer = http.createServer(app);
        
        // Initialize Socket.io
        const io = new SocketIOServer(httpServer, {
          cors: {
              origin: "http://localhost:3000", // Update with frontend URL
              methods: ["GET", "POST"],
              credentials: true,
          },
        });

        let rooms = {}; // To store room data
        let availableRoom = null; // Track available room

        io.on('connection', (socket) => {
          console.log('A user connected:', socket.id);

          // Handle player joining a room
          socket.on('join-room', (playerName) => {
            let roomId;

            // If there is an available room with only 1 player, join it
            if (availableRoom && rooms[availableRoom].players.length < 2) {
              roomId = availableRoom;
            } else {
              // Create a new room if none is available
              roomId = socket.id; // Use a unique ID for the room (could use UUID for more complex needs)
              rooms[roomId] = { players: [] };
              availableRoom = roomId; // Set this as the available room
            }

            // Add the player to the room and assign roles
            let playerRole = rooms[roomId].players.length === 0 ? 'player1' : 'player2';
            rooms[roomId].players.push({ id: socket.id, name: playerName, role: playerRole });
            socket.join(roomId);

            // Notify players in the room about the current players
            io.to(roomId).emit('room-update', rooms[roomId].players);

            // Notify all players that a player has joined
            io.to(roomId).emit('message', `${playerName} has joined the room as ${playerRole}`);
            console.log(playerName, "has joined room", roomId, "as", playerRole);

            // Start the game if two players are in the room
            if (rooms[roomId].players.length === 2) {
              console.log(rooms[roomId].players);
              io.to(roomId).emit('start-game', rooms[roomId].players); // Send both players to start-game event
              availableRoom = null; // Reset available room since it's now full
            } else {
              // Inform the first player to wait for the second player
              socket.emit('waiting');
            }
          });

          // Handle moves made by a player
          socket.on('player-move', (playerId, actionData) => {
            console.log("The ", actionData, "sended to Backend", playerId);
            io.to(playerId).emit('receive-move', actionData);
          });

          // Handle player disconnection
          socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);

            // Remove the player from the room
            for (const roomId in rooms) {
              rooms[roomId].players = rooms[roomId].players.filter(player => player.id !== socket.id);
              io.to(roomId).emit('room-update', rooms[roomId].players);

              // If a room becomes empty, delete it
              if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
              }
            }

            // If the available room player disconnects, clear it
            if (availableRoom && rooms[availableRoom].players.length === 0) {
              availableRoom = null;
            }
          });
        });


        // Create an Apollo Server instance with the schema and an HTTP server plugin
        const server = new ApolloServer({
          schema, 
          cacheControl: { defaultMaxAge: 5 },
          // plugins: [LogMiddleware, ApolloServerPluginDrainHttpServer({ httpServer })],
          plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
          context: async ({req}) => {
            const token = req.headers.authorization || '';
            let user = null;

            if(token){
              try {
                const decoded = jwt.verify(token.replace("Bearer", ""), secret);
                user = await models.User.findById(decoded.id);
              } catch (error) {
                console.log('Authentication error:', error);
              }
            }
            return {...models, user};
          },
        });
        
        //app.use('/api/auth', require('./src/routes/auth'));
        await server.start();



        // Set up middleware for handling requests
        app.use(
          "/",
          //cors(corsOptions),
          bodyParser.json({ limit: "50mb" }),
            expressMiddleware(server, {
              context: async ({ req }) => {
                return {...models, secret}
            }  
          })
        )

      // Start the HTTP server and listen on the specified port
      await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    }catch(e){
        console.log('Error starting server: ',e);
    }
}

startServer();