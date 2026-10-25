import { SentidoBanderaService } from './../../providers/bandera/sentidoBandera.service';
import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ToastController } from 'ionic-angular';
import { LineaDto } from '../../models/linea.model';
import { LineaService } from '../../providers/linea/linea.service';
import { ItemDto } from '../../models/Base/base.model';
import { Storage } from '@ionic/storage'
import { BanderaService } from '../../providers/bandera/bandera.service';
import { BanderaFilter, HorariosPorSectorDto } from '../../models/bandera.model';
import { HFechaService } from '../../providers/hFechas/hFechas.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ToolsProvider } from '../../shared/page/tools';
import { DbService } from '../../providers/db/db.service';
import { NetworkProvider } from '../../providers/network/network';
import { CalendarComponentOptions } from 'ion2-calendar';

@IonicPage()
@Component({
  selector: 'page-sabana-bandera',
  templateUrl: 'sabana-bandera.html',
})
export class SabanaBanderaPage {

  ocultar_ban_rel: boolean = true;
  dateTo: Date = new Date();

  banderas: ItemDto[];
  lineas: LineaDto[];
  sentidos: ItemDto[];
  horarios: HorariosPorSectorDto;
  banderasRelacionadas: ItemDto[];
  
  _bandera: number;
  _linea: number;
  _date: string; 
  _sentido: number;

  selectAll: boolean;

  marginTop: any = '50px';
  isLandscape: boolean;

  horarios_cache: string;

  get linea(): number {
      return this._linea;
  }

  @Input()
  set linea(linea: number) {
      this._linea = linea;
      this.cleanFields();
      this.buscarSentidosLineaBanderas(); 
  }

  get bandera(): number {
      return this._bandera;
  }

  @Input()
  set bandera(bandera: number) {
      this._bandera = bandera;
      this.buscarBanderaRelacionadas(); 
  }

  get sentido(): number {
    return this._sentido;
  }

  @Input()
  set sentido(sentido: number) {
      this._sentido = sentido;
      this.buscarBanderas();
      this.limpiarBanderasRelacionadas();
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public alertCtrl: AlertController,
              public storage: Storage,
              public lineaService: LineaService,
              public banderaService: BanderaService,
              public hFechaService: HFechaService,
              public sentidoBanderaService: SentidoBanderaService ,
              private screenOrientation: ScreenOrientation,
              public modalCtrl: ModalController,
              public tools: ToolsProvider,
              public dbService: DbService,
              public networkProvider: NetworkProvider,
              public toast: ToastController
              )  {
                
                  var toDay=new Date();    
                  this.dateTo.setDate(this.dateTo.getDate() + 3);         
                  this._date = toDay.getFullYear().toString() +'-'+ (toDay.getMonth()+1).toString() + '-' +  toDay.getDate().toString();
                  this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
                  this.estilosLandscape();                     
                  this.tools.ShowWait(lineaService.GetLineas(), e => { this.lineas = e.DataObject; });  
                  this.screenOrientation.onChange().subscribe(
                    () => {
                        this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
                        this.estilosLandscape();
                    }
                  );
                }                   
             
  doRefresh(refresher) {
    setTimeout(() => {
      this.cleanFields();
      var toDay=new Date();
      this._date = toDay.getFullYear().toString() +'-'+ (toDay.getMonth()+1).toString() + '-' +  toDay.getDate().toString();
      this.linea = null;
      refresher.complete();
    }, 500);
  }

  estilosLandscape() {
    this.marginTop = this.isLandscape ?  '10px' : '50px';
  }
                
  cleanFields(): void {
      this.banderas = [];
      this.banderasRelacionadas = [];
      this.ocultar_ban_rel = true;
      this._bandera = null;
      this._sentido = null;
   };

   limpiarBanderasRelacionadas(): void {
    this.banderasRelacionadas = [];
    this.ocultar_ban_rel = true;
   }

  buscarBanderaRelacionadas(){
    if(this.bandera) {

      this.ocultar_ban_rel = false;
      var filtro = new BanderaFilter();
      filtro.BanderaRelacionadaID = this.bandera;
      filtro.LineaId = this.linea;
      filtro.Fecha = this._date;
      if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait( this.banderaService.recuperarBanderasRelacionadasPorSector(filtro), e =>  {      
        this.banderasRelacionadas = e.DataObject
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando Banderas Relacionadas',
      });
    }else{
      this.tools.toast("No hay conexión a Internet");
    }
    }
  }

  buscarSentidosLineaBanderas() {
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.sentidoBanderaService.GetItemsAsync({LineaId: this.linea }), e =>  {      
        this.sentidos = e.DataObject;
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando sentidos',
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  } 

  buscarBanderas(){

    if(this._linea && this._sentido)
    {
      var filtro = new BanderaFilter();
      filtro.SentidoBanderaId = this._sentido;
      filtro.LineaId = this.linea;
      filtro.Fecha = this._date;
      if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.banderaService.RecuperarLineasActivasPorFecha(filtro), e =>  {      
        this.banderas = e.DataObject;
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando bandera',
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
    }
  }

  Buscar(): void {

    var result = this.validarRequeridos();
    if(result) return;
    var banderasRelacionadasDesc = [];
    var filtro = new BanderaFilter();
    filtro.SentidoBanderaId = this._sentido;
    filtro.LineaId = this.linea;
    filtro.BanderasSeleccionadas = [];
    filtro.Fecha = this._date;

    if(this.banderasRelacionadas){
      this.banderasRelacionadas.forEach(element => {
        if(element.IsSelected){
          filtro.BanderasSeleccionadas.push(element.Id);
          banderasRelacionadasDesc.push(element.Description);
        }
      });
    }
    
    filtro.BanderasSeleccionadas.push(this.bandera);
    let lineaDescripcion = this.lineas.find(l => l.Id == this.linea).Description; 
    let sentidoDescripcion = this.sentidos.find(s => s.Id == this._sentido).Description;   
    let banderaDescripcion = this.banderas.find(b => b.Id == this.bandera).Description; 
    if(this.networkProvider.checkNetwork()) {
    this.tools.ShowWait(this.banderaService.recuperarHorariosSectorPorSector(filtro), e =>  {      
      this.horarios = e.DataObject;
      this.horarios_cache = JSON.stringify(this.horarios);        
      this.navCtrl.push("GrillaHorariosPage",{ horarios: this.horarios })
      if (this.tools.isBrowser()) return;
      this.dbService.addSabana(this._date, lineaDescripcion, sentidoDescripcion, banderaDescripcion,JSON.stringify(banderasRelacionadasDesc), this.horarios_cache, this.tools.currentTime());
    }, 
    {
      spinner: 'crescent',
      content: 'Buscando información',
    }); 
  }  else {
    this.tools.toast("No hay conexión a Internet");
  }
  }

  SelectAll(): void{

    if(this.banderasRelacionadas){
      this.banderasRelacionadas.forEach(element => {
          element.IsSelected = this.selectAll;
      });
    }
  }

  checkIfAnySelected(): void {
    this.banderasRelacionadas.forEach(element => {
      if(!element.IsSelected){
        this.selectAll = false;
      }
    });
  }

  validarRequeridos(): boolean {
  
    if(!this._linea || !this._sentido || !this._bandera) {
      let alert = this.alertCtrl.create({
        title: 'Falta Información!',
        message: 'Complete todos los campos',
        buttons: ["Ok"],
      });
      alert.present() 
      return true
    }
  }

  public seleccionarFecha() {
    const differentOptions: CalendarComponentOptions = {
      from: new Date(2000, 0, 1),
      to:  this.dateTo,
      weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
      monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    };
    let modal = this.modalCtrl.create('DatePickerPage', { differentOptions: differentOptions});
    modal.onDidDismiss(fechaSeleccionada => {
      if(fechaSeleccionada) {
        this._date = fechaSeleccionada;
      }

      this.cleanFields();
      this.buscarBanderas();
    });

    modal.present();
  }
}



// WEBPACK FOOTER //
// ./src/pages/sabana-bandera/sabana-bandera.ts