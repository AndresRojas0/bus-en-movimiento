import { Dto, FilterDTO } from "./Base/base.model";

export class BanderaDto extends Dto<number> {
    getDescription(): string {
        return this.Nombre;
    }
    Nombre: string;
    Descripcion: string;
}

 export class BanderaFilter extends FilterDTO {
    BanderaRelacionadaID: number;
    LineaId: number;
    SentidoBanderaId: number;
    BanderasSeleccionadas: number[];
    Fecha: string;
    Activo: boolean;
    cod_servicio: number;
    cod_Conductor: string;
 }

 export class ColumnasDataDto
 {
     EsFija:boolean  
     Key:string  
     value: any  
     Orden: number
     Hora: string  
     HoraFormated: string
     DescripcionSector : string
     EsRelevo: boolean
 }
 
 
 export class ColumnasDto
 {     
    EsFija:boolean  
    Key:string  
    Label: string  
 }
 
 export class HorariosPorSectorDto
 {
    Colulmnas: ColumnasDto[]
    Items: RowHorariosPorSectorDto[] 
 }
 
 export class RowHorariosPorSectorDto
 {
    Sale :string;
    Llega :string;
    Servicio :string;
    TotalDeMinutos :string;
    TipoHora :string;
    Bandera :string;
    Diferencia :string;

    ColumnasDinamicas : ColumnasDataDto[]
 }
 
 
 



// WEBPACK FOOTER //
// ./src/models/bandera.model.ts