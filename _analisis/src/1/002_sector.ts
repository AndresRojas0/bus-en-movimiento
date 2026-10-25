import { TipoLineaDto } from './../../models/tipoLinea.model';
import { SectorDto } from './../../models/sector.model';
import { SectorService } from './../../providers/sector/sector.service';
import { DbService } from './../../providers/db/db.service';
import { HDesignarService } from './../../providers/hDesignar/hDesignar.service';
import { HDesignarFilter, HDesignarDto } from './../../models/hDesignar.model';
import { CoordenadasFilter, CoordenadasDto } from './../../models/coordenadas.model';
import { CoordenadasService } from './../../providers/coordenada/coordenadas.service';
import { TipoLineaService } from './../../providers/tipoLinea/tipoLinea.service';
import { ToolsProvider } from './../../shared/page/tools';
import { NetworkProvider } from './../../providers/network/network';
import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { CalendarComponentOptions } from 'ion2-calendar';

@IonicPage()
@Component({
  selector: 'page-sector',
  templateUrl: 'sector.html',
})
export class SectorPage {

  toDay = new Date();
  dateTo: Date = new Date();

  sentidos: SectorDto[];
  tipoLineas: TipoLineaDto[];
  sectores_searcheables: CoordenadasDto[];
  horariosPorSector: HDesignarDto[];

  _sector: string;
  _date: string; 
  _sectores_searcheable: CoordenadasDto;
  _sentido: number;
  _tipoLinea: number;

  sectores_searcheablesSubscription: Subscription;

  form: FormGroup;
  sectorControl: FormControl;

  marginTop: any = '50px';
  isLandscape: boolean;

  get sentido(): number {
    return this._sentido;
  }

  @Input()
  set sentido(sentido: number) {
      this._sentido = sentido;
      this._tipoLinea = null;
      this.buscarTipoLineas();
  }

  get tipoLinea(): number {
    return this._tipoLinea;
  }

  @Input()
  set tipoLinea(tipoLinea: number) {
      this._tipoLinea = tipoLinea;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public networkProvider: NetworkProvider,
    public tools: ToolsProvider,
    public tipoLineaService: TipoLineaService,
    public coordenadasService: CoordenadasService,
    private formBuilder: FormBuilder,
    private screenOrientation: ScreenOrientation,
    private hDesignarService: HDesignarService,
    private sectorService: SectorService,
    public dbService: DbService) {

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

    this.sectorControl = this.formBuilder.control(this.sectores_searcheables);
    this.form = this.formBuilder.group({
      sector_searcheable: this.sectorControl 
    });

    this.form.get('sector_searcheable').valueChanges.subscribe((v) => {
      this._sectores_searcheable = v as CoordenadasDto;
      if(this._sectores_searcheable != null){
        this._sentido = null;
        this._tipoLinea = null;
        this.completarSentido();
      }
    })
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.cleanFields();
      var toDay=new Date();
      this._date = toDay.getFullYear().toString() +'-'+ (toDay.getMonth()+1).toString() + '-' +  toDay.getDate().toString();
      refresher.complete();
    }, 500);
  }

  cleanFields(): void {
    this.sectorControl.reset();
    this._sentido = null;
    this.sentidos = [];
    this._tipoLinea = null;
    this.tipoLineas = [];
  };

  estilosLandscape() {
    this.marginTop = this.isLandscape ?  '10px' : '50px';
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

    });
    modal.present();
  }

  busquedaPorSector(event: {
    component: IonicSelectableComponent,
    text: string,
    value: string,
    }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.sectores_searcheablesSubscription) {
      this.sectores_searcheablesSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.sectores_searcheablesSubscription) {
        this.sectores_searcheablesSubscription.unsubscribe();
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

    var filtro = new CoordenadasFilter();
    filtro.Fecha = this._date;
    filtro.Abreviacion = text;

    if(this.networkProvider.checkNetwork()) {
    this.coordenadasService.RecuperarCoordenadasPorFecha(filtro).subscribe(sectores_searcheables => {        
      event.component.items = sectores_searcheables.DataObject    
      event.component.endSearch();
    })
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

  validarRequeridos(): boolean {
    if(!this._sectores_searcheable || !this._sentido || !this._tipoLinea) {
      this.tools.alert('Falta Información!', 'Complete todos los campos')
      return true
    }
  }

  completarSentido() {
    var filtro = new HDesignarFilter();
    filtro.fecha = this._date;
    filtro.sector = this._sectores_searcheable.Id
    if(this.networkProvider.checkNetwork()) {
    this.tools.ShowWait(this.sectorService.RecuperarSentidoPorSector(filtro), e =>  {      
      this.sentidos = e.DataObject
    }, 
    {
      spinner: 'crescent',
      content: 'Buscando Sentidos',
    }); 
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }
  
  buscarTipoLineas() {
    var filtro = new HDesignarFilter();
    filtro.fecha = this._date;
    filtro.sector = this._sectores_searcheable.Id;
    filtro.sentido = this._sentido;
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait( this.tipoLineaService.RecuperarTipoLineaPorSector(filtro), e =>  {      
        this.tipoLineas = e.DataObject;
      }, 
      {
        spinner: 'crescent',
        content: 'Buscando Tipo de Linea',
      }); 
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  } 

  Buscar() {

    var result = this.validarRequeridos();
    if(result) return;
    var filtro = new HDesignarFilter();
    filtro.fecha = this._date;
    filtro.sector = this._sectores_searcheable.Id;
    filtro.sentido = this._sentido;
    filtro.tipoLinea = this._tipoLinea;     

    let sentidoDescripcion = this.sentidos.find(s => s.Id == this._sentido).Descripcion;
    let tipoLineaDescripcion = this.tipoLineas.find(t => t.Id == this._tipoLinea).Nombre;
 
    if(this.networkProvider.checkNetwork()) {
      this.tools.ShowWait(this.hDesignarService.RecuperarSabanaPorSector(filtro), e => {
        this.horariosPorSector = e.DataObject;
        this.navCtrl.push("ModalSectorHorarioPage", { horariosPorSector: this.horariosPorSector, sectorSeleccionado: JSON.stringify(this._sectores_searcheable)});
        if(this.tools.isBrowser()) return;       
          this.dbService.addSector(this._date, JSON.stringify(this._sectores_searcheable) , sentidoDescripcion, tipoLineaDescripcion, JSON.stringify(this.horariosPorSector), this.tools.currentTime());         
      });
    } else {
      this.tools.toast("No hay conexión a Internet");
    }

  }

}



// WEBPACK FOOTER //
// ./src/pages/sector/sector.ts