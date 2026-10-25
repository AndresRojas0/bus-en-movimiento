import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalSectorSeleccionadoPage } from './modal-sector-seleccionado';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ModalSectorSeleccionadoPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalSectorSeleccionadoPage),
    TranslateModule.forChild()
  ],
})
export class ModalSectorSeleccionadoPageModule {}



// WEBPACK FOOTER //
// ./src/pages/modal-sector-seleccionado/modal-sector-seleccionado.module.ts