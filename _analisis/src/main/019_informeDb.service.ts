import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';


@Injectable()
export class InformeDbService {

  private database: SQLiteObject;
  sqlstorage: SQLite;

  constructor(
    private platform: Platform,
    private sqlite:SQLite,
    public tools: ToolsProvider
    ) {

    if (this.tools.isBrowser()) return;
    this.platform.ready().then(() => {
      this.sqlite.
      create({
        name: 'inspectores.db',
        location: 'default'
      })
      .then((db:SQLiteObject)=>{
        this.database = db;
        this.createTableInf();
        // this.database.executeSql("DROP TABLE informeInfraccion", []);
        // this.createTables().then(()=>{
        //   //communicate we are ready!
        //   this.dbReady.next(true);
        // });
      })
    });
  }

  createTableInf() {
    try {
      return this.database.executeSql(
        `CREATE TABLE IF NOT EXISTS informeInfraccion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          FecInfraccionString TEXT,
          Latitud REAL,
          Longitud REAL,
          DscLugar TEXT,
          LugarHecho BOOLEAN,
          CodEmp TEXT,
          CodEmpr INTEGER,
          CodLin TEXT,
          NumSer TEXT,
          NroInterno TEXT,
          CodMotivo TEXT,
          NotificadoBoolean BOOLEAN,
          FechaNotificadoString TEXT,
          ObsInforme TEXT);`, [])    
    }
    catch (err) {
      return console.log("error detected creating tables informeInfraccion", err);
    }
  }

  addInforme(FecInfraccionString:string, Latitud: string, Longitud: string, DscLugar: string, LugarHecho: boolean,CodEmp:string,CodEmpr:number, CodLin:string, NumSer:string, NroInterno:string, CodMotivo:string, NotificadoBoolean: boolean,FechaNotificadoString:string, ObsInforme:string) {
    let sql = "INSERT INTO informeInfraccion (FecInfraccionString,Latitud, Longitud, DscLugar, LugarHecho, CodEmp, CodEmpr, CodLin, NumSer, NroInterno, CodMotivo, NotificadoBoolean, FechaNotificadoString, ObsInforme) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    this.database.executeSql(sql, [FecInfraccionString,Latitud, Longitud, DscLugar, LugarHecho, CodEmp, CodEmpr, CodLin, NumSer,NroInterno, CodMotivo, NotificadoBoolean, FechaNotificadoString, ObsInforme])
    .then((data) =>{
      console.log("addInforme:", data);
    }).catch(err=> 
      console.log("Error insert informeInfraccion" + err));
  }

  getInforme(){
    let sql = "SELECT * FROM informeInfraccion";
    return this.database.executeSql(sql, [])
    .then(data => {
      console.log("HAY DATOS EN INFORME CACHE:", data.rows.length);
      
      if (data.rows.length) {
        let informe = data.rows.item(0);
        return Promise.resolve(informe);
      }
      else{
        return Promise.resolve(null);
      }  
    }).catch(error => Promise.reject(error));
  }

  deleteInforme(Id:any) {
    this.database.executeSql('DELETE FROM informeInfraccion  WHERE id = ?;',[Id]).catch((error) => {
      console.log("Error al borrar informe de cache:",error);     
    });
  }
  
}


// WEBPACK FOOTER //
// ./src/providers/db/informeDb.service.ts