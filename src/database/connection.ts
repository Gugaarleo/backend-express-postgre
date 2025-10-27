import { PrismaClient } from '@prisma/client';

// Singleton global para evitar múltiplas conexões em serverless
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

class Database {
  private static instance: Database;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  get client(): PrismaClient {
    return prisma;
  }

  async connect(): Promise<void> {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
      }
      console.log('🔄 Conectando ao PostgreSQL via Prisma...');
      await prisma.$connect();
      console.log('✅ PostgreSQL conectado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error);
      // Não faz exit em serverless
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      console.log('PostgreSQL desconectado');
    } catch (error) {
      console.error('Erro ao desconectar do PostgreSQL:', error);
    }
  }
}

export default Database.getInstance();
