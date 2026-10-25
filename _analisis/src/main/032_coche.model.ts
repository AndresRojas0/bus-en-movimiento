import { Dto, FilterDTO } from "./Base/base.model";

export class CocheDto extends Dto<string> {
  getDescription(): string {
      return this.Dominio;
  }
  Id: string;
  Ficha: number;
  Interno: string;
  FecIng: Date;
  Dominio: string;
  CodEmpr: number;
  // Empresa: EmpresaDto;
}

export class CocheFilter extends FilterDTO {    
  Fecha: String;
  cod_servicio: number;
  Cod_Linea: number;
  Interno: string;
  Ficha: number;
  CodEmpr: number;
  Dominio: string;
}



// WEBPACK FOOTER //
// ./src/models/coche.model.ts