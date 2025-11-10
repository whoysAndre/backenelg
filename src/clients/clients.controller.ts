import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/interfaces';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @Auth(Roles.ADMIN)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Auth(Roles.ADMIN)
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Auth(Roles.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Roles.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Auth(Roles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
}
