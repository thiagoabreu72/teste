import { Token } from './../interfaces/token';
//import { service, user } from '@seniorsistemas/senior-platform-data';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  formLogin: FormGroup;
  private conexaoDB: any; // conexão Database
  private usuario: any = [];
  private usuarioDB: string;
  private senhaDB: string;
  private acaoSair = '1';
  public mudarCorBackgroud: string;
  carregando = false;

  constructor(private service: AppService, private router: Router) {

    this.mudarCorBackgroud = "background-color: rgb(57, 125, 90);width: 100%; height: 100%;";

    //this.formLogin.setValue({ usuario: '', senha: '', check: true });

    this.verificaBaseDados();
    service.acao$.subscribe((retorno) => {
      setTimeout(() => { this.atribuiValorCampos(retorno); }, 500);
      //this.atribuiValorCampos(retorno);
    });

    this.formLogin = new FormGroup({
      usuario: new FormControl(null, Validators.required),
      senha: new FormControl(null, Validators.required),
      check: new FormControl(null)
    });

  }

  ngOnInit() {
    this.formLogin.setValue({ usuario: '', senha: '', check: true });
  }

  ngOnDestroy() {

  }

  onChange(evento) {
    console.log(evento);
  }

  verificaBaseDados() {

    // instrução com os dados à serem criados.
    let openRequest = window.indexedDB.open('banco_qr', 1);

    // Será executado para criar ou alterar um banco de dados já existente.
    openRequest.onupgradeneeded = event => {
      console.log('Cria ou altera um banco já existente.');

      // obtem os dados do db para utilizar
      this.conexaoDB = event.target;
      this.conexaoDB = this.conexaoDB.result;

      // cria a "tabela e define o index (PK)"
      var banco = this.conexaoDB.createObjectStore('login', { keyPath: 'id' });

      // cria os "campos"
      banco.createIndex('user', 'user', { unique: true });
      banco.createIndex('password', 'password', { unique: false });
    }

    // será executado quando conseguirmos obter uma conexão.
    openRequest.onsuccess = event => {

      // obtem o resultado da conexão - informações do IDBDatabase
      this.conexaoDB = event.target;
      this.conexaoDB = this.conexaoDB.result;

      // Verifica se já tem usuário cadastrado
      this.recuperaUsuario();
      console.log('Conexão obtida com sucesso.');

    }

    // será executado se tivermos algum tipo de problema ao tentarmos nos conectar com o banco.
    openRequest.onerror = event => {
      console.log(event.target);
    }
  }

  async populaCampos() {

    //validando se o check está marcado, caso sim, adiciona o usuário no array
    if (this.formLogin.value.check) {

      // permite as transações no objeto login, permitindo leitura e escrita
      var transacao = this.conexaoDB.transaction(['login'], 'readwrite');

      // abre o objeto login para adicionar os valores
      var objectStore = transacao.objectStore('login');
      var request = objectStore.put(this.usuario[0]);

      // após finalizar a transação, executa o console
      transacao.oncomplete = function () {
        console.log('ok');
      };
    }
  }

  async recuperaUsuario() {

    // Utiliza a conexão com o "banco" e cria a transação no objeto login com permissão de consulta
    let transacao = this.conexaoDB.transaction('login', 'readonly');
    // obtem os dados armazenados no objeto login
    let objeto = transacao.objectStore('login');
    // informa qual indíce será utilizado na consulta
    let indice = objeto.index("user");

    let user;
    let pass;

    // abre um cursor pra percorrer os valores do objeto
    indice.openCursor().onsuccess = (event) => {
      var cursor = event.target.result;
      //console.log('1' + user)
      if (cursor) {
        //console.log('2' + user)
        user = cursor.value.user;
        pass = cursor.value.password;
        //cursor.continue();
      }
      this.usuarioDB = user;
      this.senhaDB = pass;
    }

    // Feito dessa forma para dar tempo de atribuir valor às variáveis
    setTimeout(() => { this.atribuiValorCampos(this.acaoSair); }, 500);

  }

  async atribuiValorCampos(acao: string) {
    // valor 1 para quando inicia a aplicação
    if ((this.usuarioDB !== undefined) && (acao == '1')) {
      this.formLogin.setValue({ usuario: this.usuarioDB, senha: this.senhaDB, check: true });
      //this.router.navigateByUrl('/home');
    } else if ((this.usuarioDB !== undefined) && (acao == '2')) {
      this.formLogin.setValue({ usuario: this.usuarioDB, senha: this.senhaDB, check: true });
    }
  }

  async obterDados() {
    try {

      let dados: Token = {
        username: this.formLogin.value.usuario + "@braspine.com.br",
        password: this.formLogin.value.senha,
        escopo: "string"
      }

      this.carregando = true;

      await this.service.gerarToken(dados).subscribe((retorno) => {
        //console.log(retorno)
        let convertido = retorno.jsonToken.split(',');
        convertido = convertido[5].split('\'');
        convertido = convertido[0].substr(16, 32);


        // Grava o token na variável do serviço
        let token = {
          username: this.formLogin.value.usuario,
          token: convertido
        };
        this.service.obterToken(token);


        if (this.formLogin.value.check === true) {
          // adiciona o usuário ao banco IndexedDB
          this.usuario.push({
            id: 1,
            user: this.formLogin.value.usuario,
            password: this.formLogin.value.senha
          });

          // Grava os dados no banco
          this.populaCampos();
        }

        //console.log('obterDados');
        this.carregando = false;
        this.router.navigateByUrl('/home');
        return convertido;
      },
        (error) => {

          console.table(error.status);

          if (error.status !== 200)
            alert(error.error.message);

          return error.error.message;
        });

    } catch (error) {
      console.error(error);
    }

  }

  mudaCor(selecionado: boolean) {
    if (!selecionado)
      this.mudarCorBackgroud = "background-color: rgb(57, 125, 90);width: 100%; height: 100%;";
    else
      this.mudarCorBackgroud = "background-color: rgb(57, 125, 90);width: 100%;";
  }


}
