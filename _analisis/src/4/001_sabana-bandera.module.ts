import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SabanaBanderaPage } from './sabana-bandera';
import { TranslateModule } from '../../../node_modules/@ngx-translate/core';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  declarations: [
    SabanaBanderaPage,
  ],
  imports: [
    IonicPageModule.forChild(SabanaBanderaPage),
    TranslateModule.forChild(),
    CalendarModule
  ],

})
export class SabanaBanderaPageModule {}



// WEBPACK FOOTER //
// ./src/pages/sabana-bandera/sabana-bandera.module.ts