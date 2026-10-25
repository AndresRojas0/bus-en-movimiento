import { HomePage } from './../home/home';
import { IncognitosDbService } from '../../providers/db/incognitosDb.service';
import { CocheDto } from './../../models/coche.model';
import { ViewMode } from './../../models/Base/base.model';
import { NetworkProvider } from './../../providers/network/network';
import { InspPlanillaIncognitosDto, InspPlanillaIncognitosDetalle, IncognitosFilter } from './../../models/incognitos.model';
import { ToolsProvider } from './../../shared/page/tools';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { IncognitosService } from './../../providers/incognitos/incognitos.service';
import { IncognitosDetalleService } from './../../providers/incognitos/incognitosDetalle.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CalendarComponentOptions } from 'ion2-calendar';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-incognitos',
  templateUrl: 'incognitos.html',
})
export class IncognitosPage {

  public form: FormGroup;
  public entity: InspPlanillaIncognitosDto;
  items: FormArray;
  subs: Subscription[]=[];
  toDay = new Date();
  _date: string;
  permissionErrorString: string;
  cu: any;
  _time: string;
  horaAscensoValidar: string;
  fechaModificada: Date;
  dateChange:boolean = false;
  formBuilding:boolean=true;
  currentCoche: CocheDto;
 
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private formBuilder: FormBuilder,
    public incognitosService: IncognitosService,
    public incognitosDetalleService: IncognitosDetalleService,
    public tools: ToolsProvider,
    public modalCtrl: ModalController,
    public networkProvider: NetworkProvider,
    public translateService: TranslateService,
    public alertCtrl: AlertController,
    public incognitosDbService: IncognitosDbService
    ) {
      this._time = moment().format("HH:mm");
    }

  ngOnDestroy() {
    this.subs.forEach(e=> e.unsubscribe());
  }
  ngOnInit() { 
    this.buildForm();
    if(!this.networkProvider.checkNetwork()) this.tools.toast("No hay conexión a Internet");
    this.cu =  JSON.parse(localStorage.getItem('currentUser'));   
    if(this.cu.sucursalId == null){
      this.tools.alert("¡Atención!", "Notifique a Sistemas que no existe unidad de negocio asociada a su usuario.")
    }     
  }


  buildForm() {
    this.formBuilding=true;
    this.entity = new  InspPlanillaIncognitosDto();
    this.entity.FechaHora = new Date();
    this.entity.FechaString = moment(this.entity.FechaHora).format('DD/MM/YYYY');
    this.entity.HoraAscenso = this._time;
    this.entity.InspPlanillaIncognitosDetalle = [];

    const value = JSON.parse(localStorage.getItem('formValue'));
    this.form = this.formBuilder.group({

      FechaString:                   [value && value.FechaString || this.entity.FechaString, Validators.required],
      HoraAscenso:                   [value && value.HoraAscenso || this.entity.HoraAscenso, Validators.required],
      HoraDescenso:                  [value && value.HoraDescenso || this.entity.HoraDescenso, null],
      CocheId:                       [value && value.CocheId || this.entity.CocheId, Validators.required],
      Tarifa:                        [value && value.Tarifa || this.entity.Tarifa, [Validators.pattern(/^[1-9]\d{0,20}(?:\.\d{1,2})?\s*$/), Validators.required]],
      CocheFicha:                    [value && value.CocheFicha || this.entity.CocheFicha, Validators.required],
      CocheInterno:                  [value && value.CocheInterno || this.entity.CocheInterno, Validators.required],
      InspPlanillaIncognitosDetalle: this.formBuilder.array([])
    });

    if (value && value.CocheId) {
      this.currentCoche = new CocheDto();
      this.currentCoche.Ficha = value.CocheFicha; 
    }
    else{
      this.currentCoche = new CocheDto();
    }

    if(value && value.InspPlanillaIncognitosDetalle) {
      let detalles: InspPlanillaIncognitosDetalle[] = [];
      value.InspPlanillaIncognitosDetalle.forEach(inc => {
        let item :InspPlanillaIncognitosDetalle = new InspPlanillaIncognitosDetalle();
        item.PreguntaIncognitoId = inc.PreguntaIncognitoId;
        item.PreguntaIncognitoDescripcion = inc.PreguntaIncognitoDescripcion;
        item.MostrarObservacion = inc.MostrarObservacion;   
        item.Orden = inc.Orden;
        item.RespuestaRequerida = inc.RespuestaRequerida;
        let posiblesResp = inc.PosiblesRespuestas.filter(e=> e.Orden != null).sort((a,b) => {return a.Orden - b.Orden});
        inc.PosiblesRespuestas.filter(e=> e.Orden == null).sort().forEach(item => {
          posiblesResp.push(item);
        });

        item.PosiblesRespuestas = posiblesResp;
        item.RespuestaIncognitoId = inc.RespuestaIncognitoId;
        detalles.push(item);
      });

      detalles = detalles.sort((a,b) => {return a.Orden - b.Orden});
      detalles.forEach(e => {
        this.items = this.form.get('InspPlanillaIncognitosDetalle') as FormArray;
        this.items.push(this.createItem(e));
        this.entity.InspPlanillaIncognitosDetalle.push(e);
      });
      setTimeout(()=> this.formBuilding=false, 1000);
    } else {
      var filtro = new IncognitosFilter();
      filtro.Anulado = 2;
      this.tools.ShowWait(this.incognitosService.GetPagedList(filtro),(e) => { 
        let detalles: InspPlanillaIncognitosDetalle[] = [];
        e.DataObject.Items.forEach(inc => {
          let item :InspPlanillaIncognitosDetalle = new InspPlanillaIncognitosDetalle();
          item.PreguntaIncognitoId = inc.Id;
          item.PreguntaIncognitoDescripcion = inc.Descripcion;
          item.MostrarObservacion = inc.MostrarObservacion;   
          item.Orden = inc.Orden;
          item.RespuestaRequerida = inc.RespuestaRequerida;

          let posiblesResp = inc.InspPreguntasIncognitosRespuestas.filter(e=> e.Orden != null).sort((a,b) => {return a.Orden - b.Orden});
          inc.InspPreguntasIncognitosRespuestas.filter(e=> e.Orden == null).sort().forEach(item => {
            posiblesResp.push(item);
          });

          item.PosiblesRespuestas = posiblesResp;
          item.RespuestaIncognitoId = null;
          detalles.push(item);
        });
        
        let _detallesTemp = detalles.filter(e=> e.Orden!=null).sort((a,b) => {return a.Orden - b.Orden});
        detalles.filter(e=> e.Orden == null).sort().forEach(e=> _detallesTemp.push(e));
        
        detalles = _detallesTemp;

        detalles.forEach(e => {
          this.items = this.form.get('InspPlanillaIncognitosDetalle') as FormArray;
          this.items.push(this.createItem(e));
          this.entity.InspPlanillaIncognitosDetalle.push(e);
        });
        setTimeout(()=> this.formBuilding=false, 1000);
        
      });
    }
    
    this.subs.push(
      this.form.valueChanges.subscribe(values => {
        if(!this.formBuilding){
          const form = values as InspPlanillaIncognitosDto;
          localStorage.setItem('formValue', JSON.stringify(this.form.value));
          form.isValid = this.form.valid;
          console.log(form);
        }       
      })
    );

  }

  createItem(item: InspPlanillaIncognitosDetalle): FormGroup {
    return this.formBuilder.group({
      Orden:                        [item.Orden, null],
      RespuestaRequerida:           [item.RespuestaRequerida, null],
      RespuestaIncognitoId:         [item.RespuestaIncognitoId, item.RespuestaRequerida? Validators.required : null ],
      PreguntaIncognitoDescripcion: [item.PreguntaIncognitoDescripcion, null],
      PreguntaIncognitoId:          [item.PreguntaIncognitoId, null],
      PosiblesRespuestas:           [item.PosiblesRespuestas, null],
      MostrarObservacion:           [item.MostrarObservacion, null],
      observacion:                  [item.observacion, null]
    });
  }

  setMyStyles(isRequired: boolean) {
    let styles = {
      'border-left': isRequired ? '3px solid #CD6155' : '1px solid #2874A6',
    };
    return styles;
  }

  public seleccionarFecha() {
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
        this.form.get('FechaString').setValue(fechaFormat);
        this.dateChange = true;
        // this.entity.FechaHora = fechaSeleccionada;
        debugger;
        this.entity.FechaString = fechaSeleccionada;

      }
    });
    modal.present();
  }

  completarCoche($event) {
    if($event.coche && !this.formBuilding) {
      this.entity.CocheFicha = $event.coche.Ficha;
      this.entity.CocheInterno = $event.coche.Interno;
      this.entity.CocheId = $event.coche.Id;
      this.form.get('CocheFicha').setValue($event.coche.Ficha);
      this.form.get('CocheId').setValue($event.coche.Id);
      this.form.get('CocheInterno').setValue($event.coche.Interno);
    }
  }

  GuardarIncognitos() {
    
    _.assign(this.entity, this.form.value);

    this.entity.SucursalId = this.cu.sucursalId;
    this.formatDate();

    if(this.networkProvider.checkNetwork()) {
      //Guarda en Base de Datos
      this.confirmar("¿Desea guardar y salir?", "").then( confirm => {
        if(confirm){
          if (!confirm) return;
          this.guardarBD();
        }
      });

    } else {
      this.confirmar("Usted esta sin conexión", "¿Desea guardar y salir?").then( confirm => {
        if(confirm){
          if (!confirm) return;
          this.guardarCache();
        }
      });
    }
  }

  guardarCache(){
    var inf = this.entity;
    // let fecha: string = moment(this.entity.Fecha).format('YYYY-MM-DD');
    this.incognitosDbService.addIncognitos(inf.Fecha.toISOString(), inf.SucursalId ,inf.HoraAscenso,inf.HoraDescenso,inf.CocheId,inf.CocheFicha,inf.CocheInterno, inf.Tarifa, JSON.stringify(inf.InspPlanillaIncognitosDetalle));
    this.incognitosDbService.getIncognitos().then((info) => {
      console.log("INCOGNITOS DB:", info);
    });
    
    let alert = this.alertCtrl.create({
      title: "Sin conexión!",
      enableBackdropDismiss:false,
      message: "No te preocupes. La información se guardará cuando se recupere la conexión.",
      buttons: [{text: 'Aceptar',  handler: () => this.volver()}] 
    });       
    alert.present();
  }

  guardarBD(){
    this.tools.ShowWait(this.incognitosDetalleService.createOrUpdate(this.entity, ViewMode.Add), resp => {
      if(resp.Status == 'Ok') {
        //Mostrar Aleert y retorna a sabanas
        let alert = this.alertCtrl.create({
          title: "Guardada!",
          enableBackdropDismiss:false,
          message: "La planilla fue registrada correctamente.",
          buttons: [{text: 'Aceptar',  handler: () => this.volver()}] 
      });       
      alert.present();

      } else {
        this.tools.alert("Cuidado!","No se guardo correctamente");
      } 
    },
    {
      spinner: 'crescent',
      content: 'Guardando...',
    }, e => 
    { 
      this.tools.toastErrorsHttp(e);
    });

  }

  volver() {
    localStorage.removeItem('formValue');
    this.navCtrl.push("HomePage");
  }

    public confirmar(title: string, message: string) : Promise<boolean> {
      return new Promise((resolve) => {
          const confirm = this.alertCtrl.create({
              title: title,
              message: message,
              buttons: [
              { text: 'Cancelar', handler: () => { resolve(false); } },
              { text: 'Aceptar', handler: () => { resolve(true); } }
              ]
          });

          confirm.present();
      });
  }

    volverAIncognitos(): boolean | void {
      localStorage.removeItem('formValue');
      this.subs.forEach(e=> e.unsubscribe());
      this.form.reset(false);
      this.form = null;
      this.buildForm();
    }

    formatDate(){

      //Moment(new Date(date)).format('MM/DD/YYYY')
      this.entity.FechaHora = moment(this.entity.FechaString, "DD/MM/YYYY").toDate();

      this.entity.Fecha = this.entity.FechaHora;
      let armandoHoraAscenso: string = "0001-01-01" + ' ' + this.entity.HoraAscenso;
      let toDateHoraAscenso :Date = moment(armandoHoraAscenso).toDate();
      this.horaAscensoValidar = toDateHoraAscenso.getHours().toString();

      let minutosAscenso: string =  toDateHoraAscenso.getMinutes().toString();
      if (toDateHoraAscenso.getHours().toString().length < 2) this.horaAscensoValidar = '0' + this.horaAscensoValidar;
      if (toDateHoraAscenso.getMinutes().toString().length < 2) minutosAscenso = '0' + minutosAscenso;

      //Hora Ascenso
      this.entity.HoraAscenso =  moment(this.entity.FechaHora).format('YYYY-MM-DD') + ' ' + this.horaAscensoValidar + ':' + minutosAscenso;

      //Hora Descenso
      if(this.entity.HoraDescenso == null) {
        this.entity.HoraDescenso = this._time;
        this.entity.HoraDescenso =  moment(this.entity.FechaHora).format('YYYY-MM-DD') + ' ' + this.entity.HoraDescenso;
      } else {
        let armandoHoraDescenso: string = "0001-01-01" + ' ' + this.entity.HoraDescenso;
        let toDateHoraDescenso :Date = moment(armandoHoraDescenso).toDate();  
        let horaDescenso: string = toDateHoraDescenso.getHours().toString();
        let minutosDescenso: string =  toDateHoraDescenso.getMinutes().toString();
        if (toDateHoraDescenso.getHours().toString().length < 2) horaDescenso = '0' + horaDescenso;
        if (toDateHoraDescenso.getMinutes().toString().length < 2) minutosDescenso = '0' + minutosDescenso;

        this.entity.HoraDescenso =  moment(this.entity.FechaHora).format('YYYY-MM-DD') + ' ' + horaDescenso + ':' + minutosDescenso;

        if(horaDescenso) {
          if(horaDescenso < this.horaAscensoValidar) {
            this.fechaModificada = new Date(this.entity.HoraDescenso);
            this.fechaModificada.setDate(this.fechaModificada.getDate() + 1);
            this.entity.HoraDescenso = moment(this.fechaModificada).format('YYYY-MM-DD') + ' ' + horaDescenso + ':' + minutosDescenso ;
          }
        }
      }
    }

  }





// WEBPACK FOOTER //
// ./src/pages/incognitos/incognitos.ts