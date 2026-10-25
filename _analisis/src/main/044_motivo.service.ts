import { MotivoDto } from './../../models/motivo.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../../providers/service/crud.service';
import { environment as ENV} from "@app/env";

@Injectable()
export class MotivoService extends CrudService<MotivoDto> {

  private identityUrl: string = '';
  constructor(
      protected http: HttpClient) {
      super(http);
      this.identityUrl = ENV.identityUrl + '/MotivoInfra';
      this.endpoint = this.identityUrl;
  }

}



// WEBPACK FOOTER //
// ./src/providers/motivo/motivo.service.ts