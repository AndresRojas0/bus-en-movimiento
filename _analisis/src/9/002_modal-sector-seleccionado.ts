import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HorariosPorSectorDto } from '../../models/bandera.model';
import { Content } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-modal-sector-seleccionado',
  templateUrl: 'modal-sector-seleccionado.html',
})
export class ModalSectorSeleccionadoPage {

  data: HorariosPorSectorDto;
  HederCol1: number;

  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {

    this.HederCol1 = this.navParams.get('sector');
    this.data = navParams.get("horarios");
  }

  ionViewDidEnter() {
    this.scrollToTop();
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  scrollToTop() {
    try {

      var l = this.data.Items.map((value, index) => {
        var HoraFormated = value.ColumnasDinamicas[this.HederCol1].HoraFormated;
        var h = parseInt(HoraFormated.split(":")[0]);
        var m = parseInt(HoraFormated.split(":")[1]);

        var hora = new Date();
        hora.setHours(h, m, 0, 0);
        return { s: value.Servicio, h: hora, i: index };
      });

      //Busco el inmediato proximo a la hora actual
      var today = new Date();
      var index = null;
      l.forEach(f => {
        if (!index) {
          if (f.h > today) {
            index = f.i
          }
        }
      });

      if (index) {
        let y = document.getElementById("card_" + index).offsetTop;
        this.content.scrollTo(0, y, 0);
      }

    }
    catch{

    }
  }
}



// WEBPACK FOOTER //
// ./src/pages/modal-sector-seleccionado/modal-sector-seleccionado.ts