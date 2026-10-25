import { Injectable } from "../../../node_modules/@angular/core";
import { CrudService } from "../service/crud.service";
import { HttpClient, HttpParams } from "../../../node_modules/@angular/common/http";
import { environment as ENV} from "@app/env";
import { BanderaDto, HorariosPorSectorDto } from "../../models/bandera.model";
import { ResponseModel, ItemDto } from "../../models/Base/base.model";
import { Observable } from "../../../node_modules/rxjs";

@Injectable()
export class BanderaService extends CrudService<BanderaDto> {
    private identityUrl: string = '';
    constructor(
        protected http: HttpClient,) {
        super(http);
        this.identityUrl = ENV.identityUrl + '/Bandera';
        this.endpoint = this.identityUrl;
    }

    recuperarBanderasRelacionadasPorSector(reqParams?: any): Observable<ResponseModel<ItemDto[]>> {
        var params = new HttpParams();
        if (reqParams) {
            Object.keys(reqParams).forEach(function(item) {
                params = params.set(item, reqParams[item]);
            });
        }

        return this.http.get<ResponseModel<ItemDto[]>>(this.endpoint + '/RecuperarBanderasRelacionadasPorSector', { params: params });
    }

    
    recuperarHorariosSectorPorSector(reqParams?: any): Observable<ResponseModel<HorariosPorSectorDto>> {

        var url= this.endpoint + '/RecuperarHorariosSectorPorSector';

        return this.http.post<ResponseModel<HorariosPorSectorDto>>(url, reqParams);
    }

    RecuperarLineasActivasPorFecha(reqParams?: any): Observable<ResponseModel<ItemDto[]>> {

        var url= this.endpoint + '/RecuperarLineasActivasPorFecha';

        return this.http.get<ResponseModel<ItemDto[]>>(url, { params: reqParams });
    }

}



// WEBPACK FOOTER //
// ./src/providers/bandera/bandera.service.ts