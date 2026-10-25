
import { Injectable, Injector } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
//import { SESSION_EXPIRED } from '../../shared/constants/error-constants';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    //private router: Router;
    private auth: AuthService;
    constructor(private injector: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //this.router = this.injector.get(Router);
        this.auth = this.injector.get(AuthService);
        
        if (this.auth.getToken()) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + this.auth.getToken()
                },
                headers: request.headers.set("Authorization", 'Bearer ' + this.auth.getToken()),
            });
        }

        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // do stuff with response if you want
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {

                if (err.status === 401 || err.status == 403) {
                    if (err.status == 403) {
                        //TODO:ver que vamos a hacer aqui
                        //this.router.navigate(['/401'], { queryParams: { error: SESSION_EXPIRED } });
                    } else {
                        try {
                            // var errorBody = JSON.parse(err.error) as RestError;
                            // if (errorBody.errorCode == 'REST012') {
                            //    this.router.navigate(['/login'], { queryParams: { error: SESSION_EXPIRED } });
                            // } else {
                            //TODO:ver que vamos a hacer aqui
                            //this.router.navigate(['/401']);
                            //}
                        } catch (error) {
                            //this.authenticationService.logout();
                            //this.router.navigate(['/login']);
                        }
                    }

                }
            }
        });
    }
}


// WEBPACK FOOTER //
// ./src/providers/auth/token.interceptor.ts