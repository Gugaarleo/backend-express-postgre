// Este arquivo substitui o antigo model do Mongoose por tipos do Prisma.
// Mantido para compatibilidade com imports legados.

import { Todo as PrismaTodo, Priority } from '@prisma/client';

// Reexporta o enum Priority do Prisma
export { Priority };

// Interface compatível com o antigo ITodo, baseada no modelo do Prisma
export type ITodo = PrismaTodo;

// Não há export default de Model aqui; use os serviços Prisma em src/services/todoService.ts
