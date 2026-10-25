import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SectorPage } from './sector';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    SectorPage,
  ],
  imports: [
    IonicPageModule.forChild(SectorPage),
    IonicSelectableModule
  ],
})
export class SectorPageModule {}



// WEBPACK FOOTER //
// ./src/pages/sector/sector.module.ts