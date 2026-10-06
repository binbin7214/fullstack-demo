import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  // 新增todos
  async create(userId: number, title: string, content: string) {
    return this.prisma.todos.create({
      data: {
        title,
        content,
        userId,
        finished: 0,
      },
    });
  }

  // 查询当前用户所有todos
  async findAll(userId: number) {
    return this.prisma.todos.findMany({
      where: { userId },
      orderBy: { create_time: 'desc' },
    });
  }

  // 查询单条todos（带越权校验）
  async findOne(userId: number, todoId: number) {
    const todo = await this.prisma.todos.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      throw new NotFoundException('待办不存在');
    }
    if (todo.userId !== userId) {
      throw new ForbiddenException('无权访问该待办');
    }
    return todo;
  }

  // 更新todos（带越权校验）
  async update(
    userId: number,
    todoId: number,
    data: { title?: string; content?: string; finished?: number },
  ) {
    // 先查一下存不存在、是不是你的
    await this.findOne(userId, todoId);

    return this.prisma.todos.update({
      where: { id: todoId },
      data,
    });
  }

  // 删除todos（带越权校验）
  async remove(userId: number, todoId: number) {
    await this.findOne(userId, todoId);

    return this.prisma.todos.delete({
      where: { id: todoId },
    });
  }
}
