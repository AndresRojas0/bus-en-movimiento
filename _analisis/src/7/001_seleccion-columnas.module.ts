import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeleccionColumnasPage } from './seleccion-columnas';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SeleccionColumnasPage,
  ],
  imports: [
    IonicPageModule.forChild(SeleccionColumnasPage),
    TranslateModule.forChild()
  ],
})
export class SeleccionColumnasPageModule {}



// WEBPACK FOOTER //
// ./src/pages/seleccion-columnas/seleccion-columnas.module.ts