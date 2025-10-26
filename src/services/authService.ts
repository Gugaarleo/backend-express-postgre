import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

class AuthService {
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET as string;

    if (!secret) {
      throw new Error('JWT_SECRET não está definida');
    }

    // @ts-ignore - TypeScript tem problemas com StringValue do ms
    return jwt.sign({ id: userId }, secret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { name, email, password } = data;

      // Validações básicas
      if (!name || !email || !password) {
        console.log('❌ Tentativa de registro com campos vazios');
        return {
          success: false,
          message: 'Nome, email e senha são obrigatórios',
        };
      }

      // Validação de email
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        console.log(`❌ Tentativa de registro com email inválido: ${email}`);
        return {
          success: false,
          message: 'Email inválido',
        };
      }

      // Validação de senha
      if (password.length < 6) {
        console.log('❌ Tentativa de registro com senha muito curta');
        return {
          success: false,
          message: 'Senha deve ter no mínimo 6 caracteres',
        };
      }

      // Verifica se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`❌ Tentativa de registro com email já existente: ${email}`);
        return {
          success: false,
          message: 'Email já cadastrado',
        };
      }

      // Cria o usuário
      const user = await User.create({ name, email, password });


      console.log(`✅ Usuário registrado com sucesso: ${email}`);

      return {
        success: true,
        message: 'Usuário registrado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error: any) {
      console.error('❌ Erro ao registrar usuário:', error);
      
      // Tratamento de erros específicos do Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return {
          success: false,
          message: messages.join(', '),
        };
      }

      return {
        success: false,
        message: 'Erro ao registrar usuário',
      };
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Validações básicas
      if (!email || !password) {
        console.log('❌ Tentativa de login com campos vazios');
        return {
          success: false,
          message: 'Email e senha são obrigatórios',
        };
      }

      // Validação de email
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        console.log(`❌ Tentativa de login com email inválido: ${email}`);
        return {
          success: false,
          message: 'Email inválido',
        };
      }

      // Busca o usuário incluindo a senha
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        console.log(`❌ Tentativa de login com email não encontrado: ${email}`);
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Verifica a senha
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        console.log(`❌ Tentativa de login com senha inválida para: ${email}`);
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Gera o token
      const token = this.generateToken(user.id);

      console.log(`✅ Login realizado com sucesso: ${email}`);

      return {
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao realizar login:', error);
      return {
        success: false,
        message: 'Erro ao realizar login',
      };
    }
  }

  verifyToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error('JWT_SECRET não está definida');
      }

      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
