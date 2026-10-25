import { HDesignarDto } from './../../models/hDesignar.model';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Content } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-modal-sector-horario',
  templateUrl: 'modal-sector-horario.html',
})
export class ModalSectorHorarioPage {

  data: HDesignarDto[];
  sectorSelec: any;
  parseSectorSelec: any;

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {

      this.data = navParams.get("horariosPorSector");
      this.sectorSelec = navParams.get("sectorSeleccionado");
      this.parseSectorSelec = JSON.parse(this.sectorSelec);
      
  }


  ionViewDidEnter() {
    this.scrollToTop();
  }

  scrollToTop() {
    try {

      var l = this.data.map((value, index) => {
        var HoraFormated = value.HoraFormated;
        var h = parseInt(HoraFormated.split(":")[0]);
        var m = parseInt(HoraFormated.split(":")[1]);

        var hora = new Date();
        hora.setHours(h, m, 0, 0);
       
        return { s: value.NumeroServicio, h: hora, i: index };
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

  cancel() {
    this.viewCtrl.dismiss();
  }

  

}



// WEBPACK FOOTER //
// ./src/pages/modal-sector-horario/modal-sector-horario.ts