import { HDesignarDto } from './../../models/hDesignar.model';
import { ResponseModel } from './../../models/Base/base.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs';

@Injectable()
export class HDesignarService extends CrudService<HDesignarDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/HDesignar';
      this.endpoint = this.identityUrl;
  }

  RecuperarSabanaPorSector(reqParams?: any): Observable<ResponseModel<HDesignarDto[]>> {
    var url= this.endpoint + '/RecuperarSabanaPorSector';     
    return this.http.get<ResponseModel<HDesignarDto[]>>(url, { params: reqParams });
  }
  

}


// WEBPACK FOOTER //
// ./src/providers/hDesignar/hDesignar.service.ts