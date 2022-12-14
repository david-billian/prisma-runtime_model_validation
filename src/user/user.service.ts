import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { assert, define, is, object, pattern, size, string } from 'superstruct';
import { Prisma, user } from '@prisma/client';
import * as Joi from 'joi';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userDto: any): Promise<user> {
    //custom validation by superstruct

    //   const userCreateValidate = object({
    //     email: define('email', (e: any) => {
    //       if (pattern(e, /^[a-zA-Z0-9 _-]*$/)) {
    //         throw new NotFoundException('Name should be valid format');
    //       }
    //       this.prisma.user
    //         .findFirst({
    //           where: { email: e },
    //         })
    //         .then((result) => {
    //           if (result) throw new NotFoundException('email already exists');
    //         });
    //       return true;
    //     }),
    //     password: size(string(), 7, 30),
    //     first_name: size(string(), 2, 50),
    //     last_name: size(string(), 2, 50),
    //   });

    //   assert(userDto, userCreateValidate);

    //custom validation by Joi
    const method = async (value) => {
      const userEmail = await this.prisma.user.findFirst({
        where: { email: value },
        select: { email: true },
      });
      if (userEmail)
        throw new UnprocessableEntityException('Email already exists');
    };

    const schema = Joi.object({
      first_name: Joi.string()
        .min(3)
        .max(30)
        .pattern(new RegExp(/^[a-zA-Z0-9 _-]*$/))
        .error(
          new UnprocessableEntityException('first_name should be valid format'),
        ),
      last_name: Joi.string()
        .pattern(new RegExp(/^[a-zA-Z0-9 _-]*$/))
        .min(3)
        .max(30)
        .error(
          new UnprocessableEntityException('last_name should be valid format'),
        ),

      password: Joi.string()
        .pattern(
          new RegExp(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@~()$!%*?&])[A-Za-z\d@~()$!%*?&]/,
          ),
        )
        .error(
          new UnprocessableEntityException(
            'Password must have at least one uppercase letter, one lowercase letter, one number and one special character (~@$!%*?&)',
          ),
        ),

      confirm_password: Joi.string()
        .equal(Joi.ref('password'))
        .error(
          new UnprocessableEntityException(
            'confirm_password should be match with pssword',
          ),
        ),

      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .external(method)
        .error(
          new UnprocessableEntityException('Email should be valid format'),
        ),
    });

    await schema.validateAsync(userDto);
    delete userDto.confirm_password;
    const userData = await this.prisma.user.create({
      data: userDto,
    });
    delete userData.password;
    return userData;
  }
}
