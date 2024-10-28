import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { SignUpDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailerService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    if (!user.isActivated) {
      throw new BadRequestException('Verification required');
    }
    const payload = { id: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    body: SignUpDto,
    avatar?: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    if (await this.userService.findOne(body.email))
      throw new BadRequestException('Email was already used');
    const user = await this.userService.createUser(body, avatar, cover);
    const payload = { email: user.email };
    const token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    });
    const message = `Your PTITube sign up verification token is ${token}.`;

    return this.mailService.sendMail({
      from: 'nyagami <hoangquan05112002@gmail.com>',
      to: user.email,
      subject: 'Sign up verification',
      text: message,
    });
  }

  async verifySignUp(token: string) {
    const payload = await this.jwtService.verify(token, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    });
    if (typeof payload === 'object' && 'email' in payload) {
      await this.userService.activateUser(payload.email);
      return {
        success: true,
        message: 'verification successfully',
      };
    } else {
      throw new BadRequestException('Wrong token');
    }
  }
}
