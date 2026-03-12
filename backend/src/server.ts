import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import moduleRoutes from './routes/moduleRoutes';
import baseRoutes from './routes/baseRoutes';
import userRoutes from './routes/userRoutes';
import historyRoutes from './routes/historyRoutes';
import processRoutes from './routes/processRoutes';
import crmRoutes from './routes/crmRoutes';
import { startCleanupJob } from './jobs/cleanupJob';

dotenv.config();

const app = express();

// Segurança: Rate Limiting (Limite de requisições)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 tentativas por IP
  message: { error: 'Muitas tentativas de acesso, tente novamente em 15 minutos.' }
});

// Segurança: Headers HTTP
app.use(helmet());

// Segurança: CORS (Permite local para dev e origens do .env)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://app.gsacreditus.com.br',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080'
].filter(Boolean); // Remove nulos caso FRONTEND_URL não esteja definido

app.use(cors({
  origin: (origin, callback) => {
    // Se não houver origin (ex: mobile ou ferramentas como Postman) ou se estiver na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido para esta origem'));
    }
  },
  credentials: true
}));

// Parsing de JSON
app.use(express.json());

// Rotas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/bases', baseRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/crm', crmRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Iniciar job de limpeza de links expirados
  startCleanupJob();
});
