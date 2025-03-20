import app from './app.js';
import { createServer } from 'http';
import connectDB from './config/db.js';
import initializeSocket from './socket/socketServer.js';

connectDB();

const server = createServer(app);
const io = initializeSocket(server);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});