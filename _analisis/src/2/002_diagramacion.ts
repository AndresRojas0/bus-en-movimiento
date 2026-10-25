import { TranslateService } from '@ngx-translate/core';
import { NetworkProvider } from './../../providers/network/network';
import { ToolsProvider } from './../../shared/page/tools';
import { InspDiagramasInspectoresFilter, DiasMesDto } from './../../models/diagramasInspectores.model';
import { DiagramacionService } from './../../providers/diagramacion/diagramacion.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController } from 'ionic-angular';
import { CalendarComponentOptions } from 'ion2-calendar/dist/calendar.model';
import { DiagramacionDbService } from '../../providers/db/diagramacionDb.service';

@IonicPage()
@Component({
  selector: 'page-diagramacion',
  templateUrl: 'diagramacion.html',
})
export class DiagramacionPage {

  _date: string;
  toDay = new Date();
  diaMes: DiasMesDto;
  permissionErrorString: string;
  msj: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public diagramacionService: DiagramacionService,
    public modalCtrl: ModalController,
    public diagramacionDb: DiagramacionDbService,
    public tools: ToolsProvider,
    public networkProvider: NetworkProvider,
    public translateService: TranslateService,
    private popoverCtrl: PopoverController) {
      this._date = this.toDay.getFullYear().toString() +'-'+ (this.toDay.getMonth()+1).toString() + '-' +  this.toDay.getDate().toString();
      this.buscarDiagramacion(this._date);
  }

  seleccionarFechaDiagramacion(){
    if (!this.networkProvider.checkNetwork()) {
      this.tools.toastPosition("No hay conexión a Internet.", 'top');
      return;
    }

    const differentOptions: CalendarComponentOptions = {
      from: new Date(2000, 0, 1),
      weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
      monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'], 
    };
    let modal = this.modalCtrl.create('DatePickerPage', { differentOptions: differentOptions});
    modal.onDidDismiss(fechaSeleccionada => {
      
      if(fechaSeleccionada) {
        this._date = fechaSeleccionada;
        this.buscarDiagramacion(fechaSeleccionada);
      }
    });
    modal.present();
  }

  getColor() {
    return this.diaMes.Color +' '+ '4px solid';
  }

  setMyStyles(inspector) {
    let styles = {
      'padding': inspector.EsFranco || inspector.EsNovedad ? '0px' : '13px 16px',
    };
    return styles;
  }

  buscarDiagramacion(fecha: string) {
    var filtro = new InspDiagramasInspectoresFilter();
    filtro.fecha = fecha;
    if (this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.diagramacionService.DiagramacionPorDia(filtro),resp=> {
        if(resp.Status == 'Ok') {
          if(resp.DataObject) {
            this.diaMes = resp.DataObject;
            if (this.tools.isBrowser()) return;
            this.diagramacionDb.addDiagramacion(fecha, JSON.stringify(this.diaMes));
          }
        }
      },
      {
        spinner: 'crescent',
        content: 'Buscando diagramación...',
      }, e => 
      { 
        this.diaMes = null;
        this.translateService.get('PERMISSION_ERROR')
        .subscribe((value) => {
          this.permissionErrorString = value;
        });  

        if(e.status == 401 || e.status == 403) {
          this.tools.toastPosition(this.permissionErrorString ,"top")
        } else if(e.status == 404) {
          if(e.error.Messages.length > 0) {
            this.msj =  e.error.Messages[0];
            console.log("MSJ:::::::::", this.msj);
          }  
        }
      });

    } else {
      this.diagramacionDb.getDiagramacion().then((diagrama) => {
        console.log("DIAGRAMACION BD:::", diagrama);      
        this._date = diagrama.Fecha;
        this.diaMes = JSON.parse(diagrama.Diagramacion);
      });
    }
  } 

  verDetalleZona(detalleZona , nombreZona) {
    let popover = this.popoverCtrl.create('VerMasInfoPage', { info: {detalleZona,nombreZona} });
    popover.present();
  }
}



// WEBPACK FOOTER //
// ./src/pages/diagramacion/diagramacion.ts