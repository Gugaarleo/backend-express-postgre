import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
      }
      console.log('🔄 Conectando ao PostgreSQL via Prisma...');
      await this.prisma.$connect();
      console.log('✅ PostgreSQL conectado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('PostgreSQL desconectado');
    } catch (error) {
      console.error('Erro ao desconectar do PostgreSQL:', error);
    }
  }
}

export const prisma = Database.getInstance().client;
export default Database.getInstance();
