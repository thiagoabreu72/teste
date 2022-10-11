import { Curso } from './interfaces/curso';
import { RetornoG5 } from './interfaces/retornoG5';
import { UsuarioLogado } from './interfaces/usuario-logado';
import { Component, Output } from '@angular/core';
import { ServiceService } from './service.service';
import { Colaborador } from './interfaces/colaborador';
import { Token } from './interfaces/token';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Presença - Treinamentos';

  @Output() listaRegistrada: string[] = [];

  private userLogIn: any;
  private userData: UsuarioLogado;
  private body: Colaborador;
  dadosCurso: Curso;
  gerouToken: boolean = true;
  carregandoDados: boolean = true;
  habilitaSpinner: boolean = false;
  colaborador: Colaborador[];
  usuarioValido: boolean = false;
  formAutenticacao: FormGroup;

  constructor(private service: ServiceService) {
    // a ação é capturada quando obtido o token
    service.gerouToken$.subscribe((retorno) => {
      if (retorno == 'false') {
        this.gerouToken = false;
        this.carregandoDados = false;
      } else this.gerouToken = true;
    });

    service.acao$.subscribe(
      (retorno) => {
        if (retorno) {
          setTimeout(() => {
            this.buscaColaboradores();
            this.buscaCursos();
          }, 500);
        } else alert('Não foi possível obter Token.');
      },
      (error) => {
        alert(error);
      }
    );

    this.formAutenticacao = new FormGroup({
      curso: new FormControl(null, Validators.required),
      colaborador: new FormControl(null, Validators.required),
      senha: new FormControl(null, Validators.required),
    });
  }

  buscaCursos() {
    this.service.buscaCursos().subscribe((retorno) => {
      this.dadosCurso = retorno.dados;
    });
  }

  async buscaColaboradores() {
    const corpo = {
      numEmp: 0,
    };

    await this.service.buscaColaboradores(corpo).subscribe(
      (retorno: any) => {
        this.colaborador = [];
        for (let lista of retorno.dados) {
          this.colaborador.push({
            numEmp: lista.numEmp,
            tipCol: lista.tipCol,
            numCad: lista.numCad,
            cadNom:
              lista.numEmp +
              '-' +
              lista.tipCol +
              '-' +
              lista.numCad +
              ' - ' +
              lista.nomFun,
            // caso tenha usuário cadastro, verifica a quantidade de registros e define
            usuarios:
              lista.usuarios !== undefined
                ? lista.usuarios.length > 1
                  ? lista.usuarios
                  : [lista.usuarios]
                : [],
          });
        }
        this.carregandoDados = false;
        this.gerouToken = true;
      },
      (error) => {
        alert(error.error.errorMessage);
      }
    );
  }

  async extrairNumeroCadastro(cadNum: string) {
    let cadastro = cadNum.split(' - ');
    return cadastro[0];
  }

  async validaUsuario() {
    this.habilitaSpinner = true;
    let msgErro: string = '';

    await this.service.getUser().subscribe((retorno: any) => {
      this.userLogIn = retorno.username.split('@');
    });

    let usuarios = this.colaborador.filter((novo) => {
      return novo.cadNom === this.formAutenticacao.value.colaborador;
    });

    // Verifica se tem usuário vinculado
    if (usuarios[0].usuarios == undefined) {
      alert('Colaborador sem usuário vinculado, verifique!');
      this.formAutenticacao.setValue({
        colaborador: this.formAutenticacao.value.colaborador,
        senha: '',
      });
      this.habilitaSpinner = false;
    } else if (usuarios[0].usuarios.length > 0) {
      // Inicia a variável como false, toda vez que valida um colaborador.
      // enquanto tiver usuários, será validado desde que o usuário atual não tenha autenticado

      //this.acessouG5 = false;

      let verificaStatus: RetornoG5[] = [];

      for (let i = 0; i < usuarios[0].usuarios.length; i++) {
        let dados: Token = {
          username: `${usuarios[0].usuarios[i].nomUsu}@${this.userLogIn[1]}`,
          password: this.formAutenticacao.value.senha,
          escopo: 'string',
        };

        //console.log(`sequência: ${this.acessouG5}`);
        // gera token no senior X, caso gerado, a inserção será feita.
        let testeRetorno = await this.service.gerarToken(dados).subscribe(
          (retorno) => {
            this.usuarioValido = true;

            this.body = {
              numEmp: usuarios[0].numEmp,
              tipCol: usuarios[0].tipCol,
              numCad: usuarios[0].numCad, //Number(user[0]),
            };
            //console.log(`sequência: ${i}`);

            if (this.usuarioValido) {
              this.service.enviaDados(this.body).subscribe((retorno) => {
                //console.log(retorno.msgRetorno);
                if (retorno.msgRetorno.trim() == 'ok') {
                  //alert('Registrado com sucesso!');
                  this.listaRegistrada.push(
                    this.formAutenticacao.value.colaborador
                  );
                  verificaStatus.push({
                    msgRet: retorno.msgRetorno,
                    status: 1,
                  });
                } else
                  verificaStatus.push({
                    msgRet: retorno.msgRetorno,
                    status: 2,
                  });
                //alert(retorno.msgRetorno);

                //this.habilitaSpinner = false;
                this.formAutenticacao.setValue({ colaborador: '', senha: '' });
                //verificaStatus.push('ok');
              });
            }

            return 'i = usuarios[0].usuarios.length';
          },
          (error) => {
            this.formAutenticacao.setValue({
              colaborador: this.formAutenticacao.value.colaborador,
              senha: '',
            });

            //if (i + 1 == usuarios[0].usuarios.length) {
            //alert(error.error.message);
            //this.habilitaSpinner = false;
            //}
            verificaStatus.push({ msgRet: error.error.message, status: 0 });
          }
        );

        //if ((usuarios[0].usuarios.length = i) && msgErro !== '') alert(msgErro);
      }

      /**
       * if (resultado.status == 1) return alert('Registrado com sucesso!');
        else if (resultado.status == 2) return alert(resultado.msgRet);
        else if (resultado.status == 0) return alert(resultado.msgRet);
       */

      // Valida re teve retorno positivo, caso 1, ocorreu tudo certo, caso 2,
      // tem retorno mas não deu certo e caso 0, deu erro
      setTimeout(() => {
        //console.log(verificaStatus)
        let ret1 = verificaStatus.filter((resultado) => {
          return resultado.status == 1;
        });

        if (ret1.length >= 1) alert('Registrado com sucesso!');
        else {
          let ret2 = verificaStatus.filter((resultado) => {
            return resultado.status == 2;
          });
          if (ret2.length >= 1) {
            alert(ret2[0].msgRet);
          } else alert(verificaStatus[0].msgRet);
        }

        this.habilitaSpinner = false;
      }, 3000);
    } else {
      alert('Colaborador não possui usuário vinculado.');
      this.habilitaSpinner = false;
    }
  }
}
