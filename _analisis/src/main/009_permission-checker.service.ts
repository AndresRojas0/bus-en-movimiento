import { LocalStorageService } from './../../providers/service/storage.service';
import { Injectable } from '@angular/core';
// import { NgxPermissionsService } from 'ngx-permissions';
import { HttpClient } from '@angular/common/http';
import { environment as ENV} from "@app/env";
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PermissionCheckerService {

    endpoint: string;
    private identityUrl: string = '';
    private _PermissionList: string[];

    constructor(
        // private permissionsService: NgxPermissionsService,
        private _localStorageService: LocalStorageService,
        protected http: HttpClient) {
        this.identityUrl = ENV.identityUrl + '/User';
        this.endpoint = this.identityUrl;
        this._PermissionList = [];

    }

    loadPermissions(): void {
        var list = this._localStorageService.retrieve('permisos_usuario') as string[];
        if (list) {
            // this.permissionsService.loadPermissions(list);
            this._PermissionList = [];
            for (var i in list) {
                this._PermissionList.push(list[i]);
            }

            console.log("this._PermissionList:::::", this._PermissionList);
            
        }
    }
    
    isGranted(permissionName: string): boolean {
        //si no lo encuentra , devuelve -1
        return this._PermissionList.indexOf(permissionName) != -1;
    }

    setPermissions(per): void {
        //buscar en servicio         
        return this._localStorageService.store('permisos_usuario', per);
    }

    GetPermissions(): Observable<any> {
        //buscar en servicio 
        return this.http.get<any>(this.endpoint + '/GetPermissionForCurrentUser');
    }

    clearPermissions(): void {
        this._localStorageService.removeItem('permisos_usuario');
        // this.permissionsService.flushPermissions();
    }
}





// WEBPACK FOOTER //
// ./src/shared/common/permission-checker.service.ts