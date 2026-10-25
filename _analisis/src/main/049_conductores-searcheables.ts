import { ToolsProvider } from './../../shared/page/tools';
import { NetworkProvider } from './../../providers/network/network';
import { ItemGenericDto } from './../../models/Base/base.model';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { HServiciosService } from '../../providers/servicio-conductor/servicio.service';
import { HServiciosFilter, ConductoresLegajoDto } from './../../models/hServicios.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { Events } from 'ionic-angular';

@Component({
  selector: 'conductores-searcheables',
  templateUrl: 'conductores-searcheables.html'
})
export class ConductoresSearcheablesComponent {

  //conductores
  _conductor_searcheable: ItemGenericDto<string>;
  form: FormGroup;
  conductorControl: FormControl;
  conductores_searcheables: ConductoresLegajoDto[];
  conductores_searcheablesSubscription: Subscription;

  @Input() fechaInfraccion: string;
  @Output() conductorSeleccionado = new EventEmitter;
  //@Output() public conductorSeleccionado:EventEmitter<string> = new EventEmitter<string>();

  constructor(   
    public hserviciosService: HServiciosService,
    private formBuilder: FormBuilder,
    public networkProvider: NetworkProvider,
    private events: Events,
    public tools: ToolsProvider) { 
      this.suscripcion_fecha_modificada();
      this.suscripcion_clean_conductor();
    }

  ngOnInit(){
    this.conductorControl = this.formBuilder.control(this.conductores_searcheables);
    this.form = this.formBuilder.group({
      conductor_searcheable: this.conductorControl
    });

    this.form.get('conductor_searcheable').valueChanges.subscribe((v) => {
      this._conductor_searcheable = v as ItemGenericDto<string>;
      if(this._conductor_searcheable != null){
        console.log("_conductor_searcheable", this._conductor_searcheable);       
        this.conductorSeleccionado.emit({conductor: this._conductor_searcheable});       
      }
    })
  }

  suscripcion_fecha_modificada(){
    this.events.subscribe('informe:fecha_seleccionada', (fecha) => {
      this.form.get('conductor_searcheable').setValue("");
      this.conductorControl.reset();
      this.fechaInfraccion = fecha;
    });
  }

  suscripcion_clean_conductor(){
    this.events.subscribe('informe:clean_conductor', () => {
      this.conductorControl.reset();    
      this.form.get('conductor_searcheable').reset();
     
    });
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

}



// WEBPACK FOOTER //
// ./src/components/conductores-searcheables/conductores-searcheables.ts