import { CrudService } from '../../providers/service/crud.service';
import { Observable } from 'rxjs';
import { ResponseModel } from './../../models/Base/base.model';
import { DiasMesDto } from './../../models/diagramasInspectores.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as ENV} from "@app/env";


@Injectable()
export class DiagramacionService extends CrudService<DiasMesDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/InspDiagramasInspectores';
      this.endpoint = this.identityUrl;
  }
  
  DiagramacionPorDia(reqParams?: any): Observable<ResponseModel<DiasMesDto>> {
    let url = this.endpoint + '/DiagramacionPorDia';
    return this.http.get<ResponseModel<DiasMesDto>>(url, { params: reqParams });
  }  
}



// WEBPACK FOOTER //
// ./src/providers/diagramacion/diagramacion.service.ts