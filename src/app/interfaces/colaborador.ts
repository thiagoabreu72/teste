import { UsuarioG5 } from './usuarioG5';

export interface Colaborador {
  numEmp: number;
  tipCol: number;
  numCad: number;
  nomFun?: string;
  cadNom?: string;
  usuarios?: UsuarioG5[];
}
