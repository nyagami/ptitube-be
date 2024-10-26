import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.services';
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
    const payload = { sub: user.id, email: user.email };
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
    return this.userService.createUser(body, avatar, cover);
  }

  sendVerification(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    });

    const message = `Your PTITube sign up verification token is ${token}.`;

    return this.mailService.sendMail({
      from: 'nyagami <hoangquan05112002@gmail.com>',
      to: 'hoangquan05112002@gmail.com',
      subject: `How to Send Emails with Nodemailer`,
      text: message,
    });
  }
}
