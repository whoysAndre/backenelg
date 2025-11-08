import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt"


@Injectable()
export class EncrypterService {

  private readonly saltRound = 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRound);
  }

  async comparePassword(password: string, passworDB: string): Promise<boolean> {
    return bcrypt.compare(password, passworDB);
  }

}
