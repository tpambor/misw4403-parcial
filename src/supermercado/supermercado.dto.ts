import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';
export class SupermercadoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsNumber()
  @IsLongitude()
  @IsNotEmpty()
  readonly longitud: number;

  @IsNumber()
  @IsLatitude()
  @IsNotEmpty()
  readonly latitud: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  readonly paginaWeb: string;
}
