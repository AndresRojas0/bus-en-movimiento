
import { ToolsProvider } from '../../shared/page/tools';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TaskBaseService } from '../service/taskBase.service';
import { TimeForCheckUpdateVersion } from '../../models/parameter.model';
import { HockeyApp } from 'ionic-hockeyapp';

@Injectable()
export class CheckHockeyAppUpdatesTask extends TaskBaseService {

  intervalTrack: number = 0;
  public parametroValue: number;

  constructor(
    public alertCtrl: AlertController,
    public tools: ToolsProvider,
    public hockeyApp: HockeyApp
    ) {
    super();
    }

  runTaskCheckUpdateVersion() {
    this.tools.parametrosNumerico(TimeForCheckUpdateVersion).then(e => {   
      this.parametroValue = e;
      this.Run();
    });
  }

  Run(): void {

    if(this.tools.isBrowser()) return;
    if(this.intervalTrack > 0) return;

    this.intervalTrack = setInterval(() => {
      this.hockeyApp.checkHockeyAppUpdates();
    }, this.parametroValue);
  }
}


// WEBPACK FOOTER //
// ./src/providers/Task/checkHockeyAppUpdatesTask.ts