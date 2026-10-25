import { TruncatedTextComponent } from './../../components/truncated-text/truncated-text';
import { TruncateModule } from 'ng2-truncate';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DesvioPage } from './desvio';

@NgModule({
  declarations: [
    DesvioPage,
    TruncatedTextComponent
  ],
  imports: [
    IonicPageModule.forChild(DesvioPage),
    TruncateModule 
  ],
})
export class DesvioPageModule {}



// WEBPACK FOOTER //
// ./src/pages/desvio/desvio.module.ts