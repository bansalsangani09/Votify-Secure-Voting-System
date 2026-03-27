// server.js
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import logger from "./utils/logger.util.js";
import startCronJobs from "./services/cron.service.js";
import { startBlockchainMonitoring } from "./services/blockchainHealth.service.js";
import startBlockchainListeners from "./services/blockchainListener.service.js";
import { initSocket } from "./utils/socket.util.js";

// Connect Database
await connectDB();

// Start Background Services
startCronJobs();
startBlockchainMonitoring(30000);
startBlockchainListeners();

// 🔥 Create HTTP server manually
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
initSocket(server);

// 🔥 IMPORTANT: Use server.listen (NOT app.listen)
server.listen(PORT, () => {
    logger.info(`🚀 Server running in development mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});