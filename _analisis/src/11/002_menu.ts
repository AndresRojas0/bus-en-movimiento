import { LocalStorageService } from '../../providers/service/storage.service';
import { PermissionCheckerService } from './../../shared/common/permission-checker.service';
import { NetworkProvider } from './../../providers/network/network';
import { GeoService } from './../../providers/geolocation/geo.service';
import { GeoDbService } from './../../providers/db/geoDb.service';
import { BackgroundMode } from '@ionic-native/background-mode';
import { GeoProvider } from './../../providers/geolocation/geo';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, Nav, NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthenticationService } from '../../providers/auth/AuthenticationService';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular';
import { ToolsProvider } from '../../shared/page/tools';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from "@ionic-native/geolocation";
import { GeoDto } from '../../models/geo.model';

interface PageItem {
  title: string
  component: any
  icon: any
  permission: boolean
}

type PageList = PageItem[]

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  @ViewChild('NAV') nav: Nav;

  rootPage: any = 'HomePage';
  pages: PageList;
  versionNumber: string;
  isMobile: boolean;
  isCore: boolean;

  userPermission: boolean = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public alertCtrl: AlertController,
              private authenticationService: AuthenticationService,
              private appVersion: AppVersion,
              public platform: Platform,
              public tools: ToolsProvider,
              public geo: GeoProvider,
              public backgroundMode: BackgroundMode, 
              private diagnostic: Diagnostic,
              private geolocation: Geolocation,
              private geoDb: GeoDbService,
              private geoService: GeoService,
              public networkProvider: NetworkProvider,
              public permission: PermissionCheckerService,
              public localStorageService: LocalStorageService) {
                
              // this.permisos();

              this.pages = [
                            { title: 'Sábanas de Horarios', component: 'HomePage' , icon: 'ios-timer-outline', permission: true },
                            { title: 'Informe', component: 'InformePage' , icon: 'ios-clipboard-outline', permission: this.permisosMenu('Inspectores.Informes.Agregar') },
                            // { title: 'Desvío', component: 'DesvioPage' , icon: 'arrow-forward', permission: this.permisosMenu('Inspectores.Desvio.Visualizar')},
                            { title: 'Diagramación', component: 'DiagramacionPage' , icon: 'ios-paper-outline', permission: this.permisosMenu('Inspectores.Diagramacion.Consultar')},
                            { title: 'Planilla Incógnitos', component: 'IncognitosPage' , icon: 'md-glasses', permission: this.permisosMenu('Inspectores.RegistrarPlanillaIncognitos.Agregar')},                           
                            { title: 'Últimas Consultas', component: 'ConsultasCachePage' , icon: 'ios-search-outline', permission: true },
                            { title: 'Cerrar Sesión', component: null , icon: 'ios-log-out-outline', permission: true }
                            ];    

                            if(this.platform.is('core') || this.platform.is('mobileweb')) {
                              // In Browser
                              this.isMobile = false;
                            } else {
                              // In Mobile              
                              this.appVersion.getVersionNumber().then((versionCode: string) => {
                                this.versionNumber = versionCode;
                                this.isMobile = true;                    
                            }); 
                            
                            }        
  }

  permisosMenu(permiso: string): boolean {
    this.userPermission = this.permission.isGranted(permiso);
    return this.userPermission
  }

  goToPage(page) {
    if(page.component) {
        this.nav.setRoot(page.component);
    } else {
        this.cerrarSesion();
    }
  }

  private cerrarSesion() : void {
    this.tools.confirmar("Estás por salir!", "Perderás las consultas realizadas.").then(confirm => {
      if (!confirm) return;

      if(!this.tools.isBrowser()) { 
        console.log("BACKGROUND DESHABILITADO en menu!!");

        this.diagnostic.isLocationEnabled().then(resp => {
          if (resp) {
            this.geolocation.getCurrentPosition().then(position => {
              let listGeoDto: GeoDto[] = []
              let cu =  JSON.parse(localStorage.getItem('currentUserName'));     
              var geoDto = new GeoDto();
              geoDto.UserName = cu;
              geoDto.CurrentTime = this.tools.currentTimeGeo();
              geoDto.Latitud = (position.coords.latitude * -1).toString();
              geoDto.Longitud = (position.coords.longitude * -1).toString();
              geoDto.Accion = 'logout';
              listGeoDto.push(geoDto);            
              if (!this.networkProvider.checkNetwork()) {
                this.geoDb.addGeo(cu, this.tools.currentTimeGeo(), position.coords.latitude * -1, position.coords.longitude * -1, 'logoutSinConexión');
                setTimeout(() => {
                  this.logout();
                }, 500);
              } else {
                this.geoService.CerrarSesion(listGeoDto).subscribe( (response) => {                  
                  if(response.DataObject.Status){
                    this.logout();
                  }
                }, error =>{
                  this.logout();
                });
              }
            }).catch(error => {
              console.log("Error al recuperar ubicación en cerrar sesion", error);
            });         
          } else {
            this.logout();
          }
          // this.logout();
        });
      } else {
        this.logout();
      }
    });
  }

  private logout() {
    this.authenticationService.logout().then(() => {
      this.navCtrl.setRoot('LoginPage');
      this.navCtrl.popToRoot();
      this.geo.stopGeolocation();
      this.backgroundMode.disable();
    });
  }
}



// WEBPACK FOOTER //
// ./src/pages/menu/menu.ts