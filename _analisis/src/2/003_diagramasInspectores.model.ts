import { Dto, FilterDTO } from "./Base/base.model";

export class DiasMesDto  extends Dto<number> {

  getDescription(): string {
    throw new Error("Method not implemented.");
  }

  //Color del dia 
  Color: string;
  Inspectores: InspectorDiaDto[] = [];
}

export class InspectorDiaDto {
   
  Apellido: string;
  Nombre: string;
  Legajo: string;
  CodEmpleado: string;
  InspColor: string;
  EsJornada: boolean;
  EsFranco: boolean;
  EsNovedad: boolean;
  EsFrancoTrabajado: boolean;
  FrancoNovedad: boolean;
  TurnoId: number;
  ZonaId: number;
  HoraDesde: string;
  HoraHasta: string;
  Color: string;
  NombreZona: string;
  NombreRangoHorario: string;
  DescNovedad: string;
  DescripcionInspector: string;
  InspTurno: string;
  DetalleZona: string;
  DetalleNovedad: string;

 }

export class InspDiagramasInspectoresFilter extends FilterDTO {
  fecha: string;
}




// WEBPACK FOOTER //
// ./src/models/diagramasInspectores.model.ts