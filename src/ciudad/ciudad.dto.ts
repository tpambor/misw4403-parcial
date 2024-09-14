import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
export class CiudadDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly pais: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  readonly habitantes: number;
}
