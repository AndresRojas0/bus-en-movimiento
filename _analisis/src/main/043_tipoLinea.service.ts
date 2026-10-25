import { TipoLineaDto } from './../../models/tipoLinea.model';
import { ResponseModel } from './../../models/Base/base.model';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { HttpClient } from '@angular/common/http';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs';

@Injectable()
export class TipoLineaService extends CrudService<TipoLineaDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/TipoLinea';
        this.endpoint = this.identityUrl;
    }

    RecuperarTipoLineaPorSector(reqParams?: any): Observable<ResponseModel<TipoLineaDto[]>> {

        var url= this.endpoint + '/RecuperarTipoLineaPorSector';

        return this.http.get<ResponseModel<TipoLineaDto[]>>(url, { params: reqParams });
    }


}




// WEBPACK FOOTER //
// ./src/providers/tipoLinea/tipoLinea.service.ts