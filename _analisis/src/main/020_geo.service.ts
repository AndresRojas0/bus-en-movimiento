import { ResponseModel } from './../../models/Base/base.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";
import { GeoDto, GeolocalizationResponse } from '../../models/geo.model';
import { Observable } from 'rxjs';

@Injectable()
export class GeoService extends CrudService<GeoDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.geolocalizationUrl + '/Geo';
        this.endpoint = this.identityUrl;
    }

    SaveEntityList(items: GeoDto[]): Observable<ResponseModel<GeolocalizationResponse>> {
        return this.http.post<ResponseModel<GeolocalizationResponse>>(this.endpoint + '/SaveEntityList', items);
    }

    CerrarSesion(items: GeoDto[]): Observable<ResponseModel<GeolocalizationResponse>> {
        return this.http.post<ResponseModel<GeolocalizationResponse>>(this.endpoint + '/CerrarSesion', items);
    }

}


// WEBPACK FOOTER //
// ./src/providers/geolocation/geo.service.ts