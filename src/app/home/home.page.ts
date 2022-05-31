import { AppService } from './../app.service';
import { AlertController } from '@ionic/angular';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { GeraisService } from './gerais.service';
import { Router } from '@angular/router';

// Loading
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy {
  result = null;
  scanActive = false;
  lista = false;
  statusSpinner = false;
  estilo: string = '';
  valoresLeitura = [];

  constructor(
    private alertController: AlertController,
    private appService: AppService,
    private geraisService: GeraisService,
    private router: Router,
    public loadingController: LoadingController
  ) { }

  ngAfterViewInit(): void {
    BarcodeScanner.prepare();
  }

  ngOnDestroy(): void {
    BarcodeScanner.stopScan();
  }

  teste() {
    this.valoresLeitura.push('00021000006400');
    this.statusSpinner = this.appService.mudaStatusSpinner(this.statusSpinner);
    this.enviaValor();
  }

  // Irá mandar o valor capturado para o serviço
  enviaValor() {
    const valor = this.valoresLeitura.shift();
    this.geraisService.capturaValor(valor);
    this.mostraLista();
  }

  // Habilita para mostrar a lista
  mostraLista() {
    this.estilo = 'background-color: blueviolet; height: max-content;';
    this.lista = true;
    return this.lista;
  }

  sair() {
    // Passa o valor 2 para a ação, assim não logará automaticamente
    this.appService.capturaAcaoSair('2');

    // Volta para a tela de login.
    this.router.navigateByUrl('/login');
  }

  // Apresentação do Loading
  async apresentaCarregando() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Por gentileza, aguarde...',
      duration: 2000,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Carregamento concluído.');
  }

  // Iniciar a Câmera
  async startScan() {
    this.scanActive = false;
    const allowed = await this.checkPermission();
    if (allowed) {
      this.lista = false;
      this.scanActive = true;
      const result = await BarcodeScanner.startScan();
      console.table(result);
      console.log(`confirmando : ${result}`);
      if (result.hasContent) {
        //alert('chegou aqui');
        //console.log(result.content); // log the raw scanned content
        //this.apresentaCarregando();
        this.result = result.content;
        this.valoresLeitura.push(this.result);
        this.scanActive = false;
        this.statusSpinner = true;
        this.enviaValor();
        //alert(this.scanActive);
      }
    }
  }

  // Verifica as permissões da Câmera
  async checkPermission() {
    //const status = await BarcodeScanner.checkPermission({ force: true });
    //return status.granted;
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const alert = await this.alertController.create({
          header: 'No permission',
          message: 'Please allow camera',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
            },
            {
              text: 'Open Settings',
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              },
            },
          ],
        });
      } else {
        resolve(false);
      }
    });
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }
}
