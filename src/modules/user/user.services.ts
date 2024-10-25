import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  async get(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
  }
}
