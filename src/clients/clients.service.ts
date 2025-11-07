import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClientsService {

  @InjectRepository(Client)
  private readonly clientRepository: Repository<Client>

  async create(createClientDto: CreateClientDto) {
    try {
      const client = this.clientRepository.create(createClientDto);
      return await this.clientRepository.save(client);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {

    const clients = await this.clientRepository.find({
      where: {
        isActive: true
      },
      relations: {
        sales: true
      }
    });
    return clients;
  }

  async findOne(id: string) {

    const client = await this.clientRepository.findOneBy({ id });
    if (!client) throw new NotFoundException(`Client with ID: ${id} not found`);
    return client;

  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientRepository.preload({
      id,
      ...updateClientDto
    })
    if (!client) throw new NotFoundException(`Client with id - ${id} not found`);
    try {
      await this.clientRepository.save(client);
      return client;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    client.isActive = false;
    client.updatedAt = new Date();
    return await this.clientRepository.save(client);
  }
}
