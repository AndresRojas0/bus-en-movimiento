import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HorariosPorSectorDto, RowHorariosPorSectorDto } from '../../models/bandera.model';

@IonicPage()
@Component({
  selector: 'page-modal-servicio-seleccionado',
  templateUrl: 'modal-servicio-seleccionado.html',
})
export class ModalServicioSeleccionadoPage {

  servicioColumns: HorariosPorSectorDto;
  itemRow: RowHorariosPorSectorDto;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {

    this.servicioColumns = this.navParams.get('servicioColumns');
    this.itemRow = this.navParams.get('itemRow');
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

}



// WEBPACK FOOTER //
// ./src/pages/modal-servicio-seleccionado/modal-servicio-seleccionado.ts