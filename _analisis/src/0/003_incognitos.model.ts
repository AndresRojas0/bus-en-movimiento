import { Dto, FilterDTO } from "./Base/base.model";

export class IncognitosDto extends Dto<number> {
  getDescription(): string {
      return this.Descripcion;
  }

  Descripcion: string
  RespuestaRequerida: boolean
  MostrarObservacion: boolean
  Orden: number
  InspPreguntasIncognitosRespuestas: InspPreguntasIncognitosRespuestas[] = []

}

export class IncognitosFilter extends FilterDTO {    
  Anulado: number;
}

export class InspPreguntasIncognitosRespuestas extends Dto<number> {
  getDescription(): string {
    return this.RespuestaNombre;
  }
  Orden: number
  RespuestaNombre: string
}

//Entidad a guardar en bd
export class InspPlanillaIncognitosDto extends Dto<number> {
  getDescription(): string {
    return '';
  }
  FechaHora: Date
  Fecha: Date
  FechaString: string
  SucursalId: number
  HoraAscenso: string
  HoraDescenso: string
  CocheId: string
  CocheFicha: number
  CocheInterno: string
  Tarifa: number
  InspPlanillaIncognitosDetalle: InspPlanillaIncognitosDetalle[] = []
  isValid: boolean
}

export class InspPlanillaIncognitosDetalle {
  PreguntaIncognitoId: number
  RespuestaIncognitoId: number
  observacion: string

  PosiblesRespuestas: InspPreguntasIncognitosRespuestas[] = []
  PreguntaIncognitoDescripcion: string                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
  RespuestaRequerida: boolean
  MostrarObservacion: boolean
  Orden: number
}


// WEBPACK FOOTER //
// ./src/models/incognitos.model.ts