import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatePickerPage } from './date-picker';
import { CalendarModule } from 'ion2-calendar';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DatePickerPage,
  ],
  imports: [
    IonicPageModule.forChild(DatePickerPage),
    TranslateModule.forChild(),
    CalendarModule
  ],
})
export class DatePickerPageModule {}



// WEBPACK FOOTER //
// ./src/pages/date-picker/date-picker.module.ts