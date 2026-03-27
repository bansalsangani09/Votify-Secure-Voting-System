// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    transports: ["websocket"], // Stable
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
});

export default socket;