import { InformeForm, InformeConsulta } from './../../models/informe-form.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";
import { ResponseModel } from 'models/Base/base.model';
import { Observable } from 'rxjs';

@Injectable()
export class InfInformesService extends CrudService<InformeForm> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/InfInformes';
      this.endpoint = this.identityUrl;
  }

  EnviarInformeJson(inf: InformeForm): Observable<ResponseModel<any>>  {
    let url = this.endpoint + '/EnviarInformeJson';
    var data={model:JSON.stringify(inf)};
    return this.http.post<ResponseModel<Boolean>>(url, data);
  }

  ConsultaInformeUserDia(): Observable<ResponseModel<InformeConsulta[]>> {
    let url = this.endpoint + '/ConsultaInformeUserDia';
    return this.http.get<ResponseModel<InformeConsulta[]>>(url);
  }

}



// WEBPACK FOOTER //
// ./src/providers/infInformes/infInformes.service.ts