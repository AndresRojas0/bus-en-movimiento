import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

@Injectable()
export class DiagramacionDbService {

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
        // this.database.executeSql("DROP TABLE diagramacion", []);
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
        `CREATE TABLE IF NOT EXISTS diagramacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Fecha TEXT,
          Diagramacion TEXT);`, [])    
    }
    catch (err) {
      return console.log("error detected creating tables diagramacion", err);
    }
  }

  addDiagramacion(Fecha:string, Diagramacion: string) {
    let sqlDelete =  "DELETE FROM diagramacion;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO diagramacion (Fecha,Diagramacion) VALUES (?,?);";
    this.database.executeSql(sql, [Fecha,Diagramacion])
    .then((data) =>{
      console.log("addDiagramacion::::::::::::::::", data);
    }).catch(err=> 
      console.log("Error insert diagramacion" + err));
  }

  getDiagramacion(){
    let sql = "SELECT * FROM diagramacion";
    return this.database.executeSql(sql, [])
    .then(data => {
      console.log("HAY DATOS EN DIAGRAMACION CACHE:", data.rows.length);
      if (data.rows.length) {
        let diagrama = data.rows.item(0);
        console.log("Obtener diagramacion de BD::", diagrama);
        
        return Promise.resolve(diagrama);
      }
      else{
        return Promise.resolve(null);
      }  
    }).catch(error => Promise.reject(error));
  }

  // deleteDiagramacion(Id:any) {
  //   this.database.executeSql('DELETE FROM diagramacion  WHERE id = ?;',[Id]).catch((error) => {
  //     console.log("Error al borrar diagramacion de cache:",error);     
  //   });
  // }
  
}


// WEBPACK FOOTER //
// ./src/providers/db/diagramacionDb.service.ts