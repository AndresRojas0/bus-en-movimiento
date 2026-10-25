import { ComponentsModule } from './../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableModule } from 'ionic-selectable';
import { CochesSearcheablesComponent } from './../../components/coches-searcheables/coches-searcheables';
import { ConductoresSearcheablesComponent } from './../../components/conductores-searcheables/conductores-searcheables';
import { AccordionListComponent } from './../../components/accordion-list/accordion-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InformeAgregarPage } from './informe-agregar';

@NgModule({
  declarations: [
    InformeAgregarPage,
    // AccordionListComponent,
    // ConductoresSearcheablesComponent,
    // CochesSearcheablesComponent
  ],
  imports: [
    IonicPageModule.forChild(InformeAgregarPage),
    // IonicSelectableModule,
    TranslateModule.forChild(),
    ComponentsModule
  ],
  exports: [
    // AccordionListComponent,
    // ConductoresSearcheablesComponent,
    // CochesSearcheablesComponent
  ]
})
export class InformeAgregarPageModule {}



// WEBPACK FOOTER //
// ./src/pages/informe-agregar/informe-agregar.module.ts