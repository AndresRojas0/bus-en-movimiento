import { GeoDbService } from '../db/geoDb.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ToolsProvider } from '../../shared/page/tools';

@Injectable()
export class DbService {

  private database: SQLiteObject;
  // private dbReady = new BehaviorSubject<boolean>(false);

  constructor(
    public http: HttpClient,
    private platform:Platform,
    private sqlite:SQLite,
    public tools: ToolsProvider,
    public geoDb: GeoDbService
    ) {
      if (this.tools.isBrowser()) return;

      this.platform.ready().then( ()=>{
        this.sqlite.create({
          name: 'inspectores.db',
          location: 'default'
        })
        .then((db:SQLiteObject)=>{
          this.database = db;
          this.createTables();
          //this.geoDb.createTableGeo();
          // this.database.executeSql("DROP TABLE porConductor", []);
          // this.database.executeSql("DROP TABLE sabana", []);
          // this.database.executeSql("DROP TABLE servicioConductor", []);
          // this.createTables().then(()=>{
          //   //communicate we are ready!
          //   this.dbReady.next(true);
          // });
        })

      });
  }

  createTables(){
    try {
      return this.database.executeSql(
        `CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dni TEXT, pass TEXT);`, [])
      .then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS sabana (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT,
            linea TEXT,
            sentidoBandera TEXT,
            bandera TEXT,
            banderasRelacionadas TEXT,
            horarios TEXT,
            fechaConsulta TEXT
            );`, [])
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS servicioConductor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT,
            linea TEXT,
            servicio TEXT,
            conductor TEXT,
            horarios TEXT,
            fechaConsulta TEXT
            );`, [])
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS porConductor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT,
            conductor TEXT,
            linea TEXT,
            servicio TEXT,
            horarios TEXT,
            fechaConsulta TEXT
            );`, [])
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS sector (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT,
            sector TEXT,
            sentido TEXT,
            tipoLinea TEXT,
            horariosPorSector TEXT,
            fechaConsulta TEXT
          );`,[])
        
      })
    }
    catch (err) {
      return console.log("error detected creating tables", err);
    }
  }

  // private isReady(){
  //   return new Promise((resolve, reject) =>{
  //     //if dbReady is true, resolve
  //     if(this.dbReady.getValue()){
  //       resolve();
  //     }
  //     //otherwise, wait to resolve until dbReady returns true
  //     else{
  //       this.dbReady.subscribe((ready)=>{
  //         if(ready){
  //           resolve();
  //         }
  //       });
  //     }
  //   })
  // }

  addUsr(dni:string, clave: string)
  {
    let sqlDelete =  "DELETE FROM usuarios;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO usuarios (dni, pass) VALUES (?,?);";
    return this.database.executeSql(sql, [dni,clave])
    // .then((data) =>{
    //   console.log("addUser", data);

    // });
  }

  getUsr(){
    let sql = "SELECT * FROM usuarios";
    return this.database.executeSql(sql, [])
    .then(data => {
      if (data.rows.length) {
        let usr = data.rows.item(0);
        return Promise.resolve(usr);
      }
    }).catch(error => Promise.reject(error));
  }

  //Tab Sabana
  addSabana(fecha: string, linea: string, sentidoBandera: string, bandera: string, banderasRelacionadas: string, horarios: string, fechaConsulta:string)
  {
    let sqlDelete = "DELETE FROM sabana;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO sabana (fecha, linea, sentidoBandera, bandera, banderasRelacionadas, horarios, fechaConsulta) VALUES (?, ?, ?, ?, ?, ?, ?)";
    return this.database.executeSql(sql, [fecha, linea, sentidoBandera, bandera, banderasRelacionadas, horarios, fechaConsulta]);
  }

  getSabana(){
    let sql = "SELECT * FROM sabana";
    return this.database.executeSql(sql, [])
    .then(data => {
      if(data.rows.length){
        let sabana = data.rows.item(0);
        return Promise.resolve(sabana);
      }
    })
  }

  //Tab Servicio/conductor 
  addServicioConductor(fecha: string, linea: string, servicio: string, conductor: string, horarios: string, fechaConsulta:string)
  {
    let sqlDelete = "DELETE FROM servicioConductor;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO servicioConductor (fecha, linea, servicio, conductor, horarios, fechaConsulta) VALUES (?, ?, ?, ?, ?, ?)";
    return this.database.executeSql(sql, [fecha, linea, servicio, conductor,horarios, fechaConsulta]);
  }

  getServicioConductor(){
    let sql = "SELECT * FROM servicioConductor";
    return this.database.executeSql(sql, [])
    .then(data => {
      if(data.rows.length){
        let servicioConductor = data.rows.item(0);
        return Promise.resolve(servicioConductor);
      }
    })
  }

  //Tab Servicio/conductor -- Busqueda por conductor
  addPorConductor(fecha: string, conductor: string, linea: string, servicio: string, horarios: string, fechaConsulta:string)
  {
    let sqlDelete = "DELETE FROM porConductor;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO porConductor (fecha, conductor, linea, servicio, horarios, fechaConsulta) VALUES (?, ?, ?, ?, ?, ?)";
    return this.database.executeSql(sql, [fecha, conductor, linea, servicio, horarios, fechaConsulta]);
  }

  getPorConductor(){
    let sql = "SELECT * FROM porConductor";
    return this.database.executeSql(sql, [])
    .then(data => {
      if(data.rows.length){
        let porConductor = data.rows.item(0);
        return Promise.resolve(porConductor);
      }
    })
  }

  //Tab Sector
  addSector(fecha: string, sector: string, sentido: string, tipoLinea: string, horariosPorSector: string, fechaConsulta:string)
  {
    let sqlDelete = "DELETE FROM sector;";
    this.database.executeSql(sqlDelete, []);
    let sql = "INSERT INTO sector (fecha, sector, sentido, tipoLinea, horariosPorSector, fechaConsulta) VALUES (?, ?, ?, ?, ?, ?)";
    return this.database.executeSql(sql, [fecha, sector, sentido, tipoLinea, horariosPorSector, fechaConsulta]);
  }

  getSector(){
    let sql = "SELECT * FROM sector";
    return this.database.executeSql(sql, [])
    .then(data => {
      if(data.rows.length){
        let sector = data.rows.item(0);
        return Promise.resolve(sector);
      }
    })
  }


}



// WEBPACK FOOTER //
// ./src/providers/db/db.service.ts