import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { User } from 'src/users/schemas/user.schema';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from '../email/templates';

// import { UserDocument } from '../users/schemas/user.schema';

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserProfile {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      url: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async googleLogin(userData: { email: string; name: string; token: string }) {
    // Validate Google token (you can validate the token with Google's API if needed)
    const decodedToken = this.jwtService.decode(userData.token);

    if (!decodedToken || decodedToken.email !== userData.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    // Check if user already exists
    let user = await this.usersService.findByEmail(userData.email);

    // If user doesn't exist, register them
    if (!user) {
      user = await this.usersService.createUser(
        userData.name,
        userData.email,
        null,
      );
    }

    // Generate a new JWT token for your app (not Google token)
    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    return {
      token,
      email: user.email,
      name: user.name,
      id: user._id,
    };
  }

  async facebookLogin(
    code: string,
  ): Promise<AuthResponse | { redirect: string }> {
    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.get<FacebookTokenResponse>(
      `https://graph.facebook.com/v16.0/oauth/access_token`,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch the user profile using the access token
    const userProfile = await this.getFacebookUserProfile(accessToken);

    // Check if the user already exists

    const existingUser = await this.usersService.findByEmail(userProfile.email);
    if (existingUser) {
      // Redirect to the login page if the user already exists
      return { redirect: `${process.env.FRONEND_URL}/auth/login` };
    }

    // Find or create the user in the database
    const user = await this.usersService.findOrCreateUser(
      userProfile.id,
      userProfile.name,
      userProfile.email,
    );

    // Generate a JWT token
    const payload = { userId: user._id }; // Use _id for MongoDB
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async getFacebookUserProfile(
    accessToken: string,
  ): Promise<FacebookUserProfile> {
    const profileResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token: accessToken,
      },
    });

    const profile = profileResponse.data as FacebookUserProfile;

    return profile;
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
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?email=${user.email}&token=${token}`;

    const templateData = {
      userName: user.name,
      verificationUrl,
    };

    const subject = emailVerificationTemplate.subject;
    const text = emailVerificationTemplate.generateText(templateData);
    const html = emailVerificationTemplate.generateHtml(templateData);

    await this.emailService.sendEmail(user.email, subject, text, html);
  }

  async verifyEmail(
    email: string,
    token: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('User not found');
    }
    if (user.emailVerificationToken === null) {
      console.log('User already verified');
      return { message: 'Email is already verified!' };
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
    return { message: 'Email verified successfully!' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour
    await this.usersService.updateUser(user);

    // Send password reset email
    await this.sendPasswordResetEmail(user, resetToken);
    return { message: 'Password reset email sent' };
  }

  private async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}&email=${user.email}`;

    const templateData = {
      userName: user.name,
      resetUrl,
    };

    const subject = passwordResetTemplate.subject;
    const text = passwordResetTemplate.generateText(templateData);
    const html = passwordResetTemplate.generateHtml(templateData);

    await this.emailService.sendEmail(user.email, subject, text, html);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, token, newPassword } = resetPasswordDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.passwordResetToken ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    if (user.passwordResetToken !== token) {
      throw new UnauthorizedException('Invalid password reset token');
    }

    // Reset password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.usersService.updateUser(user);

    return { message: 'Password reset successfully' };
  }
}
