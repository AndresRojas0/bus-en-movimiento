import { Dto, FilterDTO } from "./Base/base.model";


export class CoordenadasDto extends Dto<number> {
    getDescription(): string {
        return this.Description;
    }
    Id: number;
    Abreviacion: string;
    CodigoNombre: string;
    Calle1: string;
    Calle2: string;

    Descripcion: string;

}

export class CoordenadasFilter extends FilterDTO {
    Abreviacion: string;
    Fecha: string;
}


// WEBPACK FOOTER //
// ./src/models/coordenadas.model.ts