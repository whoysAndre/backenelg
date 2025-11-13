import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/interfaces';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @Auth(Roles.ADMIN)
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @Auth(Roles.ADMIN)
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @Auth(Roles.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @Auth(Roles.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @Auth(Roles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.remove(id);
  }





  //13/10/2025

  @Get('statistics/mes')
  @Auth(Roles.ADMIN)
  getSalesByMonth(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : undefined;
    return this.salesService.getSalesByMonth(yearNumber);
  }

}
