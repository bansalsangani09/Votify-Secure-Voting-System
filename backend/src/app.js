import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import electionRoutes from './routes/election.routes.js';
import voteRoutes from './routes/vote.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import healthRoutes from './routes/health.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Custom Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`\x1b[35m[API-LOG]\x1b[0m ${req.method} ${req.url}`);
    next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Votify Enterprise API Running (ESM)' });
});

// Error Handler
app.use(errorHandler);

export default app;
