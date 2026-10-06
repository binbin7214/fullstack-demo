import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors(); // 开启跨域，前端联调必备
  // 全局校验管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自动剔除dto中没有定义的字段（多余字段直接丢掉）
    transform: true, // 自动转换类型
  }));
  await app.listen(3001);
  console.log('服务启动: http://localhost:3001');
}
bootstrap();
