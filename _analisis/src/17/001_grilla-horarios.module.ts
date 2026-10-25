import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GrillaHorariosPage } from './grilla-horarios';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    GrillaHorariosPage,
  ],
  imports: [
    IonicPageModule.forChild(GrillaHorariosPage),
    TranslateModule.forChild()
  ],
})
export class GrillaHorariosPageModule {}



// WEBPACK FOOTER //
// ./src/pages/grilla-horarios/grilla-horarios.module.ts