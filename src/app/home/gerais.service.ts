import { AppService } from './../app.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeraisService {
  // Variáveis obrigatórias para adequação da URL
  private contexto: String = 'API';
  private modulo: String = 'tr';
  private httpConsulta: any;
  private url =
    'https://senior.braspine.com.br:9090/g5-senior-services/tr_SyncLNT?wsdl';
  private portas = ['Consulta', 'Consulta_SeniorX'];
  public valorBoleano: boolean = true; // variáveis para mudar a classe da div do collapse (Camera e Treinamentos)  
  private valorCapturado = new Subject<string>(); // Criação do canal de comunicação.  
  valor$ = this.valorCapturado.asObservable(); // instanciando o Observable

  constructor(private http: HttpClient, private appService: AppService) {

    // Chama a função Converte url para requisição pela SXI
    this.httpConsulta = this.converteUrl(this.url, this.portas[1]);
  }

  // método para captura do valor
  capturaValor(tarefa: string) {
    this.valorCapturado.next(tarefa);
    //alert(`Valor Capturado: ${tarefa}`);

    if (this.valorBoleano === true) this.valorBoleano = false;
    else this.valorBoleano = true;
  }

  // converte a url de Soap/WSDL para REST
  converteUrl(url, porta) {
    let novaUrl = url.split('/');
    let servico = novaUrl[4]
      .replace(`${this.modulo}_Sync`, '')
      .replace(`?wsdl`, '');
    novaUrl = `${novaUrl[0]}//${novaUrl[2]}/${this.contexto}/G5Rest?server=${novaUrl[0]}//${novaUrl[2]}&module=${this.modulo}&service=${servico}&port=${porta}`;
    return novaUrl;
  }

  // Converte o usuário para remoção do @braspine.com.br
  converteUsername(usuario: string) {
    let user = usuario.split('@');
    return user[0];
  }

  // Busca os treinamentos na base da Braspine
  buscaTreinamentos(dados: any): Observable<any> {
    /*return forkJoin(from(service.getRestUrl()), from(user.getToken())).pipe(
      mergeMap((valor) => {
        const [authHeader, username] = valor;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${username.access_token}`,
          User: this.converteUsername(username.username),
        });
        return this.http.post<any>(this.httpConsulta, dados, { headers });
      })
    );*/

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.appService.token.token}`,
      User: this.appService.token.username
    });

    return this.http.post<any>(this.httpConsulta, dados, { headers });
  }
}
