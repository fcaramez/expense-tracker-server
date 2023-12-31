import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EditUserDto, LoginDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, username, password } = signupDto;

    if (!email || !username || !password) {
      throw new BadRequestException({
        message: 'All fields are mandatory.',
        success: false,
      });
    }

    try {
      const userToFind = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userToFind) {
        throw new ForbiddenException({
          success: false,
          message: 'This user already exists',
        });
      }

      const profilePicture = `https://ui-avatars.com/api/?name=${username}`;

      const hashedPassword = await argon.hash(password);

      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          avatar: profilePicture,
        },
      });

      delete newUser.password;

      const authToken = await this.signToken(
        newUser.userId,
        newUser.email,
        newUser.username,
      );

      return {
        message: `Welcome, ${username}!`,
        success: true,
        data: { ...newUser },
        token: authToken,
      };
    } catch (error: any) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }

  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;

      if (!email || !password) {
        throw new BadRequestException({
          message: 'All fields are mandatory.',
          success: false,
        });
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      const verify = await argon.verify(user.password, password);

      if (!verify || !user) {
        throw new UnauthorizedException({
          message: 'Wrong Credentials',
          success: false,
        });
      }
      delete user.password;

      const { username, userId } = user;
      const authToken = await this.signToken(userId, username, user.email);

      return {
        message: `Welcome back, ${user.username}`,
        success: true,
        data: { ...user },
        token: authToken,
      };
    } catch (error: any) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }

  async editUser(dto: EditUserDto, userId: string) {
    try {
      const { username, income, email, phoneNumber } = dto;

      if (!username || !income || !email || !phoneNumber) {
        throw new BadRequestException({
          message: 'All fields are mandatory.',
          success: false,
        });
      }

      const userToUpdate = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          username,
          income: Number(income),
          email,
          phoneNumber,
        },
        select: {
          username: true,
          income: true,
          email: true,
          phoneNumber: true,
        },
      });

      return {
        message: 'Account fully updated',
        data: {
          ...userToUpdate,
        },
        success: true,
      };
    } catch (error) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }

  signToken(id: string, email: string, username: string): Promise<string> {
    const payload = {
      username,
      id,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '12h',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
