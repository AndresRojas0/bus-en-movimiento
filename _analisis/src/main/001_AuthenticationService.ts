import { PermissionCheckerService } from './../../shared/common/permission-checker.service';
import { LocalStorageService } from './../service/storage.service';
import "rxjs/add/operator/map"; 
import { Http, Response, Headers } from "@angular/http";
import { Injectable } from "@angular/core";
import { environment as ENV} from "@app/env";
import { Storage } from '@ionic/storage';

@Injectable()
export class AuthenticationService {

    protected jsonParseReviver: (key: string, value: any) => any = undefined;

    constructor(private http: Http,
                public storage: Storage,
                public localStorageService: LocalStorageService,
                public permission: PermissionCheckerService
                ) {
    }

    public login(dni: string, password: string, captchaValue: string) {
        //TODO: sacar del entorno
        return this.http.post(ENV.identityUrl + '/api/Auth/loginMobile', JSON.stringify
        ({ username: dni, password: password, captchaValue: captchaValue }), { headers: new Headers({ 'Content-Type': 'application/json' }) })
        .map((response: Response) => {
            // login successful if there's a jwt token in the response
            let user = response.json();
            if (user && user.token) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                //Se creo para el trackeo al hacer cerrarSesion (para guardar el userName)
                localStorage.setItem('currentUserName', JSON.stringify(user.username));
            }
        })
    }
 
    public logout() : Promise<void> {
        // remove user from local storage to log user out
        return new Promise(resolve => {
            this.permission.clearPermissions();
            this.localStorageService.clearAll();
            localStorage.removeItem('currentUser');
            localStorage.clear();
            resolve();          
        });
    }

    // public isLoged() : Promise<boolean> {
    //     return new Promise(resolve => {
    //         if(localStorage.getItem("currentUser")) {
    //             resolve(true);
    //         } else{
    //             resolve(false);
    //         }
    //     })
    // }
}


// WEBPACK FOOTER //
// ./src/providers/auth/AuthenticationService.ts