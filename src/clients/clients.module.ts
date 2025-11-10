import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [TypeOrmModule.forFeature([Client]),AuthModule],
  exports:[ ClientsService ]
})
export class ClientsModule { }
