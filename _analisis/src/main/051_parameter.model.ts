import { Dto, FilterDTO } from "./Base/base.model";

export const RealTimeTracking = 'Inspectores_Geo_RealTimeTracking';
export const TiemposEntreHistorico = 'Inspectores_Geo_TiemposEntreHistorico';
export const TiempoEntreEnvios = 'Inspectores_Geo_TiempoEntreEnvios';
export const CantidadIntentosLoginKey = 'Loguin_CantidadIntentos';
export const TimeForCheckUpdateVersion = 'Inspectores_TimeToCheckVersionUpdate';


export class ParametersDto implements Dto<number>{
    
    Id: number;
    Description: string;
    Token: string;
    Value: string;
    
    getDescription(): string {
        return this.Description;
    } 

}

export class ParametersFilter extends FilterDTO {    
    Token: string;
}


// WEBPACK FOOTER //
// ./src/models/parameter.model.ts