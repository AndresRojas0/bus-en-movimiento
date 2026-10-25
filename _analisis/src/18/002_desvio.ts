import { PermissionCheckerService } from './../../shared/common/permission-checker.service';
import { DesvioDto } from './../../models/desvio.model';
import { NetworkProvider } from './../../providers/network/network';
import { ToolsProvider } from './../../shared/page/tools';
import { DesvioService } from './../../providers/desvio/desvio.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-desvio',
  templateUrl: 'desvio.html',
})
export class DesvioPage {

  desvios: DesvioDto[]; 

  //Permisos desvio
  allowEliminarDesvio: boolean = false;
  allowAgregarDesvio: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public desvioService: DesvioService,
    public tools: ToolsProvider,
    public networkProvider: NetworkProvider,
    public modalCtrl: ModalController,
    public permission: PermissionCheckerService) {
      this.SetAllowPermission();
  }

  SetAllowPermission() {
    this.allowEliminarDesvio = this.permission.isGranted('Inspectores.Desvio.Eliminar');
    this.allowAgregarDesvio = this.permission.isGranted('Inspectores.Desvio.Agregar');
  }

  ngOnInit() {
    this.cargarDesvios();
  }

  cargarDesvios(){
    if(this.networkProvider.checkNetwork()) {

      this.tools.ShowWait(this.desvioService.GetDesviosPorUnidaddeNegocio(), e =>  {  
        if(e.DataObject.length != 0) this.desvios = e.DataObject;
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando desvios...',
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  nuevoDesvio() {
    let modalNuevoDesvio = this.modalCtrl.create('NuevoDesvioPage');
    modalNuevoDesvio.onDidDismiss(releod => {
      if(releod){
        this.cargarDesvios();
      }

    });
    modalNuevoDesvio.present();
  }

  eliminarDesvio(id: number) {

    this.tools.confirmar("Eliminar Desvío", "Está seguro que desea eliminar el desvío?").then(confirm => {
    if(!confirm) return;

    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.desvioService.delete(id), e =>  {  
        console.log("BORRADO:", e);
        if(e.Status == "Ok"){
          this.tools.alert("El desvío fue borrado satisfactoriamente.","");
        } else {
          this.tools.alert("Cuidado!","El desvio no se borro correctamente.");
        } 
      }, 
      {
        spinner: 'crescent',
        content: 'Eliminando desvios',
      });

      this.tools.ShowWait(this.desvioService.GetDesviosPorUnidaddeNegocio(), e =>  {    
        this.desvios = e.DataObject;
      }, 
      {
        spinner: 'crescent',
        content: 'Actualizando desvios...',
      });

    } else {
      this.tools.toast("No hay conexión a Internet");
    }
    });

  }

}



// WEBPACK FOOTER //
// ./src/pages/desvio/desvio.ts