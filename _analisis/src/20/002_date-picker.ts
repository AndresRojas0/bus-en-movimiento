import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-date-picker',
  templateUrl: 'date-picker.html',
})
export class DatePickerPage {

  type = 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  fechaSeleccionada: string;

  date: Date = new Date();


  isLandscape: boolean;
  removerFooter: boolean = false;
  differentOptions: CalendarComponentOptions;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private screenOrientation: ScreenOrientation) {

    moment.locale('es-AR');
    // this.dateTo.setDate(this.dateTo.getDate() + 3);
    this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
    this.removerFooter = this.isLandscape ?  true : false; 
    this.screenOrientation.onChange().subscribe(
      () => {
          this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
          this.removerFooter = this.isLandscape ?  true : false; 
      }
    ); 
   
  }

  ngOnInit() {  
    this.differentOptions = this.navParams.get('differentOptions');
  }

  // options: CalendarComponentOptions = {
  //   daysConfig,
  //   from: new Date(2000, 0, 1),
  //   to:  this.dateTo,
  //   weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
  //   monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  // };

  onChange($event) {
    this.fechaSeleccionada = $event;
  }

  aceptar() {
    this.viewCtrl.dismiss(this.fechaSeleccionada);
  }

}



// WEBPACK FOOTER //
// ./src/pages/date-picker/date-picker.ts