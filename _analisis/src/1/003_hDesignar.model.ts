import { Dto, FilterDTO } from "./Base/base.model";

export class HDesignarDto extends Dto<number> {
    getDescription(): string {
        return this.Description;
    }
    Id: number;
    CodLinea: number;
    DescripcionLinea: string;
    CodBandera: number;
    AbreviacionBandera: string;
    NumeroServicio: string;
    DescripcionEmpleado: string;
    LegajoEmpleado: string;
    HoraPaso: string;
    HoraFormated: string;

    Descripcion: string;
}

export class HDesignarFilter extends FilterDTO {
    fecha: string;
    sector: number;
    sentido: number;
    tipoLinea: number;
}


// WEBPACK FOOTER //
// ./src/models/hDesignar.model.ts