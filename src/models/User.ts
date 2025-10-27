// Este arquivo substitui o antigo model do Mongoose por tipos do Prisma.
// Mantido para compatibilidade com imports legados.

import { User as PrismaUser } from '@prisma/client';

export type IUser = PrismaUser;

// Não há export default de Model aqui; use os serviços Prisma em src/services/authService.ts
