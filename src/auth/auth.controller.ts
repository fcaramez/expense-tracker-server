import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { EditUserDto, LoginDto, SignupDto } from './dto';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Patch('/edit')
  @UseGuards(JwtGuard)
  editUser(@Body() dto: EditUserDto, @GetUser('userId') userId: string) {
    return this.authService.editUser(dto, userId);
  }

  @Get('/profile')
  @UseGuards(JwtGuard)
  getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
