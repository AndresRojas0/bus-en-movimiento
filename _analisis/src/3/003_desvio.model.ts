import { Dto, FilterDTO } from "./Base/base.model";


export class DesvioDto extends Dto<string> {
  getDescription(): string {
      return this.Descripcion;
  }

  FechaHora: Date
  FechaString: string
  Hora: string
  Descripcion: string
  SucursalId: number
  Leido: boolean
  isValid: boolean
}

export class DesvioFilter extends FilterDTO {    
  Fecha: String;

}


// WEBPACK FOOTER //
// ./src/models/desvio.model.ts