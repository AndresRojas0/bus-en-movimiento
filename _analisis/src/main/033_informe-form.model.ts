import { Dto } from "./Base/base.model";

export class InformeForm  extends Dto<number> {

  getDescription(): string {
    return this.NroInterno;
  }

  public FecInfraccion: Date;
  public FecInfraccionString:string;
  public Hora: string;
  public Latitud: string;
  public Longitud: string;
  public DscLugar: string;
  public LugarHecho: boolean;
  public CodEmp: string;
  public CodEmpr: number;
  public CodLin: string;
  public NumSer: string;
  public NroInterno: string;
  public CodMotivo: string;
  public NotificadoBoolean: boolean;
  public FechaNotificadoString: string;
  public ObsInforme: string;
  public isValid: boolean
}

export class InformeConsulta
{
  fechaInforme : string; 
  fechaInfraccion : string;
  naConductor : string;
  legConductor : string;
  descMotivo : string;
  descLinea : string;
  servicio : string;
  descLugar : string;
  ficha : string;
  interno : string;
  dominio : string;
  notificado  : string;
  fechaNotificado : string;
  obsInforme : string;
  numInforme: string;
}


// WEBPACK FOOTER //
// ./src/models/informe-form.model.ts