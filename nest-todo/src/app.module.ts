import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    // 全局加载 .env 文件
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
