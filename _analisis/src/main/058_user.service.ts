import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { CrudService } from '../service/crud.service';
import { UserDto, ListResultDtoOfUserListDto } from '../../models/user.model';
import { environment as ENV} from "@app/env";
import { ResponseModel, UserFilter } from '../../models/Base/base.model';


@Injectable()
export class UserService extends CrudService<UserDto> {

    private identityUrl: string = '';
    constructor(
        protected http: HttpClient) {
        super(http);

        this.identityUrl = ENV.identityUrl + '/User';
        this.endpoint = this.identityUrl;
    }

    getUsers(pageIndex: number, pageSize: number, sort: string): Observable<ResponseModel<ListResultDtoOfUserListDto>> {

        let url = this.identityUrl + '/GetPagedList';
        let data = new UserFilter();
        data.Page = pageIndex;
        data.PageSize = pageSize;
        data.Sort = sort;

        return this.http.post<ResponseModel<ListResultDtoOfUserListDto>>(url, data, )
    }

    getUserForEdit(id: number): Observable<ResponseModel<UserDto>> {

        let url = this.identityUrl + '/GetByIdAsync?id=' + id;
        return this.http.get(url).map((response: Response) => {
            return response.json();
        });
    }

    createOrUpdateUser(data: UserDto): Observable<ResponseModel<UserDto>> {

        let url = this.identityUrl + '/UpdateEntity';
        if (data.Id <= 0) {
            url = this.identityUrl + '/SaveNewEntity';
        }

        return this.http.post<ResponseModel<UserDto>>(url, data)
    }

    // getUserPermissionsForEdit(id: number): Observable<ResponseModel<GetPermissionsForEditOutput>> {

    //     let url = this.identityUrl + '/GetUserPermissionsForEdit?id=' + id;
    //     return this.http.get<ResponseModel<GetPermissionsForEditOutput>>(url);
    // }

    // resetPassword(id: number): Observable<ResponseModel<string>> {

    //     let url = this.identityUrl + '/ResetPassword?id=' + id;
    //     return this.http.post<ResponseModel<string>>(url, { id: id });

    // }

    // updateUserPermissions(input: UpdatePermissionsInput): Observable<ResponseModel<string>> {
    //     let url = this.identityUrl + '/UpdateUserPermissions';
    //     return this.http.post<ResponseModel<string>>(url, input)
    // }


    // findUser(userName: string) {

    //     let url = this.identityUrl + '/GetByUserLdapAsync?userName=' + userName;
    //     return this.http.get<ResponseModel<UserDto>>(url);
    // }

}




// WEBPACK FOOTER //
// ./src/providers/user/user.service.ts