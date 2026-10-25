import { TranslateService } from '@ngx-translate/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { DesvioDto } from './../../models/desvio.model';
import { ViewMode } from './../../models/Base/base.model';
import { DesvioService } from './../../providers/desvio/desvio.service';
import { NetworkProvider } from './../../providers/network/network';
import { ToolsProvider } from './../../shared/page/tools';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';
import * as moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-nuevo-desvio',
  templateUrl: 'nuevo-desvio.html',
})
export class NuevoDesvioPage {

  toDay = new Date();
  dateTo: Date = new Date();
  _date: string;
  _time: string;
  isReadyToSave: boolean;
  public formDesvio: FormGroup;  
  desvioDto: DesvioDto;

  permissionErrorString: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public tools: ToolsProvider,
    public alertCtrl: AlertController,
    public networkProvider: NetworkProvider,
    private formBuilder: FormBuilder,
    public desvioService: DesvioService,
    public modalCtrl: ModalController,
    public translateService: TranslateService) {

      this.dateTo.setDate(this.dateTo.getDate() + 3);  
      this._date = this.toDay.getFullYear().toString() +'-'+ (this.toDay.getMonth()+1).toString() + '-' +  this.toDay.getDate().toString();
      this._time = this.toDay.toLocaleTimeString();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NuevoDesvioPage');
  }

  ngOnInit() {

    this.desvioDto = new DesvioDto();    
    this.desvioDto.FechaString = this._date;
    this.desvioDto.Hora = this._time;

    this.formDesvio = this.formBuilder.group({
      FechaString:   [this.desvioDto.FechaString, null],
      Hora:          [this.desvioDto.Hora, null],
      Descripcion:   [this.desvioDto.Descripcion, [Validators.required, Validators.maxLength(500)] ],
    });

    this.formDesvio.valueChanges.subscribe((v) => {
      console.log(this.desvioDto);
      this.verifyIsReadyToSave();
    });
  }

  verifyIsReadyToSave() {
    this.isReadyToSave = this.formValido();
  }

  formValido() {
    return this.formDesvio.valid;
  }

  public seleccionarFechaDesvios() {
    const differentOptions: CalendarComponentOptions = {
      from: new Date(2000, 0, 1),
      to:  this.toDay,
      weekdays: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'],
      monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    
    };
    let modal = this.modalCtrl.create('DatePickerPage', { differentOptions: differentOptions});
    modal.onDidDismiss(fechaSeleccionada => {
      if(fechaSeleccionada) {
        const fechaFormat = moment(fechaSeleccionada).format('DD/MM/YYYY');
        this.formDesvio.get('FechaString').setValue(fechaFormat);
        this._date = fechaSeleccionada;
      }
    });
    modal.present();
  }

  volverADesvios(){
    this.viewCtrl.dismiss(true);
  }

  concatenarFechaHora(){
    //Guarda fecha y hora concatenada
    var fechaHora = this.desvioDto.FechaString +' '+ this.desvioDto.Hora;
    this.desvioDto.FechaString = fechaHora;
  }

  alerta(titulo: string, msj: string){
    let alert = this.alertCtrl.create({
      title: titulo,
      message: msj,
      enableBackdropDismiss:false,
      buttons: [{text: 'Aceptar',  handler: () => this.volverADesvios()}] 
    });       
    alert.present();
  }

  createDesvio() {
    this.concatenarFechaHora();   
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.desvioService.ObtenerEmpleadoInspector(), e => {
        this.desvioDto.SucursalId = e.DataObject.codSucursal;
        if(e.Status == 'Ok') this.guardarDesvio();    
      },
      {
        spinner: 'crescent',
        content: 'Cargando...',
      }, Error => {
        this.cleanPage();
        this.alerta("Atención","Notifique a Sistemas que no existe el empleado asociado a su usuario.")
      }
      );
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  guardarDesvio() {
    this.tools.ShowWait(this.desvioService.createOrUpdate(this.desvioDto, ViewMode.Add), resp => {
      this.cleanPage();
      if(resp.Status == 'Ok') {
        this.alerta("El desvío fue cargado satisfactoriamente.", "");
      } else {
        this.tools.alert("Cuidado!","El desvío no se guardo correctamente");
      } 
    },
    {
      spinner: 'crescent',
      content: 'Guardando Desvío...',
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
  }

  cleanPage() {
    this.formDesvio.reset();
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}



// WEBPACK FOOTER //
// ./src/pages/nuevo-desvio/nuevo-desvio.ts