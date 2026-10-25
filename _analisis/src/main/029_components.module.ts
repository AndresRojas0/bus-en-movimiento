import { CocheService } from './../providers/coche/coche.service';
import { NgModule } from '@angular/core';
import { NavbarComponent } from './navbar/navbar';
import { AccordionListComponent } from './accordion-list/accordion-list';
import { ConductoresSearcheablesComponent } from './conductores-searcheables/conductores-searcheables';
import { CochesSearcheablesComponent } from './coches-searcheables/coches-searcheables';
import { TruncatedTextComponent } from './truncated-text/truncated-text';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { TruncateModule } from 'ng2-truncate';


@NgModule({
	declarations: [
                NavbarComponent,
                AccordionListComponent,
                ConductoresSearcheablesComponent,
                CochesSearcheablesComponent,
                TruncatedTextComponent
        ],
	imports: [
                CommonModule,
                IonicModule,
                IonicSelectableModule,
                TruncateModule
        ],
	exports: [
                // NavbarComponent,
                AccordionListComponent,
                ConductoresSearcheablesComponent,
                CochesSearcheablesComponent,
                TruncatedTextComponent
        ],
        providers: [
                CocheService,

        ]
})
export class ComponentsModule {}



// WEBPACK FOOTER //
// ./src/components/components.module.ts