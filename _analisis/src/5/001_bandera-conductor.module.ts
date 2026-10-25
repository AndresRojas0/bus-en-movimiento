import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BanderaConductorPage } from './bandera-conductor';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    BanderaConductorPage,
  ],
  imports: [
    IonicPageModule.forChild(BanderaConductorPage),
    TranslateModule.forChild(),
    IonicSelectableModule
  ],
})
export class BanderaConductorPageModule {}



// WEBPACK FOOTER //
// ./src/pages/bandera-conductor/bandera-conductor.module.ts