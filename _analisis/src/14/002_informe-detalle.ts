import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-informe-detalle',
  templateUrl: 'informe-detalle.html',
})
export class InformeDetallePage {

  infDetalle: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams) { }

  ngOnInit(){
    this.infDetalle = this.navParams.get("inf_detalle");
  }

}



// WEBPACK FOOTER //
// ./src/pages/informe-detalle/informe-detalle.ts