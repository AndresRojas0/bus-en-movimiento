import { GeoDto } from './../../models/geo.model';
import { ToolsProvider } from './../../shared/page/tools';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';


@Injectable()
export class GeoDbService {

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
        this.createTableGeo();
        // this.database.executeSql("DROP TABLE geolocation", []);
        // this.createTables().then(()=>{
        //   //communicate we are ready!
        //   this.dbReady.next(true);
        // });
      })
    });
  }

    createTableGeo() {
      try {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS geolocation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            timestamp TEXT,
            latitud REAL,
            longitud REAL,
            accion TEXT);`, [])    
      }
      catch (err) {
        return console.log("error detected creating tables geolocation", err);
      }
    }

    addGeo(username:string, timestamp:string, lat: number, long: number, accion: string) {
      let sql = "INSERT INTO geolocation (username, timestamp, latitud, longitud, accion) VALUES (?,?,?,?,?);";
      this.database.executeSql(sql, [username,timestamp, lat, long, accion])
      .then((data) =>{
        console.log("addGeo:", data);
      }).catch(err=> 
        console.log("Error insert geolocation" + err));
    }

    getGeo() {
      let sql = "SELECT * FROM geolocation LIMIT 10;";
      return this.database.executeSql(sql, [])
      .then(data => {
        let listGeoDto: GeoDto[] = []
        console.log("getGeo: data.length",data.rows.length);
        if(data.rows.length) { 
          for (let i = 0; i < data.rows.length; i++) {
            var geoDto = new GeoDto();
            geoDto.Id = data.rows.item(i).id;
            geoDto.UserName = data.rows.item(i).username;
              geoDto.CurrentTime = data.rows.item(i).timestamp;
              geoDto.Latitud = data.rows.item(i).latitud;
              geoDto.Longitud = data.rows.item(i).longitud;
              geoDto.Accion = data.rows.item(i).accion;
            listGeoDto.push(geoDto);
          }
          console.log("GEODTO",geoDto);
        } 

        return Promise.resolve(listGeoDto);      
      })
    }

    //Solo para comprobar si se crean los registros
    getGeoRow() {
      let sql = "SELECT * FROM geolocation LIMIT 10;";
      return this.database.executeSql(sql, [])
      .then(data => {
        return Promise.resolve(data.rows);
      })
    }
  
    deleteItems(listGeo: GeoDto[]): any {     
      listGeo.forEach(e=> {
        this.database.executeSql('DELETE FROM geolocation WHERE id = ?;' , [e.Id]);
      });
    }
}


// WEBPACK FOOTER //
// ./src/providers/db/geoDb.service.ts