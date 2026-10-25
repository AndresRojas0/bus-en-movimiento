import { InspPlanillaIncognitosDto } from './../../models/incognitos.model';
import { ResponseModel, PaginListResultDto } from 'models/Base/base.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";

@Injectable()
export class IncognitosDetalleService extends CrudService<InspPlanillaIncognitosDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/InspPlanillaIncognitos';
      this.endpoint = this.identityUrl;
  }


}


// WEBPACK FOOTER //
// ./src/providers/incognitos/incognitosDetalle.service.ts