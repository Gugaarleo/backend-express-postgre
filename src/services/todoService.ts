import { Priority, Todo } from '@prisma/client';
import { prisma } from '../database/connection';

export interface CreateTodoDTO {
  title: string;
  description?: string;
  dueDate?: string | Date | null;
  completed?: boolean;
  priority?: Priority;
}

export interface UpdateTodoDTO {
  title: string;
  description?: string;
  dueDate?: string | Date | null;
  completed: boolean;
  priority: Priority;
}

export interface PartialUpdateTodoDTO {
  title?: string;
  description?: string;
  dueDate?: string | Date | null;
  completed?: boolean;
  priority?: Priority;
}

export interface ListQuery {
  completed?: string; // 'true' | 'false'
  priority?: Priority;
  title?: string; // substring match
  dueFrom?: string; // ISO date
  dueTo?: string; // ISO date
}

class TodoService {
  async create(userId: string, data: CreateTodoDTO): Promise<Todo> {
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const todo = await prisma.todo.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? '',
        dueDate,
        completed: data.completed ?? false,
        priority: data.priority ?? 'medium',
      },
    });

    console.log(`📝 Todo criado: ${todo.id} por usuário ${userId}`);
    return todo;
  }

  async list(userId: string, query: ListQuery): Promise<Todo[]> {
    const where: any = { userId };

    if (typeof query.completed === 'string') {
      if (query.completed === 'true' || query.completed === 'false') {
        where.completed = query.completed === 'true';
      }
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }

    if (query.dueFrom || query.dueTo) {
      where.dueDate = {};
      if (query.dueFrom) where.dueDate.gte = new Date(query.dueFrom);
      if (query.dueTo) where.dueDate.lte = new Date(query.dueTo);
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`📋 Listados ${todos.length} todos para usuário ${userId}`);
    return todos;
  }

  async getById(userId: string, todoId: string): Promise<Todo | null> {
    const todo = await prisma.todo.findUnique({ where: { id: todoId } });
    if (!todo) return null;
    if (todo.userId !== userId) {
      const err = new Error('FORBIDDEN');
      // @ts-ignore sinalizar tipo de erro
      err.code = 403;
      throw err;
    }
    return todo;
  }

  async replace(userId: string, todoId: string, data: UpdateTodoDTO): Promise<Todo | null> {
    const existing = await prisma.todo.findUnique({ where: { id: todoId } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      const err = new Error('FORBIDDEN');
      // @ts-ignore
      err.code = 403;
      throw err;
    }

    const updated = await prisma.todo.update({
      where: { id: todoId },
      data: {
        title: data.title,
        description: data.description ?? '',
        completed: data.completed,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
    console.log(`✏️ Todo substituído: ${updated.id} por usuário ${userId}`);
    return updated;
  }

  async updatePartial(userId: string, todoId: string, data: PartialUpdateTodoDTO): Promise<Todo | null> {
    const existing = await prisma.todo.findUnique({ where: { id: todoId } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      const err = new Error('FORBIDDEN');
      // @ts-ignore
      err.code = 403;
      throw err;
    }

    const updated = await prisma.todo.update({
      where: { id: todoId },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        completed: data.completed !== undefined ? data.completed : existing.completed,
        priority: data.priority !== undefined ? data.priority : existing.priority,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : existing.dueDate,
      },
    });
    console.log(`🛠️ Todo atualizado parcialmente: ${updated.id} por usuário ${userId}`);
    return updated;
  }

  async remove(userId: string, todoId: string): Promise<boolean | null> {
    const existing = await prisma.todo.findUnique({ where: { id: todoId } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      const err = new Error('FORBIDDEN');
      // @ts-ignore
      err.code = 403;
      throw err;
    }
    await prisma.todo.delete({ where: { id: todoId } });
    console.log(`🗑️ Todo removido: ${todoId} por usuário ${userId}`);
    return true;
  }
}

export default new TodoService();
