import { IonicSelectableComponent } from 'ionic-selectable';
import { CocheService } from './../../providers/coche/coche.service';
import { ToolsProvider } from './../../shared/page/tools';
import { NetworkProvider } from './../../providers/network/network';
import { Input, Output, EventEmitter, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CocheDto, CocheFilter } from './../../models/coche.model';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ItemGenericDto } from './../../models/Base/base.model';
import { Events } from 'ionic-angular';


@Component({
  selector: 'coches-searcheables',
  templateUrl: 'coches-searcheables.html'
})
export class CochesSearcheablesComponent {

  _coches_searcheable: ItemGenericDto<string>;
  form: FormGroup;
  cocheControl: FormControl;
  coches_searcheables: CocheDto[];
  coches_searcheablesSubscription: Subscription;

  public coche: string;
  @Input() currentItem:CocheDto;


  @Input() fecha: string;
  @Output() cocheSeleccionado = new EventEmitter;
  //@Output() public conductorSeleccionado:EventEmitter<string> = new EventEmitter<string>();

  constructor(   
    private formBuilder: FormBuilder,
    public networkProvider: NetworkProvider,
    public tools: ToolsProvider,
    public cocheService: CocheService,
    private events: Events) { 
      this.suscripcion_fecha_modificada();
    }

  ngOnInit(){
    this.cocheControl = this.formBuilder.control(this.coches_searcheables);
    this.form = this.formBuilder.group({
      coche_searcheable: this.cocheControl
    });

    this.form.get('coche_searcheable').valueChanges.subscribe((v) => {
      this._coches_searcheable = v as ItemGenericDto<string>;
      if(this._coches_searcheable != null) {
        this.cocheSeleccionado.emit({coche: this._coches_searcheable});       
      }
    })
  }

  suscripcion_fecha_modificada(){
    this.events.subscribe('informe:fecha_seleccionada', (fecha) => {
      console.log('fecha modificada', fecha);
      this.cocheControl.reset();
    });
  }

  busquedaPorCoches(event: {
    component: IonicSelectableComponent,
    text: string,
    value: string,
    }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.coches_searcheablesSubscription) {
      this.coches_searcheablesSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.coches_searcheablesSubscription) {
        this.coches_searcheablesSubscription.unsubscribe();
      }

      event.component.items = [];
      event.component.endSearch();
      return;
    }

    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    } else if (event.text.length < 4) {
      return;
    }

    var filtro = new CocheFilter();
    filtro.FilterText = text; 

    if(this.networkProvider.checkNetwork()) {
    this.cocheService.RecuperarCCoches(filtro).subscribe(coches_searcheables => {        
      event.component.items = coches_searcheables.DataObject
      event.component.endSearch();
    })
    } else {
      this.tools.toast("No hay conexión a Internet");
    }
  }

}



// WEBPACK FOOTER //
// ./src/components/coches-searcheables/coches-searcheables.ts