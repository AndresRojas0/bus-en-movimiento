import { GeoDto } from './../../models/geo.model';
import { NetworkProvider } from './../network/network';
import { GeoService } from './geo.service';
import { GeoDbService } from '../db/geoDb.service';
import { ParametersFilter, RealTimeTracking } from '../../models/parameter.model';
import { AlertController, NavController } from 'ionic-angular';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Injectable, ViewChild } from '@angular/core';
import { ToastController, Platform } from 'ionic-angular';
import { Geolocation } from "@ionic-native/geolocation";
import { Diagnostic } from '@ionic-native/diagnostic';
import { ToolsProvider } from '../../shared/page/tools';
import { BackgroundMode } from '@ionic-native/background-mode';
import { AuthenticationService } from '../../providers/auth/AuthenticationService';
import { ParametersService } from '../../providers/parameters/parameters.service';
import { DbService } from '../../providers/db/db.service';
import { Observable } from 'rxjs';

@Injectable()
export class GeoProvider {

  private intervalTrack: number = 0;
  private parametroValue: number;
  filtro = new ParametersFilter();
  public currentUsr: any; 
  private backgroundAttach: boolean = false;
  private isPaused: boolean = false;
  @ViewChild('carguardNav') navCtrl: NavController

  constructor(
    public toast: ToastController,
    private geolocation: Geolocation,
    public platform: Platform,
    private diagnostic: Diagnostic,
    public tools: ToolsProvider,
    public backgroundMode: BackgroundMode,
    public locationAccuracy: LocationAccuracy,
    private alert: AlertController,
    private authenticationService: AuthenticationService,
    public parametersService: ParametersService,
    private geoDb: GeoDbService,
    private db: DbService,
    private geoService: GeoService,
    private networkProvider: NetworkProvider
  ) {}

  public inicializarBackgroundMode(): void {
var self=this;

    if(self.tools.isBrowser()) return;
    //Background activado
    if(!self.backgroundAttach) {

      this.platform.pause.subscribe((g,e,c)=> {
        self.isPaused=true;
        self.startGeolocation();       
      });

      try {
        this.backgroundMode.on('activate').subscribe(() => {
          self.isPaused=false;
          console.log('background ACTIVADO');
          self.backgroundMode.disableWebViewOptimizations(); 
        });
  
        //Background desactivado
        this.backgroundMode.on('deactivate').subscribe(() => {
          self.isPaused=false;
          console.log('background DESACTIVADO');
          self.backgroundMode.disableWebViewOptimizations(); 
          self.startGeolocation();
        });
        self.backgroundAttach = true;
      } catch (error) {
        self.tools.toast(error);
        console.log(error);       
      }
    }       
  }

  //Start Geo
  public startGeolocation(): void {
    this.tools.parametrosNumerico(RealTimeTracking).then(e => {
      this.parametroValue = e;
      this.startGeolocationInternal();
    });
  }

  private startGeolocationInternal(): void {
    console.log("Start Geolocation! con "  + this.parametroValue.toString());
    //para que funcione solo en el celular
    if(this.tools.isBrowser()) return;

    if (this.intervalTrack > 0) return;
    var selft=this;
    this.intervalTrack = setInterval(() => {
      
      selft.trackPosition('trackPosition').then(resp => {
        if (!resp && !selft.isPaused) {
          selft.stopGeolocation();
          selft.alert.create({
            title: 'ACTIVAR GPS!',
            enableBackdropDismiss:false,
            message: "No podrás usar esta aplicación teniendo la ubicación del dispositivo apagada.",
            buttons: [{ text: 'ACEPTAR', handler: () => selft.ValidateisLocationEnabled()} ]
        }).present();
        }
      });
     
      if(selft.networkProvider.checkNetwork()) {
        selft.saveTrackingDB();
      }
    }, selft.parametroValue);
    console.log("Start Geolocation Interval!", selft.intervalTrack);
  }

  private ValidateisLocationEnabled() {
    this.diagnostic.isLocationEnabled().then(resp => {
      if(!resp) {
        clearInterval(this.intervalTrack);
        let geoPosition =  JSON.parse(localStorage.getItem('lastPosition'));  
        let cu =  JSON.parse(localStorage.getItem('currentUser'));     
        if(geoPosition == null) {
          this.closeapp();
        } else {
          let listGeoDto: GeoDto[] = [];      
          var geoDto = new GeoDto();
          geoDto.UserName = cu.username;
          geoDto.CurrentTime = this.tools.currentTimeGeo();
          geoDto.Latitud = (geoPosition.lat).toString();
          geoDto.Longitud = (geoPosition.long).toString();
          geoDto.Accion = 'logoutGpsDesactivado';
          listGeoDto.push(geoDto);            
          if (!this.networkProvider.checkNetwork()) {
            this.geoDb.addGeo(cu.username, this.tools.currentTimeGeo(), geoPosition.lat, geoPosition.long, 'logoutGpsDesactivado');
          } else {
            this.geoService.CerrarSesion(listGeoDto).subscribe( (response) => {                  
              this.closeapp();
            });
          }      
          this.closeapp();         
        }
      } 
      else{        
        this.startGeolocation();
        this.tools.toast("Gps Activado!!");
      }
    }); 
  }

  private closeapp() {
    this.stopGeolocation();
    this.backgroundMode.disable();
    console.log("BACKGROUND DESHABILITADO en geo!!");
      this.authenticationService.logout().then(() => {
        this.navCtrl.setRoot('LoginPage');
        this.navCtrl.popToRoot();
      });
  }

  //Stop Geo
  public stopGeolocation(): void {
    console.log("Stop Geolocation!", this.intervalTrack);
    clearInterval(this.intervalTrack);
    setTimeout(() => {
      this.intervalTrack = 0;
    }, 500);
  }

  //Current Position
  public trackPosition(action:string): Promise<boolean> {
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
    };
    return new Promise<boolean>(resolve => {
      this.diagnostic.isLocationEnabled().then(resp => {
        if (resp) {
          this.geolocation.getCurrentPosition(options).then(position => {
            console.log("Recuperando ubicación I:" + position.coords.latitude * -1, position.coords.longitude * -1, action, this.intervalTrack);
            this.setLastPositionStorage(position);
            if (!this.tools.isBrowser()) {
              let cu =  JSON.parse(localStorage.getItem('currentUser'));  
              if(cu) {
                this.currentUsr =  cu.username;
              } else {
                this.db.getUsr().then((usr: { dni: any; }) => {
                  this.currentUsr= usr.dni;
                });
              }
              console.log("CURRENT USER:", this.currentUsr);
              this.geoDb.addGeo(this.currentUsr, this.tools.currentTimeGeo(), position.coords.latitude * -1, position.coords.longitude * -1, action);
            }
            resolve(true);
          }).catch(error => {
            console.log("Error al recuperar ubicación", error);
            resolve(true);
          });         
        } else {                
          resolve(false);
        }
      }).catch(() => resolve(true));
    });
  }

  private setLastPositionStorage(position: any) {
    const positionStorage = {
      lat: position.coords.latitude * -1,
      long: position.coords.longitude * -1,
    }
    localStorage.setItem('lastPosition', JSON.stringify(positionStorage));
  }

  public requestActivation(): Promise<boolean> {
    return new Promise<boolean>(resolve =>{
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
        () => {
          console.log('Request successful');
          return resolve(true);
        },
        error => {
          setTimeout(() => {
            this.cerrarSesionGeo();
          }, 500);

          return resolve(false);
      }); 
    });
  }

  public cerrarSesionGeo() {
    this.stopGeolocation();
    this.backgroundMode.disable();
    this.authenticationService.logout().then(() => {
      this.navCtrl.setRoot('LoginPage');
      this.navCtrl.popToRoot();
    });
  }

  public saveTrackingDB() {
    setTimeout(() => {
      this.geoDb.getGeo().then((listGeo) => {
        listGeo.forEach(e=> {
          if(!e.UserName) {
            e.UserName="Desconocido";
          }
        });
        this.geoService.SaveEntityList(listGeo).subscribe( (response) => {
          if(response.DataObject.Status){
            this.geoDb.deleteItems(listGeo);
          }
        })
        console.log("LISTGEO:", listGeo);       
      })
    }, 500);
  }

  public trackeoAlSalirApp(accion: string): Observable<any> { 
    return new Observable(obs => {
      if(!this.tools.isBrowser()) { 
        this.diagnostic.isLocationEnabled().then(resp => {
          if (resp) {
            this.geolocation.getCurrentPosition().then(position => {
              let listGeoDto: GeoDto[] = []
              let cu =  JSON.parse(localStorage.getItem('currentUserName'));       
              var geoDto = new GeoDto();
              // geoDto.UserName = cu.username;
              geoDto.UserName = cu;
              geoDto.CurrentTime = this.tools.currentTimeGeo();
              geoDto.Latitud = (position.coords.latitude * -1).toString();
              geoDto.Longitud = (position.coords.longitude * -1).toString();
              geoDto.Accion = accion;
              listGeoDto.push(geoDto);            
              if (!this.networkProvider.checkNetwork()) {
                this.geoDb.addGeo(cu, this.tools.currentTimeGeo(), position.coords.latitude * -1, position.coords.longitude * -1, accion);
                obs.next(true);
              } else {
                this.geoService.CerrarSesion(listGeoDto).subscribe( (response) => {                  
                obs.next(true);
                });
              }
            }).catch(error => {
              console.log("Error al recuperar ubicación en cerrar sesion back button", error);
            });         
          } else {
            //Si GPS esta desactivado
            obs.next(true);
          }
        });
      } else {
        obs.next(true);
      }
  });
  }
}


// WEBPACK FOOTER //
// ./src/providers/geolocation/geo.ts