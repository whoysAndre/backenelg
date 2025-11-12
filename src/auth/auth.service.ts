import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EncrypterService } from 'src/common/services/encrypter.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly encrypterService: EncrypterService,

    private readonly jwtService: JwtService,

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

      const token = this.getJwtToken({ email: user.email });

      return {
        ...rest,
        token
      }

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email
      },
      select: { email: true, password: true }
    });

    if (!user) throw new UnauthorizedException("Credentials are not valid (email)");

    const passwordValid = await this.encrypterService.comparePassword(loginUserDto.password, user.password);

    if (!passwordValid) throw new UnauthorizedException("Credentials are not valid (password)");

    return { token: this.getJwtToken({ email: user.email }), ...user };
  }

  //Logout
  

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }


  async checkAuthStatus(user: User) {
    const token = this.getJwtToken({ email: user.email });
    return {
      ...user,
      token
    }
  }

  async verifyToken(token: string) {
    try {

      const payload = this.jwtService.verify<JwtPayload>(token);

      const user = await this.userRepository.findOne({
        where: { email: payload.email }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        isValid: true,
        payload,
        user // Devuelve el usuario completo si lo necesitas
      };

    } catch (error) {
      return {
        isValid: false,
        error: error.message || 'Token inválido'
      };
    }
  }

  //JWT
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
