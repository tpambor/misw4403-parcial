import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { SupermercadoDto } from '../supermercado/supermercado.dto';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';

@Controller('cities')
@UseInterceptors(BusinessErrorsInterceptor)
export class CiudadSupermercadoController {
  constructor(
    private readonly ciudadSupermercadoService: CiudadSupermercadoService,
  ) {}

  @Post(':ciudadId/supermarkets/:supermercadoId')
  async addSupermarketToCity(
    @Param('ciudadId') ciudadId: string,
    @Param('supermercadoId') supermercadoId: string,
  ) {
    return await this.ciudadSupermercadoService.addSupermarketToCity(
      ciudadId,
      supermercadoId,
    );
  }

  @Get(':ciudadId/supermarkets')
  async findSupermarketsFromCity(@Param('ciudadId') ciudadId: string) {
    return await this.ciudadSupermercadoService.findSupermarketsFromCity(
      ciudadId,
    );
  }

  @Get(':ciudadId/supermarkets/:supermercadoId')
  async findSupermarketFromCity(
    @Param('ciudadId') ciudadId: string,
    @Param('supermercadoId') supermercadoId: string,
  ) {
    return await this.ciudadSupermercadoService.findSupermarketFromCity(
      ciudadId,
      supermercadoId,
    );
  }

  @Put(':ciudadId/supermarkets')
  async updateSupermarketsFromCity(
    @Body() supermercadoDto: SupermercadoDto[],
    @Param('ciudadId') ciudadId: string,
  ) {
    const supermercados = plainToInstance(SupermercadoEntity, supermercadoDto);
    return await this.ciudadSupermercadoService.updateSupermarketsFromCity(
      ciudadId,
      supermercados,
    );
  }

  @Delete(':ciudadId/supermarkets/:supermercadoId')
  @HttpCode(204)
  async deleteSupermarketFromCity(
    @Param('ciudadId') ciudadId: string,
    @Param('supermercadoId') supermercadoId: string,
  ) {
    return await this.ciudadSupermercadoService.deleteSupermarketFromCity(
      ciudadId,
      supermercadoId,
    );
  }
}
