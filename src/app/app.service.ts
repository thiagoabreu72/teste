import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  //private seniorApi: SeniorApi;
  public token: any;
  private statusCarregando: boolean = false;
  private urlAuth: string =
    'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/authentication/actions/login';
  //public auth: any;

  private capturaAcao = new Subject<string>(); // Criação do canal de comunicação.
  acao$ = this.capturaAcao.asObservable(); // instanciando o Observable

  constructor(private http: HttpClient) {
    //Inicializa o token da propriedade corrente.
    /*user.getToken().then(data => {
      this.token = data;
    });*/
  }

  //Método para capturar o valor da Ação, o que influencia no comportamento da tela
  capturaAcaoSair(acao: string) {
    //console.log(acao);
    this.capturaAcao.next(acao);
    //alert(`Valor Capturado da Ação: ${acao}`);
  }

  // Logar no Senior X
  gerarToken(dados: Object): Observable<any> {
    //console.log('dados')
    this.token = dados;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.urlAuth, dados, { headers });
  }

  async obterToken(token: Object) {
    this.token = token;
    //console.log(this.token.username);
    //console.log(this.token.token);
  }

  mudaStatusSpinner(status: boolean) {
    if (this.statusCarregando === true) this.statusCarregando = false;
    else this.statusCarregando = true;

    return this.statusCarregando;
  }
}
