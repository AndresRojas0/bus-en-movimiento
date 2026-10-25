import { IncognitosDto } from './../../models/incognitos.model';
import { ResponseModel, PaginListResultDto } from 'models/Base/base.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";

@Injectable()
export class IncognitosService extends CrudService<IncognitosDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/InspPreguntasIncognitos';
      this.endpoint = this.identityUrl;
  }

  GetPagedList(reqParams?: any): Observable<ResponseModel<PaginListResultDto<IncognitosDto>>> {
    var url= this.endpoint + '/GetPagedList';     
    return this.http.post<ResponseModel<PaginListResultDto<IncognitosDto>>>(url, reqParams );
  }

}



// WEBPACK FOOTER //
// ./src/providers/incognitos/incognitos.service.ts