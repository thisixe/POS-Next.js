import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { connectDB } from './config/db';
import { typeDefs, resolvers } from './graphql';
import { getUser } from './middleware';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
    // Connect to MongoDB
    await connectDB();

    // Create Express app
    const app = express();

    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // Start Apollo Server
    await server.start();

    // Configure multer for file uploads
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });
    const upload = multer({ storage });

    app.use(cors());
    app.use(express.json());
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Upload endpoint
    app.post('/api/upload', upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    });

    // Health check endpoint
    app.get('/health', (_, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // GraphQL endpoint
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization || '';
                const user = await getUser(token);
                return { user };
            },
        })
    );

    // Start server
    app.listen(PORT, () => {
        console.log(`
🚀 Server ready!
   - GraphQL: http://localhost:${PORT}/graphql
   - Health:  http://localhost:${PORT}/health
    `);
    });
}

startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
