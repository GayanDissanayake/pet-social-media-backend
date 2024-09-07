import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Redirect,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
// import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleLogin(
    @Body() userData: { email: string; name: string; token: string },
  ) {
    // Call the AuthService to handle Google login or registration
    return this.authService.googleLogin(userData);
  }

  @Get('facebook')
  @Redirect()
  loginToFacebook() {
    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    const facebookLoginUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=email,public_profile`;

    return { url: facebookLoginUrl };
  }

  @Get('facebook/callback')
  async handleFacebookCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const { user, token } = await this.authService.facebookLogin(code);
      console.log(user);
      // Set the JWT token as an HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Redirect to the frontend with user details and token as query parameters
      res.redirect(
        `http://localhost:3000/facebook?token=${token}&name=${user.name}&email=${user.email}`,
      );
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Error authenticating with Facebook' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('verify/:email/:token')
  async verifyEmail(
    @Param('email') email: string,
    @Param('token') token: string,
  ) {
    return this.authService.verifyEmail(email, token);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
