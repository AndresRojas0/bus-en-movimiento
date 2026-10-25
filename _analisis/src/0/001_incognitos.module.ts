import { ComponentsModule } from './../../components/components.module';
import { CochesSearcheablesComponent } from './../../components/coches-searcheables/coches-searcheables';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IncognitosPage } from './incognitos';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    IncognitosPage,
    // CochesSearcheablesComponent
  ],
  imports: [
    IonicPageModule.forChild(IncognitosPage),
    // IonicSelectableModule,
    ComponentsModule
  ],
  exports: [
    // CochesSearcheablesComponent
  ]
})
export class IncognitosPageModule {}



// WEBPACK FOOTER //
// ./src/pages/incognitos/incognitos.module.ts