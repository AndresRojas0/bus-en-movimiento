import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-seleccion-columnas',
  templateUrl: 'seleccion-columnas.html',
})
export class SeleccionColumnasPage {

  public options: {value: string, desc: string, selected: boolean}[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) { }

  ngOnInit() {
    this.options = this.navParams.get('options');
  }

  selectOptions() {
    this.viewCtrl.dismiss();
  }

}



// WEBPACK FOOTER //
// ./src/pages/seleccion-columnas/seleccion-columnas.ts