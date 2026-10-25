import { TimeForCheckUpdateVersion } from './../../models/parameter.model';
import { Network } from '@ionic-native/network';
import { ParametersFilter, RealTimeTracking } from '../../models/parameter.model';
import { ParametersService } from '../../providers/parameters/parameters.service';
import { Injectable, Injector } from "@angular/core";
import { AlertController, ModalController, Platform, LoadingOptions, LoadingController, Loading, ToastController } from "ionic-angular";
import { Observable } from "rxjs";
import * as moment from 'moment';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ToolsProvider {

    public loadingCtrl: LoadingController;
    current_time: string;
    parametersValues = [];
    defaultParametersValues = [];
    geoAddress: string;
    translateService: TranslateService;
    

    constructor(
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private platform: Platform,
        injector: Injector,
        public toastCtrl: ToastController,
        public parametersService: ParametersService,
        private network: Network,
        private nativeGeocoder: NativeGeocoder  
        ) {
            this.loadingCtrl = injector.get(LoadingController);    
            this.translateService = injector.get(TranslateService);    
            this.defaultParametersValues[RealTimeTracking] = 20000;
            this.defaultParametersValues[TimeForCheckUpdateVersion] = 86400000;
         }

    //  Confirmar
    public confirmar(title: string, message: string) : Promise<boolean> {
        return new Promise((resolve) => {
            const confirm = this.alertCtrl.create({
                title: title,
                message: message,
                buttons: [
                { text: 'Cancelar', handler: () => { resolve(false); } },
                { text: 'Confirmar', handler: () => { resolve(true); } }
                ]
            });

            confirm.present();
        });
    }

    // Alert
    public alert(title: string, message: string) : void {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [{text: 'Aceptar'}]
        });
        alert.present();
    }

    // Alert obj
    public alertObj(title: string, message: any) : void {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [{text: 'Aceptar'}]
        });
        alert.present();
    }
    

    //Toast
    public toast(message: string): void{
        const toast = this.toastCtrl.create({
            message: message,
            duration: 5000,
        });
        toast.present();
    }

    //Toast position
    public toastPosition(message: any, position: string): void{
        const toast = this.toastCtrl.create({
            message: message,
            position: position,
            showCloseButton: true,
            cssClass: 'toast-top',
            closeButtonText: 'Ok'
        });
        toast.present();
    }


    public toastErrorsHttp(response:any): void{

        let message:string="";
        let position:string="top";

        if(response.status == 401 || response.status == 403) {
            this.translateService.get('PERMISSION_ERROR')
                .subscribe((value) => {
                    message = value;
                    this.toastPosition(message,position);
                });  
          }
          else if(response.status == 404) {
            if(response.error && response.error.Messages && response.error.Messages.length > 0) {
                message =  response.error.Messages[0];
                this.toastPosition(message,position);
            }
        }  

        
    }

    // Modal
    public modal(page: string, parametros: any): void {
        let addModal = this.modalCtrl.create(page, parametros);
        addModal.present();
    }

    // IsBrowser
    public isBrowser() {
        return this.platform.is("mobileweb");
    }

    // Loading
    public ShowWait<T>( fuc: Observable<T>, callback: (value: T) => void , opts?: LoadingOptions, callbackError?: (error: any) => void ){

        if(opts == null)
        {
          opts =  {
            spinner: 'crescent',
            content: 'Cargando...',
          }
        }  
    
        let loading = this.loadingCtrl.create(opts);
        loading.present().then(() => { 
          fuc.finally(() =>  loading.dismiss()).catch((error => {
            if(callbackError)
            {
                callbackError(error);
            }
            throw error;
          }))
            .subscribe(callback);
        });
      }

    public startLoading(content: string): Loading {
        let loading = this.loadingCtrl.create({
            content: content,
        });

        loading.present();

        return loading;
    }

    //Current time Ej: 01/10/2019 10:29 AM"
    public currentTime(): string {
        var current = moment().format('DD/MM/YYYY') +' '+ moment().format('LT');       
        return current;
    }

    public currentTimeGeo(): string {
        var current = moment().format('YYYY-MM-DD[T]HH:mm:ss');
        return current;
    }

    //Parametros
    private getParameters(token)
    {

        if(this.parametersValues[token] != null)
        {
            return new Promise<string>(resolve => resolve(this.parametersValues[token] as string));
        } else if (this.network.type == "none") {          
            return new Promise<string>(resolve => resolve(this.defaultParametersValues[token] as string));        
        }        

        var f = new ParametersFilter();

        f.Token = token;

        return this.parametersService.requestAllByFilter(f).toPromise().then(e=> {
            if(e.DataObject.Items.length>0)
            {
                this.parametersValues[token] = e.DataObject.Items[0].Value;
                return e.DataObject.Items[0].Value;
            }
            return null;
        });
    }

    public parametrosString(token){
        return this.getParameters(token);
    }

    public parametrosNumerico(token){
        return this.getParameters(token).then( e => {
            if (e!=null)
                return Number.parseInt(e);
            else
                return null;
        });
    }

    //geocoder
    public getGeocoder(latitud, longitud): Promise<any> {
        let options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 5
        };    
        return new Promise(resolve => {   
        this.nativeGeocoder.reverseGeocode(latitud, longitud, options)
          .then((result: NativeGeocoderReverseResult[]) =>{
                let obj = [];
                obj = this.buscarResultadoNoVacio(result);
                this.geoAddress = this.generateAddress(obj);
                resolve(this.geoAddress) ;
            }).catch((error: any) => console.log('Error en reverseGeocode'+ JSON.stringify(error)))
        })
        .catch((error: any) => console.log('Error getting location'+ JSON.stringify(error)));
    }

    private buscarResultadoNoVacio(result) {
        let obj = [];
        for (let i in result) {
          if(result[i].locality != ""){
            obj =  result[i];
            return obj
          }
        }
    }

    private generateAddress(addressObj){
        let obj = [];
        let address = "";
        for (let i in addressObj) {
          obj.push(addressObj[i]);
        }
        obj.reverse();
        address = obj[2]+', '+obj[1]+', '+obj[4]+', '+obj[6];
      return address.toString();
    }
}



// WEBPACK FOOTER //
// ./src/shared/page/tools.ts