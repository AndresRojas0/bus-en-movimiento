import { IncognitosTask } from './../../providers/Task/IncognitosTask';
import { InformeTask } from './../../providers/Task/InformeTask';
import { CheckHockeyAppUpdatesTask } from './../../providers/Task/checkHockeyAppUpdatesTask';
import { BackgroundMode } from '@ionic-native/background-mode';
import { DbService } from './../../providers/db/db.service';
import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../providers/auth/AuthenticationService';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NetworkProvider } from './../../providers/network/network';
import { ToolsProvider } from '../../shared/page/tools';
import { GeoProvider } from '../../providers/geolocation/geo';
import { PermissionCheckerService } from '../../shared/common/permission-checker.service';

export const Code_UserPasswordInvalid = 1;
export const Code_RequiredCaptcha = 2;
export const Code_InvalidCaptcha = 3;

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  _dni: string;
  _password: string;
  _remember: boolean = false;

  private loginStorageDni: string = 'loginStorageDni';
  private loginStoragePass: string = 'loginStoragePass';

  captchaVisible: Boolean = false;
  isLandscape: boolean;

  passwordType: string = 'password';
  passwordShow: boolean = false;

  usr: any;

  get dni(): string {
    return this._dni;
  }

  @Input() captchaValue: string;

  @Input()
  set dni(dni: string) {
    this._dni = dni;
    if (!this._dni) {
      this._remember = false;
    }
  }

  get password(): string {
    return this._password;
  }

  @Input()
  set password(password: string) {
    this._password = password;
    if (!this._password) {
      this._remember = false;
    }
  }

  constructor(public translateService: TranslateService,
    private screenOrientation: ScreenOrientation,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    protected authenticationService: AuthenticationService,
    public alerCtrl: AlertController,
    public storage: Storage,
    public networkProvider: NetworkProvider,
    public toolsProvider: ToolsProvider,
    public db: DbService,
    public geo: GeoProvider,
    public tools: ToolsProvider,
    private backgroundMode: BackgroundMode,
    public checkHockeyAppUpdatesTask: CheckHockeyAppUpdatesTask,
    private permissionsService: PermissionCheckerService,
    public informeTask: InformeTask,
    public incognitosTask: IncognitosTask,
    
  ) {
    this.loadCredentialsFromStorage();
    this.isLandscape = this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
    this.screenOrientation.onChange().subscribe(() => {
      this.isLandscape = this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1
    });
  }

  togglePassword() {
    if (this.passwordShow) {
      this.passwordShow = false;
      this.passwordType = 'password';
    } else {
      this.passwordShow = true;
      this.passwordType = 'text';
    }
  }

  doLogin() {

    if (this.networkProvider.checkNetwork()) {
      this.sesionConConexion();
    } else {    
      this.sesionSinConexion();
    }
  }

  private sesionConConexion() {
    var loading = this.toolsProvider.startLoading("Procesando...");
    this.authenticationService.login(this._dni, this._password, this.captchaValue)
      .subscribe(
        data => {
                  if (!this.toolsProvider.isBrowser()) {
                    this.db.addUsr(this._dni, this._password);
                  }

                  if (this._remember) {
                    this.storageCredenciales(this._dni, this._password, this._remember);
                  }
                  
                  loading.dismiss();
                          
                  if(!this.tools.isBrowser()) {
                    //start geolocation
                    this.tracking(); 
                    //Informes en bd interna.
                    this.informeTask.Run();                 
                    this.incognitosTask.Run();                 
                  }

                  //Permissions
                  this.permissionsService.GetPermissions().subscribe(per => {
                  this.permissionsService.setPermissions(per.DataObject);
                  this.permissionsService.loadPermissions();
                  //Check Updates hockeyApp
                  this.checkHockeyAppUpdatesTask.runTaskCheckUpdateVersion();
                  this.navCtrl.setRoot('MenuPage');
                  this.navCtrl.popToRoot();
                });      
        },     
        error => {
                 loading.dismiss();
                  try {
                    var text = error.text();
                    if (text.indexOf('"isTrusted": true') != -1) {
                      this.toolsProvider.alert('Ha ocurrido un error','Posiblemente usted no tenga Internet.');                    
                    }
                    var data = error.json();
                    if (data.code == Code_InvalidCaptcha || data.code == Code_RequiredCaptcha) {
                        this.captchaVisible = true;
                        setTimeout(()=> grecaptcha.reset(),500)
                        this.toolsProvider.alertObj("Datos Incorrectos", data.message);
                    }
                    if (data.code == Code_UserPasswordInvalid) {
                        this.captchaVisible = false;
                        this.toolsProvider.alertObj("Datos Incorrectos", data.message);                       
                    }                        
                } catch (e) {
                  console.log(e);
                }
              });
  }

  private sesionSinConexion() {
    this.toolsProvider.confirmar("Sin conexión", "Estas por iniciar una sesión sin conexión.").then(confirm => {
      if (!confirm) return;
          
      this.db.getUsr().then(usr => {
        if (usr === null) {
          this.toolsProvider.alert("Sin conexión", "Debe iniciar sesión con conexión al menos una vez")
        }
        this.usr = usr;
        if (this.usr.dni === this._dni && this.usr.pass === this._password) {
          this.navCtrl.push('ConsultasCachePage');
          //Start geolocation
          if(!this.tools.isBrowser()) {
            this.tracking();
          }
        }
        else {
          this.toolsProvider.alert("Datos Incorrectos", "DNI o Clave Incorrecta");
        }
      })
    });
  }

  private tracking() {
    this.backgroundMode.enable();
    this.geo.trackPosition('login').then(rta => {
      if(!rta) {
        this.geo.requestActivation().then(r => {
          this.geo.trackPosition('login');
        });
      } else {
        this.geo.startGeolocation();
      }
    });
  }

  rememberCredentials() {
    if (!this._remember && this._dni && this._password) {
      this._dni = null;
      this._password = null;
      this.storage.remove(this.loginStorageDni);
      this.storage.remove(this.loginStoragePass);
      this.storage.remove("remembercredentials");
    }
  }

  private storageCredenciales(dni: string, pass: string, remember: boolean) {
    this.storage.set(this.loginStorageDni, dni);
    this.storage.set(this.loginStoragePass, pass);
    this.storage.set("remembercredentials", remember);
  }

  private loadCredentialsFromStorage(): Promise<any> {
    return this.storage.get(this.loginStorageDni).then((dni: string) => {
      if (!dni) dni = '';
      this._dni = dni;
      this.storage.get(this.loginStoragePass).then((pass: string) => {
        if (!pass) pass = '';
        this._password = pass;
        this.storage.get("remembercredentials").then((remember: boolean) => {
          if (!remember) remember = false;
          this._remember = remember;
        });
      });
    });
  }

  resolved(captchaResponse: string) {
    this.captchaValue = captchaResponse;
  }
}



// WEBPACK FOOTER //
// ./src/pages/login/login.ts