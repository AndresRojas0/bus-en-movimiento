import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilterDTO, PaginListResultDto, ResponseModel, ADto, ViewMode, ItemDto } from '../../models/Base/base.model';

export interface Service {
    endpoint: string;
}

@Injectable()
export abstract class CrudService<T extends ADto> implements Service {


    endpoint: string;

    constructor(protected http: HttpClient) {

    }

    requestAllByFilter(reqParams?: any): Observable<ResponseModel<PaginListResultDto<T>>> {
        var params = new HttpParams();
        if (reqParams) {
            Object.keys(reqParams).forEach(function(item) {
                params = params.set(item, reqParams[item]);
            });
        }

        return this.http.get<ResponseModel<PaginListResultDto<T>>>(this.endpoint + '/GetAllAsync', { params: params });
    }


    GetItemsAsync(reqParams?: any): Observable<ResponseModel<ItemDto[]>> {
        var params = new HttpParams();
        if (reqParams) {
            Object.keys(reqParams).forEach(function(item) {
                params = params.set(item, reqParams[item]);
            });
        }

        return this.http.get<ResponseModel<ItemDto[]>>(this.endpoint + '/GetItemsAsync', { params: params });
    }


    FindItemsAsync(filter: any): Observable<ResponseModel<ItemDto[]>> {
        let url = this.endpoint + '/FindItemsAsync';
        let data = filter;

        return this.http.post<ResponseModel<ItemDto[]>>(url, data);
    }

    getById(id: any): Observable<ResponseModel<T>> {

        let url = this.endpoint + '/GetByIdAsync?id=' + id;
        return this.http.get<ResponseModel<T>>(url);
    }



    createOrUpdate(data: T, mode: ViewMode): Observable<ResponseModel<any>> {

        let url = this.endpoint + '/UpdateEntity';
        if (mode == ViewMode.Add) {
            url = this.endpoint + '/SaveNewEntity';
        }
        return this.http.post<ResponseModel<T>>(url, data);
    }


    search(filter: FilterDTO): Observable<ResponseModel<PaginListResultDto<T>>> {

        let url = this.endpoint + '/GetPagedList';
        let data = filter;

        return this.http.post<ResponseModel<PaginListResultDto<T>>>(url, data);
    }

    delete(id: number): Observable<any> {
        let url = this.endpoint + '/DeleteById?id=' + id
        return this.http.post(url, null);
    }


}

 



// WEBPACK FOOTER //
// ./src/providers/service/crud.service.ts