import { HDesignarDto } from './../../models/hDesignar.model';
import { AuthenticationService } from '../../providers/auth/AuthenticationService';
import { GeoProvider } from './../../providers/geolocation/geo';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbService } from '../../providers/db/db.service';
import { ToolsProvider } from '../../shared/page/tools';
import { HorariosPorSectorDto } from 'models/bandera.model';
import { NetworkProvider } from '../../providers/network/network';
import { BackgroundMode } from '@ionic-native/background-mode';

@IonicPage()
@Component({
  selector: 'page-consultas-cache',
  templateUrl: 'consultas-cache.html',
})
export class ConsultasCachePage {

  sabana: any;
  servicioCond: any;
  porConductor: any;
  sector:any;
  banderasRelacionadas: string[];
  horariosGrilla_sabana: HorariosPorSectorDto;
  horariosGrilla_servCond: HorariosPorSectorDto;
  horariosGrilla_porCond: HorariosPorSectorDto;
  horariosPorSector: HDesignarDto;
  sectorSelec: any;
  parseSectorAbr: any;
  fecha_cache: string;
  fecha_cache2: string;
  fecha_cache3: string;

  public show:boolean = false;
  public iconName:any = 'ios-arrow-down-outline';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public db: DbService,
              public tools: ToolsProvider,
              public networkProvider: NetworkProvider,
              public geo: GeoProvider,
              private authenticationService: AuthenticationService,
              public backgroundMode: BackgroundMode) {             

    if (this.tools.isBrowser()) return;

    //SABANA
    this.db.getSabana().then((sabana) => {
      if(sabana === undefined) return;      
      this.sabana = sabana;
      this.fecha_cache = this.sabana.fecha; 
      this.banderasRelacionadas = JSON.parse(this.sabana.banderasRelacionadas); 
      this.horariosGrilla_sabana = JSON.parse(this.sabana.horarios);      
     });
    
     //SERVICIO/CONDUCTOR
    this.db.getServicioConductor().then((servicioCond) => {
      if(servicioCond === undefined) return;
      this.servicioCond = servicioCond;
      this.fecha_cache2 = this.servicioCond.fecha;
      this.horariosGrilla_servCond  = JSON.parse(this.servicioCond.horarios);   
    });

    //POR CONDUCTOR
    this.db.getPorConductor().then((porConductor) => {
      if(porConductor === undefined) return;
      this.porConductor = porConductor;
      this.fecha_cache = this.porConductor.fecha;
      this.horariosGrilla_porCond  = JSON.parse(this.porConductor.horarios);
    });

    //SECTOR
    this.db.getSector().then((sector) => {
      if(sector === undefined) return;
      this.sector = sector;
      this.sectorSelec = this.sector.sector;
      this.parseSectorAbr = JSON.parse(this.sector.sector);
      this.fecha_cache3 = this.sector.fecha;
      this.horariosPorSector = JSON.parse(this.sector.horariosPorSector);

    });
   }

  toggle() {
    this.show = !this.show;

    // CHANGE THE NAME OF THE BUTTON.
    if(this.show)  
      this.iconName = "ios-arrow-up-outline";
    else
      this.iconName = "ios-arrow-down-outline";
  }

  horariosCache_sabana(){
    this.navCtrl.push("GrillaHorariosPage", { horarios: this.horariosGrilla_sabana});
  }

  horariosCache_servCond(){
    this.navCtrl.push("GrillaHorariosPage", { horarios: this.horariosGrilla_servCond});
  }

  horariosCache_porCond(){
    this.navCtrl.push("GrillaHorariosPage", { horarios: this.horariosGrilla_porCond});
  }

  horariosCache_porSector(){   
    this.navCtrl.push("ModalSectorHorarioPage", {horariosPorSector: this.horariosPorSector, sectorSeleccionado: this.sectorSelec});
  }

  close(){
    this.tools.confirmar("Estás por salir!", "Perderás las consultas realizadas.").then(confirm => {
      if (!confirm) return;
  
      if(!this.tools.isBrowser()) {        
        this.geo.stopGeolocation();
        this.backgroundMode.disable();
      }
      this.authenticationService.logout().then(() => {
        this.navCtrl.setRoot('LoginPage');
        this.navCtrl.popToRoot();
      });
    });
  }
}



// WEBPACK FOOTER //
// ./src/pages/consultas-cache/consultas-cache.ts