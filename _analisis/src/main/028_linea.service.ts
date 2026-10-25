import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";
import { LineaDto } from '../../models/linea.model';
import { ResponseModel } from '../../models/Base/base.model';
import { Observable } from 'rxjs';


@Injectable()
export class LineaService extends CrudService<LineaDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/Linea';
        this.endpoint = this.identityUrl;
    }

    GetLineas(): Observable<ResponseModel<LineaDto[]>> {
        let url = this.endpoint + '/GetLineasPorUsuario';
        return this.http.get<ResponseModel<LineaDto[]>>(url);
    }
}




// WEBPACK FOOTER //
// ./src/providers/linea/linea.service.ts