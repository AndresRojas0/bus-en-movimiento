import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the VerMasInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ver-mas-info',
  templateUrl: 'ver-mas-info.html',
})
export class VerMasInfoPage {

  info: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    this.info = this.navParams.get('info');
    console.log("Detalle zona::", this.info);
    
  }

}



// WEBPACK FOOTER //
// ./src/pages/ver-mas-info/ver-mas-info.ts