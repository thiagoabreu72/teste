import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { user } from '@seniorsistemas/senior-platform-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private urlAuth = environment.urlPlatform + '/authentication/actions/login';
  private listUsers = environment.urlPlatform + '/user/queries/listUsers';
  private urlSenior = environment.urlSenior;
  private portasSenior = ['insere', 'colaboradores', 'cursos'];
  private listEmployee =
    'https://api.senior.com.br/hcm/employeejourney/entities/employee';
  private contexto: string = 'SXI-API';
  private modulo: string = 'rubi';
  private urlInsere: string;
  private urlColaboradores: string;
  private urlCursos: string;
  private token = null;
  private tokenColaborador = null;
  //gerouToken: boolean = true;
  private capturaToken = new Subject<string>(); // Criação do canal de comunicação.
  gerouToken$ = this.capturaToken.asObservable();
  private capturaAcao = new Subject<string>(); // Criação do canal de comunicação.
  acao$ = this.capturaAcao.asObservable(); // instanciando o Observable para mudanças no valor

  constructor(private http: HttpClient) {
    //Inicializa o token da propriedade corrente.
    user
      .getToken()
      .then((data) => {
        this.token = data;
        this.capturaAcao.next(this.token.access_token);
      })
      .catch((error) => {
        alert(
          'Não foi possível obter token. Verifique se a tela está sendo acessada pela plataforma Senior X.'
        );
        this.capturaToken.next('false');
      });

    this.urlInsere = this.converteUrl(this.urlSenior, this.portasSenior[0]);
    this.urlColaboradores = this.converteUrl(
      this.urlSenior,
      this.portasSenior[1]
    );
    this.urlCursos = this.converteUrl(this.urlSenior, this.portasSenior[2]);
    //console.log(this.urlCursos);
  }

  // Obtem o usuário da Senior
  getUser(): Observable<any> {
    if (this.token) {
      return of(this.token);
    } else {
      throw new Error('Erro ao obter o token do usuário logado.');
    }
  }

  buscaColaboradores(body: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `bearer ${this.token.access_token}`,
    });

    return this.http.post<any>(this.urlColaboradores, body, { headers });
  }

  buscaCursos(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `bearer ${this.token.access_token}`,
    });

    return this.http.post<any>(this.urlCursos, {}, { headers });
  }

  enviaDados(body: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `bearer ${this.token.access_token}`,
    });

    return this.http.post<any>(this.urlInsere, body, { headers });
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

  // Logar no Senior X
  gerarToken(dados: Object): Observable<any> {
    //console.log('dados')
    this.tokenColaborador = dados;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.urlAuth, dados, { headers });
  }
}
