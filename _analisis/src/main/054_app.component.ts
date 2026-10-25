import { CheckHockeyAppUpdatesTask } from './../providers/Task/checkHockeyAppUpdatesTask';
import { HockeyApp } from 'ionic-hockeyapp';
import { GeoProvider } from './../providers/geolocation/geo';
import { Component } from '@angular/core';
import { Platform, AlertController, App, IonicApp } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../providers/auth/AuthenticationService';
import { NetworkProvider } from '../providers/network/network';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //public rootPage;
  rootPage:any = 'LoginPage';
  
  constructor(
              private translate: TranslateService,
              protected authenticationService: AuthenticationService,
              public platform: Platform, 
              private statusBar: StatusBar, 
              private splashScreen: SplashScreen, 
              public alertCtrl: AlertController,
              public app: App,
              public ionicApp: IonicApp,
              public networkProvider: NetworkProvider,
              public geo: GeoProvider,
              public hockeyapp: HockeyApp,
              public checkHockeyAppUpdatesTask: CheckHockeyAppUpdatesTask
              ) {
                
  platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.establecerBackButton();
      this.networkProvider.suscribir();
      // let go = new InformeTask();
      // this.networkProvider.AddTaskOnConnect(go); 
      this.geo.inicializarBackgroundMode();
      this.initHockeyAppSDK();
    });
    this.initTranslate();
  }

  private establecerBackButton() {
    this.platform.registerBackButtonAction(async () => {
      const overlayView = this.ionicApp._overlayPortal.getActive(); //this.app._appRoot._overlayPortal._views[0];
      let nav = this.app.getActiveNav();

      //Name modal datePicker
      var currentId = nav.getActive().id;
      var isModal = ["SabanaBanderaPage", "BanderaConductorPage", "LoginPage", "ConsultasCachePage", "SectorPage", "InformePage", "DiagramacionPage"].indexOf(currentId) == -1;

      if(overlayView && overlayView.dismiss) {
        overlayView.dismiss();
      }
        
      if (nav.canGoBack() || isModal){
        nav.pop();
        return;
      } 

      var confirmado = await this.showConfirm();
      if (confirmado){
        if(currentId == "LoginPage") this.exitApp();
        this.geo.trackeoAlSalirApp('logout').subscribe((response) => {
          this.exitApp();      
        })
      } 
    });
  }

  exitApp() {
    this.platform.exitApp();
  }

  private showConfirm(): Promise<boolean> {
    return new Promise<boolean>((ok) => {
      const confirm = this.alertCtrl.create({
        title: 'Confirmar Salida',
        message: '¿Está seguro que quiere salir de la aplicación?',
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {
              return ok(false);
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              return ok(true);
            }
          }
        ]
      });
      confirm.present();
    })    
}

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('es');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('es'); // Set your language here
    }

    // this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
    //   this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    // });
  }

  initHockeyAppSDK() {
    let androidAppId = '70ac617590ed45f2a79f518d35edebd9';   
    let checkForUpdatesMode = 'CHECK_ON_STARTUP'; //'CHECK_MANUALLY'; 
    let autoSendCrashReports = false;
    let ignoreCrashDialog = false;
    this.hockeyapp.start(androidAppId, null, autoSendCrashReports, ignoreCrashDialog, checkForUpdatesMode);
  }
}





// WEBPACK FOOTER //
// ./src/app/app.component.ts