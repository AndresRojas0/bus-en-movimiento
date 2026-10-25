import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';


@Injectable()
export class IncognitosDbService {

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
        // this.database.executeSql("DROP TABLE planillaIncognitos", []);
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
        `CREATE TABLE IF NOT EXISTS planillaIncognitos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Fecha INTEGER ,
          SucursalId INTEGER ,
          HoraAscenso TEXT,
          HoraDescenso TEXT,
          CocheId TEXT,
          CocheFicha INTEGER,
          CocheInterno TEXT,
          Tarifa REAL,
          InspPlanillaIncognitosDetalle TEXT
          );`, [])    
    }
    catch (err) {
      return console.log("error detected creating tables informeInfraccion", err);
    }
  }

  addIncognitos(Fecha:string, SucursalId: number, HoraAscenso: string, HoraDescenso: string, CocheId: string,CocheFicha: number,CocheInterno: string, Tarifa: number, InspPlanillaIncognitosDetalle: string) {
    let sql = "INSERT INTO planillaIncognitos (Fecha,SucursalId, HoraAscenso, HoraDescenso, CocheId, CocheFicha, CocheInterno, Tarifa, InspPlanillaIncognitosDetalle) VALUES (?,?,?,?,?,?,?,?,?);";
    this.database.executeSql(sql, [Fecha,SucursalId, HoraAscenso, HoraDescenso, CocheId, CocheFicha, CocheInterno, Tarifa, InspPlanillaIncognitosDetalle])
    .then((data) =>{
      console.log("addIncognitos:", data);
    }).catch(err=> 
      console.log("Error insert planillaIncognitos" + err));
  }

  getIncognitos(){
    let sql = "SELECT * FROM planillaIncognitos";
    return this.database.executeSql(sql, [])
    .then(data => {
      console.log("HAY DATOS EN INCOGNITOS CACHE:", data.rows.length);
      
      if (data.rows.length) {
        let incognito = data.rows.item(0);
        return Promise.resolve(incognito);
      }
      else{
        return Promise.resolve(null);
      }  
    }).catch(error => Promise.reject(error));
  }

  deleteIncognitos(Id:any) {
    this.database.executeSql('DELETE FROM planillaIncognitos  WHERE id = ?;',[Id]).catch((error) => {
      console.log("Error al borrar incognitos de cache:",error);     
    });
  }
  
}


// WEBPACK FOOTER //
// ./src/providers/db/incognitosDb.service.ts