// utils/socket.util.js
import { Server } from "socket.io";
import logger from "./logger.util.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.APP_URL || "http://localhost:5174", // Change in production
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket"], // Disable polling for stability
    });

    io.on("connection", (socket) => {
        logger.info(`🔌 Socket connected: ${socket.id}`);

        // Join user-specific room
        socket.on("join-user", (userId) => {
            if (!userId) return;
            socket.join(`user:${userId}`);
            logger.info(`User ${userId} joined room user:${userId}`);
        });

        // Join election room (for live results)
        socket.on("join-election", (electionId) => {
            if (!electionId) return;
            socket.join(`election:${electionId}`);
            logger.info(`Joined election room: ${electionId}`);
        });

        socket.on("disconnect", (reason) => {
            logger.warn(`❌ Socket disconnected: ${socket.id} | ${reason}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};