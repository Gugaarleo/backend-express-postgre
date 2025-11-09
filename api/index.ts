import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes';
import protectedRoutes from '../src/routes/protectedRoutes';
import todoRoutes from '../src/routes/todoRoutes';

dotenv.config();

const app = express();

// CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: '*', // Em produção, substitua por seu domínio do frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para capturar erros de JSON inválido
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ JSON inválido recebido:', err.message);
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
      detail: err.message
    });
  }
  next(err);
});

// Log detalhado para debug
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none'
  }));
  console.log('Body:', JSON.stringify(req.body));
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

// Rota de debug
app.post('/api/debug/echo', (req, res) => {
  res.json({
    success: true,
    receivedHeaders: req.headers,
    receivedBody: req.body,
    timestamp: new Date().toISOString()
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
