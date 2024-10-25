import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.services';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

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

  sendMail() {
    const message = `Forgot your password? If you didn't forget your password, please ignore this email!`;

    return this.mailService.sendMail({
      from: 'nyagami <hoangquan05112002@gmail.com>',
      to: 'hoangquan05112002@gmail.com',
      subject: `How to Send Emails with Nodemailer`,
      text: message,
    });
  }
}
