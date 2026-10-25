import { PermissionCheckerService } from './../../shared/common/permission-checker.service';
import { NetworkProvider } from './../../providers/network/network';
import { InformeConsulta } from './../../models/informe-form.model';
import { ToolsProvider } from './../../shared/page/tools';
import { InfInformesService } from './../../providers/infInformes/infInformes.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-informe',
  templateUrl: 'informe.html',
})
export class InformePage {

  datosInfPorDia: InformeConsulta[];
  //Permisos Informe
  allowAgregarInforme: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public infInformesService: InfInformesService,
    public tools: ToolsProvider,
    public networkProvider: NetworkProvider,
    public permission: PermissionCheckerService) {
      this.SetAllowPermission();
  }

  SetAllowPermission() {
    this.allowAgregarInforme = this.permission.isGranted('Inspectores.Informes.Agregar');
  }

  ngOnInit(){
    this.cargarInfiormes()
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.cargarInfiormes()
      refresher.complete();
    }, 500);
  }

  cargarInfiormes(){
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.infInformesService.ConsultaInformeUserDia(), (e) =>{
        if(e.DataObject.length != 0) this.datosInfPorDia = e.DataObject;     
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando informes...',
      }
      
      ); 
    }  else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  nuevoInforme() {   
    let modalNuevoInforme = this.modalCtrl.create('InformeAgregarPage');
    modalNuevoInforme.onDidDismiss(releod => {
      if(releod){
        this.cargarInfiormes();
      }
    });
    modalNuevoInforme.present();
  }

  informe_detalle(item: InformeConsulta){
    this.navCtrl.push("InformeDetallePage", { inf_detalle: item});
  }
}



// WEBPACK FOOTER //
// ./src/pages/informe/informe.ts