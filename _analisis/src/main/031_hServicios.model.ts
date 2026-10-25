import { Dto, FilterDTO, ItemGenericDto } from "./Base/base.model";

export class HServiciosDto extends Dto<number> {
    getDescription(): string {
        return this.Description;
    }
    Id: number;
    Descripcion: string;

}

export class HServiciosFilter extends FilterDTO {
    Fecha: string;
    LineaId: number;
    ServicioId: number;
    Nombre:string;
    ConductorId: string;
 }

 export class ConductoresLegajoDto extends ItemGenericDto<string>{
 
    Legajo: string;  
    Dni: string;
    Descripcion: string;
    FechaIngreso: string
    FechaIngresoFormated: string;
    FechaAntiguedad: string;
    FechaAntiguedadFormated: string;
    CodEmpresa: number;
    DesEmpresa: string;
    Cuil: string;
 }



// WEBPACK FOOTER //
// ./src/models/hServicios.model.ts