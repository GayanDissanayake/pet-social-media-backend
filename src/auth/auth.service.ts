import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/schemas/user.schema';

// import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const {
        // password,
        ...result
      } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.createUser(
      createUserDto.name,
      createUserDto.email,
      hashedPassword,
    );
    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.updateUser(user);

    // Send verification email
    await this.sendVerificationEmail(user, verificationToken);
    return user;
  }

  private async sendVerificationEmail(user: User, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'gayansasankadissanayake@gmail.com',
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: 
             ${process.env.FRONTEND_URL}/verify?email=${user.email}&token=${token}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('User not found');
    }
    if (user.emailVerificationToken === null) {
      console.log('User already verified');
      throw new UnauthorizedException('User already verified');
    }
    if (user.emailVerificationExpires.getTime() < Date.now()) {
      console.log('Token expired');
      throw new UnauthorizedException('expired token');
    }
    if (user.emailVerificationToken !== token) {
      console.log('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await this.usersService.updateUser(user);
  }
}
