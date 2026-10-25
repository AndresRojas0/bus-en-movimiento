import { ParametersDto } from '../../models/parameter.model';
import { HttpClient } from "@angular/common/http";
import { environment as ENV} from "@app/env";
import { Injectable } from "@angular/core";
import { CrudService } from "../service/crud.service";

@Injectable()
export class ParametersService extends CrudService<ParametersDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/SysParameters';
        this.endpoint = this.identityUrl;
    }
}


// WEBPACK FOOTER //
// ./src/providers/parameters/parameters.service.ts