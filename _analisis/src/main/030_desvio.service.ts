import { ResponseModel } from 'models/Base/base.model';
import { Observable } from 'rxjs';
import { DesvioDto } from './../../models/desvio.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";

@Injectable()
export class DesvioService extends CrudService<DesvioDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/InsDesvios';
      this.endpoint = this.identityUrl;
  }

  ObtenerEmpleadoInspector(reqParams?: any): Observable<ResponseModel<any>> {
    var url= this.endpoint + '/ObtenerEmpleadoInspector';     
    return this.http.get<ResponseModel<any>>(url, { params: reqParams });
  }

  GetDesviosPorUnidaddeNegocio(reqParams?: any): Observable<ResponseModel<DesvioDto[]>> {
    var url= this.endpoint + '/GetDesviosPorUnidaddeNegocio';     
    return this.http.get<ResponseModel<DesvioDto[]>>(url, { params: reqParams });
  }

}



// WEBPACK FOOTER //
// ./src/providers/desvio/desvio.service.ts