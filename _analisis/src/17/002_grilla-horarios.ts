
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, Config } from 'ionic-angular';
import { HorariosPorSectorDto } from '../../models/bandera.model';
import { BanderaService } from '../../providers/bandera/bandera.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ToolsProvider } from '../../shared/page/tools';
import { NetworkProvider } from '../../providers/network/network';

@IonicPage()
@Component({
  selector: 'page-grilla-horarios',
  templateUrl: 'grilla-horarios.html',
})
export class GrillaHorariosPage {

  data: HorariosPorSectorDto;
  HederCol1: number;
  HederCol2: number;
  HederCol3: number; 
  HederCol4: number;
  HederCol5: number;  

  UltimaColumna = 0;

  sector: any;
  isLandscape: boolean;

  columns: {value: string, desc: string, selected: boolean}[];
  showColumns: Array<string>;

  servicio:  string;
  conductor: string;

  removerCabecera: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public banderaService: BanderaService,
    public modalCtrl: ModalController,
    private screenOrientation: ScreenOrientation,
    private popoverCtrl: PopoverController, 
    public config: Config,
    public tools: ToolsProvider,
    public networkProvider: NetworkProvider) {
 
      this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
      this.removerCabecera = this.isLandscape ?  true : false; 
      this.screenOrientation.onChange().subscribe(
        () => {
          console.log(this.screenOrientation.type);
          this.isLandscape =  this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;        
          this.removerCabecera = this.isLandscape ?  true : false;    

        }
      );

      this.HederCol1 = 0;
      this.HederCol2 = 1;
      this.HederCol3 = 2;
      this.HederCol4 = 3;
      this.HederCol5 = 4; 
      
      this.data = navParams.get("horarios");     
      this.UltimaColumna = this.data.Colulmnas.length - 1;

      this.columns = [
        {value: 'service', desc: 'Servicio', selected: true},
        {value: 'departure', desc: 'Sale', selected: true},
        {value: 'flag', desc: 'Bandera', selected: true},
        {value: 'arrives', desc: 'Llega', selected: true},
        {value: 'frecuency', desc: 'Frecuencia', selected: false}
      ];

      this.showColumns = new Array();
      this.showColumns.push('service', 'departure', 'flag', 'arrives');
      this.servicio = navParams.get("servicio");
      this.conductor = navParams.get("conductor");
  }
  
  modalSector(sector) {
    let modalSector = this.modalCtrl.create('ModalSectorSeleccionadoPage', { sector: sector, horarios: this.data });
    modalSector.present();
  }

  modalServicio(servicioColumns, itemRow) {
    console.log("servicioColumns", servicioColumns);
    console.log("itemRow", itemRow);
    let modalServicio = this.modalCtrl.create('ModalServicioSeleccionadoPage', { servicioColumns: servicioColumns, itemRow: itemRow})
    modalServicio.present();
  }
  
  swipeEvent(e) {
    if (e.direction == 2) {
      this.pasar(1);
    }
    else{
      this.pasar(-1);
    }
  }

  pasar(value: number)
  {
    if(value == -1 && this.HederCol1 == 0)  { 
      return;
    }

    var maxcolumvalue = this.isLandscape ?  this.HederCol5 : this.HederCol3;

    if(value == 1 && maxcolumvalue >= this.UltimaColumna)  { 
      return;
    } 
  
    this.HederCol1 += value;
    this.HederCol2 += value;
    this.HederCol3 += value; 
    this.HederCol4  += value;
    this.HederCol5  += value;

  }

  public selectColumns(): void {
    let popover = this.popoverCtrl.create('SeleccionColumnasPage', { options: this.columns });
    popover.onDidDismiss(resp => {
      this.showColumns = this.columns.map(column => {
        if (column.selected) {
          return column.value;
        }
      });
    });

    popover.present();
  }
}



// WEBPACK FOOTER //
// ./src/pages/grilla-horarios/grilla-horarios.ts