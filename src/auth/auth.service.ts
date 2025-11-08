import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EncrypterService } from 'src/common/services/encrypter.service';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {

  constructor(
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject()
    private readonly encrypterService: EncrypterService

  ) { }

  async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;
      const passwordHashed = await this.encrypterService.hashPassword(password);
      const user = this.userRepository.create({
        ...rest,
        password: passwordHashed
      });
      await this.userRepository.save(user);


      return {
        ...rest
      }

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          email: loginUserDto.email
        },
        select: { email: true, password: true }
      });

      if (!user) throw new UnauthorizedException("Credentials are not valid");

      const passwordValid = await this.encrypterService.comparePassword(loginUserDto.password, user.password);

      if (!passwordValid) new UnauthorizedException("Credentials are not valid");

      return user;


    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }
}
