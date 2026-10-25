import { SectorDto } from './../../models/sector.model';
import { ResponseModel } from './../../models/Base/base.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SectorService extends CrudService<SectorDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/Sector';
        this.endpoint = this.identityUrl;
    }

    RecuperarSentidoPorSector(reqParams?: any): Observable<ResponseModel<SectorDto[]>> {

        var url= this.endpoint + '/RecuperarSentidoPorSector';

        return this.http.get<ResponseModel<SectorDto[]>>(url, { params: reqParams });
    }

}


// WEBPACK FOOTER //
// ./src/providers/sector/sector.service.ts