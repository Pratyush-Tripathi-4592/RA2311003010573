import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import apiRoutes from './routes/apiRoutes';
import { Log } from '../logging_middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Log('backend', 'fatal', 'route', `Unhandled error: ${err.message}`).catch(() => {});
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await Log('backend', 'info', 'route', `Server started on port ${PORT}`);
});
