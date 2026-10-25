import { TranslateService } from '@ngx-translate/core';
import { InfInformesService } from './../../providers/infInformes/infInformes.service';
import { InformeDbService } from './../../providers/db/informeDb.service';
import { InformeForm } from './../../models/informe-form.model';
import { CocheDto, CocheFilter } from './../../models/coche.model';
import { CocheService } from './../../providers/coche/coche.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NetworkProvider } from './../../providers/network/network';
import { MotivoService } from './../../providers/motivo/motivo.service';
import { LineaService } from '../../providers/linea/linea.service';
import { ToolsProvider } from './../../shared/page/tools';
import { HServiciosService } from '../../providers/servicio-conductor/servicio.service';
import { HServiciosFilter, ConductoresLegajoDto } from './../../models/hServicios.model';
import { ItemDto, ViewMode } from './../../models/Base/base.model';
import { LineaDto } from './../../models/linea.model';
import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, AlertController, Events, ViewController } from 'ionic-angular';
import { Geolocation } from "@ionic-native/geolocation";
import * as moment from 'moment';
import { CalendarComponentOptions } from 'ion2-calendar/dist/calendar.model';

@IonicPage()
@Component({
  selector: 'page-informe-agregar',
  templateUrl: 'informe-agregar.html',
})
export class InformeAgregarPage {

  public form: FormGroup;
  public informeForm: InformeForm;

  toDay = new Date();
  dateTo: Date = new Date();
  dateFrom: number | Date;
  lineas: LineaDto[];
  servicios: ItemDto[];
  motivos: ItemDto[];
  coches: CocheDto[];

  _date: string;
  _time: string;
  _dateNoti: string;
  fechaInfraSelec: string;
  isFechaInfraSelec: boolean = false;
  conductor : ConductoresLegajoDto;

  public ccoche: boolean = true;
  permissionErrorString: string;

  geoLatitude: number;
  geoLongitude: number;

  @Input() isDisabled: boolean = false;
  @Input() ubicacion: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public hserviciosService: HServiciosService,
    public tools: ToolsProvider,
    private popoverCtrl: PopoverController,
    public lineaService: LineaService,
    public motivoService: MotivoService,
    public networkProvider: NetworkProvider,
    private geolocation: Geolocation,
    private formBuilder: FormBuilder,
    private cocheService: CocheService,
    public infInformesService: InfInformesService, 
    public informeDb: InformeDbService,
    private events: Events,
    public translateService: TranslateService,
    public viewCtrl: ViewController
    ) { 
      this.dateTo.setDate(this.dateTo.getDate() + 3);
      this._date = this.toDay.getFullYear().toString() +'-'+ (this.toDay.getMonth()+1).toString() + '-' +  this.toDay.getDate().toString(); 
      this._time = this.toDay.getHours() +':'+ this.toDay.getMinutes();
    }

  ngOnInit(){
    this.recuperarMotivos();
    this.informeForm = new InformeForm();    
    this.informeForm.FecInfraccionString = this._date;
    this.informeForm.Hora = this._time;
    this.informeForm.NotificadoBoolean = false;

    this.form = this.formBuilder.group({
      FecInfraccionString:    [this.informeForm.FecInfraccionString, null],
      Hora:                   [this.informeForm.Hora, null],
      Latitud:                [this.informeForm.Latitud, null],
      Longitud:               [this.informeForm.Longitud, null],
      LugarHecho:             [this.informeForm.LugarHecho, null],
      DscLugar:               [this.informeForm.DscLugar, Validators.required],
      CodEmp:                 [this.informeForm.CodEmp, Validators.required],
      CodEmpr:                [this.informeForm.CodEmpr, null],
      CodLin:                 [this.informeForm.CodLin, Validators.required],
      NumSer:                 [this.informeForm.NumSer, null],
      NroInterno:             [this.informeForm.NroInterno, Validators.required],
      CodMotivo:              [this.informeForm.CodMotivo, Validators.required],
      NotificadoBoolean:      [this.informeForm.NotificadoBoolean, null],
      FechaNotificadoString:  [this.informeForm.FechaNotificadoString],
      ObsInforme:             [this.informeForm.ObsInforme, null],
    });
    
    this.setValidator();

    this.form.valueChanges.subscribe(values => {
      const form = values as InformeForm;
      form.isValid = this.form.valid;
      console.log(form);
      // console.log('isvalid: ' + form.isValid);
    });

  }

  public setValidator() {
    const descLugarControl = this.form.get('DscLugar');
    const fechaNotificadoControl = this.form.get('FechaNotificadoString');

    this.form.get('LugarHecho').valueChanges.subscribe(lugarHecho => {
      if(lugarHecho) {
        this.informeForm.DscLugar = "";
        descLugarControl.setValidators(null);
      }  else {
        descLugarControl.setValidators(Validators.required);
      }
      descLugarControl.updateValueAndValidity();
    });

    this.form.get('NotificadoBoolean').valueChanges.subscribe(notificado => {
      if(!notificado) {
        fechaNotificadoControl.setValidators(null);
        this._dateNoti = null;
        fechaNotificadoControl.setValue(null);
      }  else {
        fechaNotificadoControl.setValidators([Validators.required]);
      }     
        fechaNotificadoControl.updateValueAndValidity(); 
    });
  }

  public recuperarMotivos(): void {
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.motivoService.GetItemsAsync(), e =>  {      
        this.motivos = e.DataObject; 
      }, 
      {
        spinner: 'crescent',
        content: 'Cargando...',
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  public seleccionarFechaInfraccion() {
    const differentOptions: CalendarComponentOptions = {
      from: new Date(2000, 0, 1),
      to:  this.dateTo,
      weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
      monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    };
    let modal = this.modalCtrl.create('DatePickerPage', { differentOptions: differentOptions});
    modal.onDidDismiss(fechaSeleccionada => {
      if(fechaSeleccionada) {
        this.isFechaInfraSelec = true
        this.fechaInfraSelec = fechaSeleccionada
        this._date = fechaSeleccionada;
        const fechaFormat = moment(fechaSeleccionada).format('DD/MM/YYYY');
        this.form.get('FecInfraccionString').setValue(fechaFormat);
        this.events.publish('informe:fecha_seleccionada', fechaSeleccionada);
      }
      this.cleanFields();
    });
    modal.present();
  }

  public cleanFields() {
    this.form.get('FechaNotificadoString').setValue(null);
    this.form.get('CodEmp').reset()
    this.form.get('CodLin').reset();
    this.form.get('NumSer').reset();
    this.form.get('NroInterno').reset();
    this.coches = [];
    this.servicios = [];
    this.ccoche = true;
  }

  public completarLinea($event) {

    this.conductor = $event.conductor;
    this.informeForm.CodEmpr = $event.conductor.CodEmpresa;
    this.form.get('CodLin').reset();
    this.form.get('NumSer').reset();
    this.servicios = [];
    if(!this.ccoche){
      this.ccoche = true;
    }
    this.form.get('NroInterno').reset();
    this.coches = [];
    
    if($event.conductor.Id) {
      this.form.get('CodEmp').setValue($event.conductor.Id);
      this.informeForm.CodEmp = $event.conductor.Id;
    }
    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date; 
    filtro.ConductorId = $event.conductor.Id;
    this.hserviciosService.RecuperarLineasPorConductor(filtro).subscribe(lineasPorCond => {
      this.lineas = lineasPorCond.DataObject;
      if(this.lineas.length > 0) {
        this.form.get('CodLin').setValue(lineasPorCond.DataObject[0].Id);
        this.buscarServicios();
      }
    })
  }

  public buscarServicios() {
    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date;
    filtro.LineaId = this.form.get('CodLin').value;
    filtro.ConductorId =  this.conductor.Id;
    this.tools.ShowWait( this.hserviciosService.RecuperarServiciosPorLinea(filtro),(e) => {
        this.servicios = e.DataObject;
        if(this.servicios) {
          this.form.get('NumSer').setValue(e.DataObject[0].Id);
          this.recuperarCoches();
        }
    });
  }

  public verConductor(): void {
    let popover = this.popoverCtrl.create('DatosConductorPage', { infoConductor: this.conductor}, {cssClass: 'popoverOpacity'});
    popover.onDidDismiss(resp => {
    });
    popover.present();
  }

  public verOtrasLineas() {
    this.tools.ShowWait(this.lineaService.GetLineas(), e => {
      this.lineas = e.DataObject;
    });      
  }

  public verOtrosServicios() {
    var filtro = new HServiciosFilter();
    filtro.Fecha = this._date;
    filtro.LineaId = this.form.get('CodLin').value;
    this.tools.ShowWait(this.hserviciosService.RecuperarServiciosPorLinea(filtro),(e) => {
      this.servicios = e.DataObject;       
    });
  }

  public takeGeolocation() {
    if(this.informeForm.LugarHecho) {
      this.geolocation.getCurrentPosition().then((position) => {
        this.geoLatitude = position.coords.latitude;
        this.geoLongitude = position.coords.longitude;
        this.informeForm.Latitud =  (this.geoLatitude * -1).toString();
        this.informeForm.Longitud =  (this.geoLongitude* -1).toString();
        this.tools.getGeocoder(this.geoLatitude, this.geoLongitude ).then((geoUbicacion) => {
          this.informeForm.DscLugar = geoUbicacion;
        })      
      }).catch((error) => {
        console.log('Error al recuperar posicion en Informes', error);
      });   
    } else {
      this.informeForm.DscLugar="";
    }
  }

  public recuperarCoches() {
    this.ccoche = true;
    var filtro = new CocheFilter();
    filtro.Fecha = this._date;
    filtro.Cod_Linea = this.form.get('CodLin').value;
    filtro.cod_servicio = this.form.get('NumSer').value;
    this.tools.ShowWait(this.cocheService.RecuperarCCochesPorFechaServicioLinea(filtro), (e) => {
      this.coches = e.DataObject;
      if(this.coches.length > 0) {
        this.form.get('NroInterno').setValue(e.DataObject[0].Id);
        this.informeForm.NroInterno = e.DataObject[0].Id;
      }
    });
  }

  public seleccionarFechaNotificacion() {

    if(this.isFechaInfraSelec){
      this.dateFrom = new Date(this.fechaInfraSelec);
      this.dateFrom.setDate(this.dateFrom.getDate() + 1);
    } else {
      this.dateFrom = new Date(this._date);
      this.dateFrom.setDate(this.dateFrom.getDate());
    }

    const differentOptions: CalendarComponentOptions = {
      to:  this.dateTo,
      from: this.dateFrom,
      weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
      monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    };

    let modal = this.modalCtrl.create('DatePickerPage', { differentOptions: differentOptions});
    modal.onDidDismiss(fechaSeleccionada => {
      if(fechaSeleccionada) {
        this._dateNoti = fechaSeleccionada;
        const fechaFormat = moment(fechaSeleccionada).format('DD/MM/YYYY');
        this.form.get('FechaNotificadoString').setValue(fechaFormat);
      }
    });
    modal.present();
  }

  public isNotificado(event) {
    if(!event.checked && this.form.get('FechaNotificadoString').value) {
      this.form.get('FechaNotificadoString').setValue(null);
    }
  }

  completarCoche($event) {
    if($event.coche) {
      this.informeForm.NroInterno = $event.coche.Id;
      this.form.get('NroInterno').setValue($event.coche.Id);
    }
  }

  verOtrosCoches() {
    this.form.get('NroInterno').reset();
    this.ccoche = false;
  }

  GuardarInforme() {   
    if(this.informeForm.DscLugar == ', , , ' || this.informeForm.DscLugar == '' || this.informeForm.DscLugar == undefined || this.informeForm.DscLugar.trim() == '') {
      this.informeForm.DscLugar = this.geoLatitude.toString() + ',' + this.geoLongitude.toString();
    }  

    //Guarda fecha y hora concatenada
    var fechaHora = this.informeForm.FecInfraccionString +' '+ this.informeForm.Hora;
    this.informeForm.FecInfraccionString = fechaHora;

    // this.cleanPage();

    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.infInformesService.createOrUpdate(this.informeForm, ViewMode.Add), resp => {
        if(resp.Status == 'Ok') {
          var msj = "Informe: " + resp.DataObject + " guardado con exito!";
          if(resp.Messages.length > 0)
          {
            msj = "<div>"+ msj + "</div>" + "<br/><span>" + resp.Messages[0] + "</span>";
          }  
          let alert = this.alertCtrl.create({
            title: "Informe Guardado!",
            enableBackdropDismiss:false,
            message: msj,
            buttons: [{text: 'Aceptar',  handler: () => this.cleanPage()}] 
        });       
        alert.present();
        } else {
          this.tools.alert("Cuidado!","El informe no se guardo correctamente");
        } 
      },
      {
        spinner: 'crescent',
        content: 'Guardando Informe...',
      }, e => 
      { 
        this.translateService.get('PERMISSION_ERROR')
        .subscribe((value) => {
          this.permissionErrorString = value;
        });  

        if(e.status == 401 || e.status == 403) {
          this.tools.toastPosition(this.permissionErrorString ,"top")
        }
      });

    } else {
      var inf = this.informeForm;
      this.informeDb.addInforme(inf.FecInfraccionString, inf.Latitud, inf.Longitud, inf.DscLugar, inf.LugarHecho, inf.CodEmp, inf.CodEmpr, inf.CodLin, inf.NumSer, inf.NroInterno, inf.CodMotivo, inf.NotificadoBoolean, inf.FechaNotificadoString, inf.ObsInforme); 
      this.informeDb.getInforme().then((info) => {
        console.log("INFORME DB:", info);
      });
      
      let alert = this.alertCtrl.create({
        title: "Sin conexión!",
        enableBackdropDismiss:false,
        message: "No te preocupes. El informe se guardará cuando se recupere la conexión.",
        buttons: [{text: 'Aceptar',  handler: () => this.cleanPage()}] 
      });       
      alert.present();
      }
    }
 
    cleanPage() {
      this.viewCtrl.dismiss(
        this.navCtrl.getActive().component
       );
    }

    cancel() {
      this.viewCtrl.dismiss();
    }

}



// WEBPACK FOOTER //
// ./src/pages/informe-agregar/informe-agregar.ts