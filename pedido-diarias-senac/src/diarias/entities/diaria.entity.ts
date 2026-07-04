export class Diaria {
  id: number;
  servidorNome: string;
  cargo: 'OPERACIONAL' | 'TECNICO' | 'GESTAO';
  destino: string;
  dataSaida: string;
  dataRetorno: string;
  temPernoite: boolean;
  valorTotal: number;
}