import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Req() req, @Body() body: { title: string; content: string }) {
    if (!body.title || body.title.trim() === '') {
      throw new BadRequestException('标题不能为空');
    }
    if (!body.content || body.content.trim() === '') {
      throw new BadRequestException('内容不能为空');
    }
    return this.todoService.create(req.user.id, body.title, body.content);
  }

  @Get()
  findAll(@Req() req) {
    return this.todoService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.todoService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; finished?: number },
  ) {
    return this.todoService.update(req.user.id, +id, body);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.todoService.remove(req.user.id, +id);
  }
}
