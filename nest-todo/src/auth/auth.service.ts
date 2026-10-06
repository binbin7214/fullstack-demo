import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    // ✅ users
    const existUser = await this.prisma.users.findUnique({ where: { username } });
    if (existUser) throw new BadRequestException('用户名已存在');
    const hashPwd = await bcrypt.hash(password, 10);
    // ✅ users
    const user = await this.prisma.users.create({
      data: { username, password: hashPwd },
      select: { id: true, username: true, create_time: true },
    });
    return { msg: '注册成功', user };
  }

  async login(username: string, password: string) {
    // ✅ users
    const user = await this.prisma.users.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('用户名不存在');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('密码错误');
    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return { msg: '登录成功', token };
  }
}
