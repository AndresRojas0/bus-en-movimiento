import { SentidoBanderaDto } from './../../models/sentidobandera.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { environment as ENV} from "@app/env";


@Injectable()
export class SentidoBanderaService extends CrudService<SentidoBanderaDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/SentidoBandera';
        this.endpoint = this.identityUrl;
    }
}




// WEBPACK FOOTER //
// ./src/providers/bandera/sentidoBandera.service.ts