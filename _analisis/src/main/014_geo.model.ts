import { Dto } from "./Base/base.model";

export class GeoDto implements Dto<number>{
  Id: number;

  UserName: string;
  CurrentTime: string;
  //CurrentTime: DateTime;
  Latitud: string;
  Longitud: string;
  Accion: string;
  Description: string;
    
  getDescription(): string {
      return this.Description;
  } 
}

export class GeolocalizationResponse {
  Status: boolean;
  Messages: string;
}



// WEBPACK FOOTER //
// ./src/models/geo.model.ts