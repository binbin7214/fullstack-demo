import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'my-secret-key-2026',
    });
  }

  async validate(payload: any) {
    // payload就是jwt里的内容，挂载到req.user
    return { id: payload.sub, username: payload.username };
  }
}
