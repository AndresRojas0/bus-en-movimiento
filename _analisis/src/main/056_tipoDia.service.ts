import { HttpClient } from "../../../node_modules/@angular/common/http";
import { environment as ENV} from "@app/env";
import { Injectable } from "../../../node_modules/@angular/core";
import { TipoDiaDto } from "../../models/tipodia.model";
import { CrudService } from "../service/crud.service";

@Injectable()
export class TipoDiaService extends CrudService<TipoDiaDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/TiposDeDias';
        this.endpoint = this.identityUrl;
    }
}


// WEBPACK FOOTER //
// ./src/providers/tipoDia/tipoDia.service.ts