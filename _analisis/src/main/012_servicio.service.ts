import { HServiciosDto, ConductoresLegajoDto } from './../../models/hServicios.model';
import { Injectable } from "../../../node_modules/@angular/core";
import { CrudService } from "../service/crud.service";
import { HttpClient } from "../../../node_modules/@angular/common/http";
import { environment as ENV} from "@app/env";
import { Observable } from "rxjs";
import { ResponseModel, ItemDto, ItemGenericDto } from "../../models/Base/base.model";


@Injectable()
export class HServiciosService extends CrudService<HServiciosDto> {
    private identityUrl: string = '';
    constructor(
        protected http: HttpClient,) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/HServicios';
        this.endpoint = this.identityUrl;
    }

    RecuperarServiciosPorLinea(reqParams?: any): Observable<ResponseModel<ItemDto[]>> {

        var url= this.endpoint + '/RecuperarServiciosPorLinea';

        return this.http.get<ResponseModel<ItemDto[]>>(url, { params: reqParams });
    }

    RecuperarConductoresPorServicio(reqParams?: any): Observable<ResponseModel<ItemGenericDto<string>[]>> {

        var url= this.endpoint + '/RecuperarConductoresPorServicio';

        return this.http.get<ResponseModel<ItemGenericDto<string>[]>>(url, { params: reqParams });
    }

    RecuperarConductores(reqParams?: any): Observable<ResponseModel<ConductoresLegajoDto[]>> {

        var url= this.endpoint + '/RecuperarConductores';

        return this.http.get<ResponseModel<ConductoresLegajoDto[]>>(url, { params: reqParams });

    }

    RecuperarLineasPorConductor(reqParams?: any): Observable<ResponseModel<ItemGenericDto<number>[]>> {

        var url= this.endpoint + '/RecuperarLineasPorConductor';

        return this.http.get<ResponseModel<ItemGenericDto<number>[]>>(url, { params: reqParams });

    }


}


// WEBPACK FOOTER //
// ./src/providers/servicio-conductor/servicio.service.ts