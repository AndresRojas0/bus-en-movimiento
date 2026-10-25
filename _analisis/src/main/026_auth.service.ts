import { Injectable } from '@angular/core';
// import { Storage } from '@ionic/storage';

@Injectable()
export class AuthService {

  constructor() { }

  public getToken(): string {
    var cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu) {
        return cu.token
    }
    return null;
}

// public getToken() {

//   return this.storage.get('currentUser') .then((a: any) => {
     
//       var cu = JSON.parse(a);
//       if (cu) {
//         return cu.token
//       }
//       return null;

//   }); 
// }

}



// WEBPACK FOOTER //
// ./src/providers/auth/auth.service.ts