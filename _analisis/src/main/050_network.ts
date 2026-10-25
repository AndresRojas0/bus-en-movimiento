import { IncognitosTask } from './../Task/IncognitosTask';
import { InformeTask } from '../../providers/Task/InformeTask';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { ToolsProvider } from '../../shared/page/tools';
import { ToastController, App } from 'ionic-angular';

@Injectable()
export class NetworkProvider {

  variable: boolean;
  conectado: boolean = true;
  // taskOnConnect: TaskBaseService[]=[]

  constructor(public http: HttpClient,
              private network: Network,
              public tools: ToolsProvider,
              public toast: ToastController,
              private informeTask: InformeTask,
              private incognitosTask: IncognitosTask,
              public app: App) {
  }


  // public AddTaskOnConnect(task: InformeTask):void{
  //   this.taskOnConnect.push(task);
  // }

  public checkNetwork() : boolean {
    if (this.tools.isBrowser()) return true;
    if (this.network.type != "none") {
      return true;
    }
    else {
      return false;
    }
  }

  public suscribir() {
    if (this.tools.isBrowser()) return;
      this.network.onDisconnect().subscribe(() => {
        if(this.conectado){
          console.log('network disconnected!');
          this.tools.toast("Sin Internet. Las busquedas se guardaran en 'Últimas Consultas'");
          this.conectado = false;
        }
      });

      this.network.onConnect().subscribe(() => {
        if(!this.conectado){

          this.informeTask.Run();
          this.incognitosTask.Run();

          console.log('network connected!');
          this.tools.toast("Red Conectada!");
          // this.taskOnConnect.forEach(e => {
          //   e.Run();
          // });
          this.conectado = true;
        }

      });
  }

}
 


// WEBPACK FOOTER //
// ./src/providers/network/network.ts