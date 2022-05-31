import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Aperfeicoamento, Retorno, Dados } from '../interfaces';
import { GeraisService } from '../gerais.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ListaComponent {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public listaTreinamentos: Array<Aperfeicoamento>;
  public retornoWeb: string;
  public retornoLista: boolean = false; // valida se tem retorno para listar
  public semResultados: boolean = false;
  public lista: Retorno;
  public estilo: string; // altera a cor da lista
  carregando: boolean = true;
  valoresCapturados = []; // Array no qual irão os valores capturados
  items = [];

  constructor(private service: GeraisService) {
    // configuração de inscrição dos valores capturados
    service.valor$.subscribe((retorno) => {
      this.valoresCapturados.push(retorno);
      this.listaTreinamentos = [];
      this.carregando = true;
      this.retornoWeb =='OK'
      setTimeout(() => {
        this.buscaTreinamento();
      }, 3000);
      //this.teste();
    });

    // Adiciona itens na lista
    this.adicionaItens();
  }

  teste() {
    alert(`Retorno Lista: ${this.valoresCapturados[this.valoresCapturados.length]}`);
  }

  async buscaTreinamento() {
    try {
      //console.log(this.valoresCapturados[0]);  
      this.estilo = 'color:red';

      if (this.valoresCapturados[this.valoresCapturados.length - 1].length === 14) {
        let dados: Dados = {
          numEmp: this.valoresCapturados[this.valoresCapturados.length - 1].substring(0, 4),
          tipCol: this.valoresCapturados[this.valoresCapturados.length - 1].substring(4, 5),
          numCad: this.valoresCapturados[this.valoresCapturados.length - 1].substring(5, 14),
        };

        // Chama o serviço com requisições no Senior
        await this.service.buscaTreinamentos(dados).subscribe((retorno) => {
          this.listaTreinamentos = retorno.aperfeicoamento;

          if (retorno.retorno === 'OK') {
            // ordenando os resultados
            this.listaTreinamentos.sort((a, b) => {
              if (a.seqImp > b.seqImp) {
                return 1;
              }
              if (a.seqImp < b.seqImp) {
                return -1;
              }
              return 0;
            });
          } else {
            this.retornoWeb = retorno.retorno;
          }


          this.carregando = false;
          this.alteraCor(retorno.aperfeicoamento.temreq);


          //console.log(retorno.aperfeicoamento);
        }, (error) => {
          alert(error)
        });
        this.retornoLista = true;

      } else {
        this.carregando = false;
        alert('Código Inválido.');

      }

    } catch (error) {
      alert(`Erro no componente lista: ${error}`);
    }
  }

  alteraCor(temreq: String) {
    if (temreq == 'N') this.estilo = 'color:red';
    else if (temreq == 'S') this.estilo = 'color:blue';
    else this.estilo = 'color:black';

    return this.estilo;
  }

  adicionaItens() {
    for (let i = 0; i < 100; i++) {
      this.items.push(i);
    }
  }
}
