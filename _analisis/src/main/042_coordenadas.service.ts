import { ResponseModel } from './../../models/Base/base.model';
import { CoordenadasDto } from './../../models/coordenadas.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs';

@Injectable()
export class CoordenadasService extends CrudService<CoordenadasDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/Coordenadas';
      this.endpoint = this.identityUrl;
  }

  RecuperarCoordenadasPorFecha(reqParams?: any): Observable<ResponseModel<CoordenadasDto[]>> {
    var url= this.endpoint + '/RecuperarCoordenadasPorFecha';     
    return this.http.get<ResponseModel<CoordenadasDto[]>>(url, { params: reqParams });
  }

}




// WEBPACK FOOTER //
// ./src/providers/coordenada/coordenadas.service.ts