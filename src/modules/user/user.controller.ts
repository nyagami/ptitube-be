import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.services';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  get(@Param() params: { id: number }) {
    return this.userService.get(params.id);
  }
}
