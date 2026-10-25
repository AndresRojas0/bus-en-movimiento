import { DbService } from './../../providers/db/db.service';
import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { LineaService } from '../../providers/linea/linea.service';
import { LineaDto } from '../../models/linea.model';

import { HServiciosFilter, ConductoresLegajoDto } from '../../models/hServicios.model';
import { ItemDto, ItemGenericDto } from '../../models/Base/base.model';
import { HServiciosService } from '../../providers/servicio-conductor/servicio.service';
import { BanderaService } from '../../providers/bandera/bandera.service';
import { BanderaFilter, HorariosPorSectorDto } from '../../models/bandera.model';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Storage } from '@ionic/storage'
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ToolsProvider } from '../../shared/page/tools';
import { NetworkProvider } from '../../providers/network/network';
import { CalendarComponentOptions } from 'ion2-calendar/dist/calendar.model';

@IonicPage()
@Component({
  selector: 'page-bandera-conductor',
  templateUrl: 'bandera-conductor.html',
})
export class BanderaConductorPage {

  toDay = new Date();
  dateTo: Date = new Date();
  servicios: ItemDto[];
  conductores: ItemGenericDto<string>[];
  conductores_searcheables: ConductoresLegajoDto[];
  lineas: LineaDto[];
  horarios: HorariosPorSectorDto;

  _servicio: number;
  _conductor: string;
  _linea: number;
  _date: string;
  _conductor_searcheable: ItemGenericDto<string>;

  deshabilitar_servicio: boolean = false;

  marginTop: any = '50px';
  isLandscape: boolean;
  alertBuscar : any;

  conductores_searcheablesSubscription: Subscription;
  cond_seleccionado: any;

  form: FormGroup;
  conductorControl: FormControl;

  servicio_cache: string;
  linea_cache: string;

  @Input() porConductor: boolean = false;

  get linea(): number {
    return this._linea;
  }

  @Input()
  set linea(linea: number) {
    this._linea = linea;
    if(this._conductor || this._servicio) {
      this.deshabilitar_servicio = false;
      this._conductor = null;
      this._servicio = null;
    }
    if(this.networkProvider.checkNetwork()) {
      this.buscarServicios();
      this.buscarConductores();
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  get servicio(): number {
    return this._servicio;
  }

  @Input()
  set servicio(servicio: number) {
    this._servicio = servicio;
    this.buscarConductores(); 
  }

  get conductor(): string {
  return this._conductor;
  }

  @Input()
  set conductor(conductor: string) {
    this._conductor = conductor;

    if(conductor && !this._servicio){
        this.deshabilitar_servicio = true;
    }
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public lineaService: LineaService,
              public hserviciosService: HServiciosService,
              public banderaService: BanderaService,
              public alertCtrl: AlertController,
              private screenOrientation: ScreenOrientation,
              public modalCtrl: ModalController,
              public storage: Storage,
              private formBuilder: FormBuilder,
              public tools: ToolsProvider,
              public dbService: DbService,
              public networkProvider: NetworkProvider) 
              {
                this._date = this.toDay.getFullYear().toString() +'-'+ (this.toDay.getMonth()+1).toString() + '-' +  this.toDay.getDate().toString();
                this.dateTo.setDate(this.dateTo.getDate() + 3);
                this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
                this.estilosLandscape();
                this.screenOrientation.onChange().subscribe(
                  () => {
                      this.isLandscape =this.screenOrientation.type.toString().toLowerCase().indexOf('landscape') > -1;
                      this.estilosLandscape();
                  }
                );
              }
            
  ngOnInit(){
    this.tools.ShowWait(this.lineaService.GetLineas(), e =>{ this.lineas = e.DataObject; }); 

    this.conductorControl = this.formBuilder.control(this.conductores_searcheables);
    this.form = this.formBuilder.group({
      conductor_searcheable: this.conductorControl
    });

    this.form.get('conductor_searcheable').valueChanges.subscribe((v) => {
      this._conductor_searcheable = v as ItemGenericDto<string>;
      if(this._conductor_searcheable != null){
        this.completarLinea();
      }
    })
  }

  doRefresh(refresher) {
    setTimeout(() => {
     this.cleanConductor();
      this.cleanServicio();
      this._date = this.toDay.getFullYear().toString() +'-'+ (this.toDay.getMonth()+1).toString() + '-' +  this.toDay.getDate().toString();
      this._linea = null;
      this.conductorControl.reset();
      refresher.complete();
    }, 500);
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

      if(this.porConductor){
        this.conductorControl.reset();
        this.lineas = [];
        this.servicios = [];
      }
      else
      if(this._linea) {
        this._servicio = null;
        this._conductor = null;
        if(this.networkProvider.checkNetwork()) {
          this.buscarServicios();
          this.buscarConductores();
        } else {
          this.tools.toast("No hay conexión a Internet");
        }
      }
    });
    modal.present();
  }

  changeSearch(){
    this.cleanConductor();
    this.cleanServicio();
    this._linea = null;
    this.lineas = [];
    if(!this.porConductor){     
      this.tools.ShowWait(this.lineaService.GetLineas(), e =>{ this.lineas = e.DataObject; }); 
    }
    this.conductorControl.reset();
  }

  estilosLandscape() {
    this.marginTop = this.isLandscape ?  '10px' : '50px';
  }

  buscarServicios() {
    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date;
    filtro.LineaId = this._linea;
    if(this.porConductor) {
      filtro.ConductorId =  this._conductor_searcheable.Id;
    }
    this.tools.ShowWait( this.hserviciosService.RecuperarServiciosPorLinea(filtro), 
      (e) => {
         this.servicios = e.DataObject;
         if(this.porConductor && this.servicios){
          this._servicio = e.DataObject[0].Id;
         }
      });
  }

  buscarConductores() {
    if(!this.porConductor){
      var filtro = new HServiciosFilter();
      filtro.Fecha = this._date;
      filtro.LineaId = this._linea;
      filtro.ServicioId = this._servicio;
      this.tools.ShowWait( this.hserviciosService.RecuperarConductoresPorServicio(filtro),
        (e) => { this.conductores = e.DataObject;});    
    }
  }

  busquedaPorConductores(event: {
    component: IonicSelectableComponent,
    text: string,
    value: string,
    }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.conductores_searcheablesSubscription) {
      this.conductores_searcheablesSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.conductores_searcheablesSubscription) {
        this.conductores_searcheablesSubscription.unsubscribe();
      }

      event.component.items = [];
      event.component.endSearch();
      return;
    }

    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    } else if (event.text.length < 3) {
      return;
    }

    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date;
    filtro.Nombre = text;

    if(this.networkProvider.checkNetwork()) {
    this.hserviciosService.RecuperarConductores(filtro).subscribe(conductores_searcheables => {        
      event.component.items = conductores_searcheables.DataObject
      event.component.endSearch();
    })
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  completarLinea() {
    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date;
    filtro.ConductorId = this._conductor_searcheable.Id;
    this.hserviciosService.RecuperarLineasPorConductor(filtro).subscribe(lineasPorCond => {
      this.lineas = lineasPorCond.DataObject;
      if(this.lineas)
      {
        this._linea = lineasPorCond.DataObject[0].Id;
      }
      this.buscarServicios();
    })
  }

  cleanConductor(){
    //this.conductores = [];
    this._conductor = null;
    this.deshabilitar_servicio = false;
  }

  cleanServicio(){
    this._servicio = null;
    this.servicio_cache = null;
    if (this._linea) {
      this.buscarConductores();
    }
    this.deshabilitar_servicio = false;
    this.cleanConductor();
  }

  Buscar(): void  {
    var result = this.validarRequeridos();
    if(result) return;
    var filtro = new BanderaFilter();
    filtro.LineaId = this.linea;
    filtro.Fecha = this._date;
    filtro.cod_servicio = this.servicio;

    if(this.porConductor){
      filtro.cod_Conductor = this._conductor_searcheable.Id;
    }
    else {
      filtro.cod_Conductor = this.conductor;
    }

    if(this._servicio){
      this.servicio_cache = this.servicios.find(s => s.Id == this.servicio).Description;
    }

    if(this.porConductor){
      this.cond_seleccionado = this._conductor_searcheable.Description;
    }
    else{
      if (this._conductor) {
        this.cond_seleccionado = this.conductores.find(c => c.Id == this.conductor).Description;   
      }
    }

    if (this._linea) {
      this.linea_cache = this.lineas.find(l => l.Id == this.linea).Description; 
    }

    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.banderaService.recuperarHorariosSectorPorSector(filtro), e => {
        this.horarios = e.DataObject;
        this.navCtrl.push("GrillaHorariosPage", { horarios: this.horarios, servicio: this.servicio_cache, conductor: this.cond_seleccionado});
        if(this.tools.isBrowser()) return;
        if(this.porConductor){        
          this.dbService.addPorConductor(this._date, this.cond_seleccionado, this.linea_cache, this.servicio_cache, JSON.stringify(this.horarios), this.tools.currentTime());
        }
        else {
          this.dbService.addServicioConductor(this._date, this.linea_cache, this.servicio_cache, this.cond_seleccionado, JSON.stringify(this.horarios), this.tools.currentTime());
        }
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  validarRequeridos(): boolean {
    if(!this.servicio && !this._conductor) {
      if(!this.porConductor)
      {
         this.alertBuscar = this.alertCtrl.create({
          title: 'Falta Información!',
          message: 'Seleccione un servicio o un conductor.',
          buttons: ["Ok"],
        });
      }
      else
      {
        this.alertBuscar = this.alertCtrl.create({
          title: 'Falta Información!',
          message: 'Seleccione un conductor.',
          buttons: ["Ok"],
        });
      }
      this.alertBuscar.present()
      return true
    }
  }
}



// WEBPACK FOOTER //
// ./src/pages/bandera-conductor/bandera-conductor.ts