import { ToolsProvider } from './../../shared/page/tools';
import { GeoProvider } from './../../providers/geolocation/geo';
import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  tab1 = 'SabanaBanderaPage';
  tab2 = 'BanderaConductorPage';
  tab3 = 'SectorPage';

  constructor(public navCtrl: NavController,
              public geo: GeoProvider,
              public tools: ToolsProvider) {

    this.geo.navCtrl = this.navCtrl;
  }

}



// WEBPACK FOOTER //
// ./src/pages/home/home.ts