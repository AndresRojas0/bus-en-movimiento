import { HttpClient } from "@angular/common/http";
import { environment as ENV} from "@app/env";
import { Injectable } from "@angular/core";
import { CrudService } from "../service/crud.service";
import { HFechasDto } from "../../models/hFecha.model";

@Injectable()
export class HFechaService extends CrudService<HFechasDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/HFechas';
        this.endpoint = this.identityUrl;
    }
}


// WEBPACK FOOTER //
// ./src/providers/hFechas/hFechas.service.ts