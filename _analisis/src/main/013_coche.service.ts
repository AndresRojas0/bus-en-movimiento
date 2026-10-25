import { ResponseModel } from './../../models/Base/base.model';
import { CocheDto } from './../../models/coche.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs/Rx';

@Injectable()
export class CocheService extends CrudService<CocheDto> {

  private siniestrosUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.siniestrosUrl = ENV.siniestrosUrl + '/CCoches';
      this.endpoint = this.siniestrosUrl;
  }

  RecuperarCCochesPorFechaServicioLinea(reqParams?: any): Observable<ResponseModel<CocheDto[]>> {

    var url= this.endpoint + '/RecuperarCCochesPorFechaServicioLinea';

    return this.http.get<ResponseModel<CocheDto[]>>(url, { params: reqParams });
  }

  RecuperarCCoches(reqParams?: any): Observable<ResponseModel<CocheDto[]>> {

    var url= this.endpoint + '/RecuperarCCoches';

    return this.http.get<ResponseModel<CocheDto[]>>(url, { params: reqParams });
  }

}


// WEBPACK FOOTER //
// ./src/providers/coche/coche.service.ts