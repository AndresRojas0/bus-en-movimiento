import { ComponentsModule } from './../components/components.module';
import { IncognitosTask } from './../providers/Task/IncognitosTask';
import { CochesSearcheablesComponent } from './../components/coches-searcheables/coches-searcheables';
import { IncognitosService } from './../providers/incognitos/incognitos.service';
import { DiagramacionService } from './../providers/diagramacion/diagramacion.service';
import { DesvioService } from './../providers/desvio/desvio.service';
import { StorageService, LocalStorageService } from './../providers/service/storage.service';
import { PermissionCheckerService } from './../shared/common/permission-checker.service';
import { InformeTask } from '../providers/Task/InformeTask';
import { InformeDbService } from './../providers/db/informeDb.service';
import { CocheService } from './../providers/coche/coche.service';
import { SectorService } from './../providers/sector/sector.service';
import { HDesignarService } from './../providers/hDesignar/hDesignar.service';
import { CoordenadasService } from './../providers/coordenada/coordenadas.service';
import { TipoLineaService } from './../providers/tipoLinea/tipoLinea.service';
import { GeoService } from '../providers/geolocation/geo.service';
import { GeoDbService } from '../providers/db/geoDb.service';
import { ParametersService } from '../providers/parameters/parameters.service';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { AuthenticationService } from '../providers/auth/AuthenticationService';
import { LineaService } from '../providers/linea/linea.service';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { Settings } from '../providers/settings/settings';
import { TipoDiaService } from '../providers/tipoDia/tipoDia.service';
import { BanderaService } from '../providers/bandera/bandera.service';
import { TokenInterceptor } from '../providers/auth/token.interceptor';
import { AuthService } from '../providers/auth/auth.service';
import { UserService } from '../providers/user/user.service';
import { HFechaService } from '../providers/hFechas/hFechas.service';
import { SentidoBanderaService } from '../providers/bandera/sentidoBandera.service';
import { HServiciosService } from '../providers/servicio-conductor/servicio.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { CalendarModule } from 'ion2-calendar';

import localeEsAr from '@angular/common/locales/es-AR';
import { registerLocaleData } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version';
import { IonicSelectableModule } from 'ionic-selectable';
import { Network } from '@ionic-native/network';
import { ToolsProvider } from '../shared/page/tools';
import { SQLite } from '@ionic-native/sqlite';
import { DbService } from '../providers/db/db.service';
import { NetworkProvider } from '../providers/network/network';
import { Geolocation } from '@ionic-native/geolocation';
import { GeoProvider } from '../providers/geolocation/geo';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundMode } from '@ionic-native/background-mode';
import { MotivoService } from '../providers/motivo/motivo.service';
import { InfInformesService } from '../providers/infInformes/infInformes.service';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { HockeyApp } from 'ionic-hockeyapp';
import { CheckHockeyAppUpdatesTask } from '../providers/Task/checkHockeyAppUpdatesTask';
import { TruncateModule } from 'ng2-truncate';
import { DiagramacionDbService } from '../providers/db/diagramacionDb.service';
import { IncognitosDetalleService } from '../providers/incognitos/incognitosDetalle.service';
import { IncognitosDbService } from '../providers/db/incognitosDb.service';

registerLocaleData(localeEsAr, 'es-Ar');

//Configuracion TraslateModule. Carga traducciones 
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http , '../assets/i18n/', '.json');
}


export function provideSettings(storage: Storage) {

  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicSelectableModule, 
    IonicModule.forRoot(MyApp, { 
      tabsHideOnSubPages: true,
    },), 
    IonicStorageModule.forRoot(),
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    CalendarModule,
    TruncateModule ,
    ComponentsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    AuthService,
    StatusBar,
    SplashScreen,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LdugHMUAAAAAPIJReRrzeDjs9QZUoKvpiV5C6Ns',      
      } as RecaptchaSettings,
    },
    AuthenticationService,
    LineaService,
    TipoDiaService,
    BanderaService,
    UserService,
    SentidoBanderaService,
    HServiciosService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    HFechaService,
    ParametersService,
    GeoDbService,
    ScreenOrientation,
    { provide: LOCALE_ID, useValue: "es-Ar" },
    AppVersion,
    Network,
    ToolsProvider,
    SQLite,
    DbService,
    NetworkProvider,
    Geolocation,
    GeoProvider,
    Diagnostic,
    LocationAccuracy,
    BackgroundMode,
    GeoService,
    TipoLineaService,
    CoordenadasService,
    HDesignarService,
    SectorService,
    MotivoService,
    InfInformesService,
    InformeDbService,
    InformeTask,
    IncognitosTask,
    NativeGeocoder,
    HockeyApp, 
    CheckHockeyAppUpdatesTask,
    PermissionCheckerService,
    StorageService,
    LocalStorageService,
    DesvioService,
    DiagramacionService,
    DiagramacionDbService,
    IncognitosService,
    IncognitosDetalleService,
    IncognitosDbService

  ]
})
export class AppModule {}



// WEBPACK FOOTER //
// ./src/app/app.module.ts