import { TranslateService } from '@ngx-translate/core';
import { InformeForm } from './../../models/informe-form.model';
import { InformeDbService } from './../db/informeDb.service';
import { ViewMode } from './../../models/Base/base.model';
import { InfInformesService } from './../infInformes/infInformes.service';
import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TaskBaseService } from '../../providers/service/taskBase.service';

@Injectable()
export class InformeTask extends TaskBaseService {

  isRunning: boolean = false;
  permissionErrorAuthString: string;

  constructor(
    public infInformesService: InfInformesService,
    public informeDb: InformeDbService,
    public alertCtrl: AlertController,
    public tools: ToolsProvider,
    public translateService: TranslateService) {
    super();
  }

  Run():void {

    if(!this.isRunning) {
      this.informeDb.getInforme().then((info) => {
        console.log("INFORME DB:", info);        
        var data=info;
        if(info!=null){
          this.isRunning=true;
          var  inf : InformeForm = new InformeForm(data);
          this.infInformesService.createOrUpdate(inf, ViewMode.Add)
          
          .subscribe( resp => {
            if(resp.Status == 'Ok') {
              this.informeDb.deleteInforme(data.id);
              var msj = "Informe: " + resp.DataObject + " guardado con exito!";
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
              this.infInformesService.EnviarInformeJson(inf).subscribe( r => {
                this.informeDb.deleteInforme(data.id);
                this.ContinuarProximoInforme();
              });
            }
            this.isRunning = false; 
          });
        }
      });
    }
  }

  ContinuarProximoInforme() {
    this.informeDb.getInforme().then((info) => {
      if(info!=null){
        this.Run();
      }
    });
  }
}


// WEBPACK FOOTER //
// ./src/providers/Task/InformeTask.ts