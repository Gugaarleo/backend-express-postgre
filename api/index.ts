import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes';
import protectedRoutes from '../src/routes/protectedRoutes';
import todoRoutes from '../src/routes/todoRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log para debug em produção
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Export para Vercel Serverless
export default app;
