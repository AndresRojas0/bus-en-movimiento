import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalServicioSeleccionadoPage } from './modal-servicio-seleccionado';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ModalServicioSeleccionadoPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalServicioSeleccionadoPage),
    TranslateModule.forChild()
  ],
})
export class ModalServicioSeleccionadoPageModule {}



// WEBPACK FOOTER //
// ./src/pages/modal-servicio-seleccionado/modal-servicio-seleccionado.module.ts