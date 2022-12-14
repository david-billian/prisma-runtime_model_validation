import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { UserService } from './user.service';

@Controller('v1')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  create(@Body() userDto: any, @Res() reply: FastifyReply) {
    return this.userService
      .create(userDto)
      .then((user) => reply.code(HttpStatus.CREATED).send(user))
      .catch((err) => reply.send(err));
  }
}
