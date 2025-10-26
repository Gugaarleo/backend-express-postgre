import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from '../src/database/connection';
import authRoutes from '../src/routes/authRoutes';
import protectedRoutes from '../src/routes/protectedRoutes';
import todoRoutes from '../src/routes/todoRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa conexão com Postgres via Prisma uma vez
database.connect().catch(() => {/* handled in connection */});

// Rotas
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Autenticação funcionando!',
    version: '1.0.0',
  });
});

app.use('/api', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api', todoRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

export default app;
