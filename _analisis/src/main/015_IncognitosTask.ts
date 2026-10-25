import { IncognitosDbService } from '../../providers/db/incognitosDb.service';
import { InspPlanillaIncognitosDto } from './../../models/incognitos.model';
import { IncognitosDetalleService } from './../incognitos/incognitosDetalle.service';
import { TranslateService } from '@ngx-translate/core';
import { ViewMode } from './../../models/Base/base.model';
import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TaskBaseService } from '../../providers/service/taskBase.service';

@Injectable()
export class IncognitosTask extends TaskBaseService {

  isRunning: boolean = false;
  permissionErrorAuthString: string;

  constructor(
    public incognitosDetalleService: IncognitosDetalleService,
    public incognitosDb: IncognitosDbService,
    public alertCtrl: AlertController,
    public tools: ToolsProvider,
    public translateService: TranslateService) {
    super();
  }

  Run():void {

    if(!this.isRunning) {
      this.incognitosDb.getIncognitos().then((info) => {
        console.log("INCOGNITOS DB:", info);        
       
        if(info!=null){
          var data=info;
          let currentId = data.id;
          data.id = 0;

          data.InspPlanillaIncognitosDetalle = JSON.parse(info.InspPlanillaIncognitosDetalle);
          this.isRunning=true;
          // var  inf : InspPlanillaIncognitosDto = new InspPlanillaIncognitosDto(data);

          this.incognitosDetalleService.createOrUpdate(data, ViewMode.Add)
          
          .subscribe( resp => {
            if(resp.Status == 'Ok') {
              this.incognitosDb.deleteIncognitos(currentId);
              var msj = "Planilla guardada con exito!";
              if(resp.Messages.length>0) {
                msj = "<div>"+ msj + "</div>" + "<br/><span style='font-style: italic;'>" + resp.Messages[0] + "</span>";
              }  
              let alert = this.alertCtrl.create({
                title: "Guardado!",
                enableBackdropDismiss:false,
                message: msj,
                buttons: [{text: 'Aceptar' }] 
            });  
                
            alert.present();
            this.isRunning=false;
            this.ContinuarProximoInforme();
            }
          },(e)=> {
            this.translateService.get('PERMISSION_ERROR_AUTHORIZATION')
            .subscribe((value) => {
              this.permissionErrorAuthString = value;
            });  
            if(e.status == 401 || e.status == 403) {
              this.tools.toastPosition(this.permissionErrorAuthString ,"top")
            } else {
              // this.infInformesService.EnviarInformeJson(inf).subscribe( r => {
              //   this.informeDb.deleteInforme(data.id);
              //   this.ContinuarProximoInforme();
              // });
            }
            this.isRunning = false; 
          });
        }
      });
    }
  }

  ContinuarProximoInforme() {
    this.incognitosDb.getIncognitos().then((info) => {
      if(info!=null){
        this.Run();
      }
    });
  }
}


// WEBPACK FOOTER //
// ./src/providers/Task/IncognitosTask.ts