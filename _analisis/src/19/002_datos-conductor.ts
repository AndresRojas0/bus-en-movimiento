import { ConductoresLegajoDto } from './../../models/hServicios.model';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-datos-conductor',
  templateUrl: 'datos-conductor.html',
})
export class DatosConductorPage {

  public infoConductor: ConductoresLegajoDto;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DatosConductorPage');
  }

  ngOnInit() {
    this.infoConductor = this.navParams.get('infoConductor');
  }

}



// WEBPACK FOOTER //
// ./src/pages/datos-conductor/datos-conductor.ts