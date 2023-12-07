import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.appService.hideLoader();
  }

  async invokeMfUpdater() {
    this.appService.showLoader();
    await this.appService.invokeMfStockUpdater(false).then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('MF Updater refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('MF Updater refresh completed');
    });
  }

  async invokeStocksUpdater() {
    this.appService.showLoader();
    await this.appService.invokeMfStockUpdater(true).then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('EQ Updater refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('EQ Updater refresh completed');
    });;
  }

  async invokeRoutines() {
    this.appService.showLoader();
    await this.appService.invokeMonthlyRoutines().then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('Monthly routines refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('Monthly routines refresh completed');
    });;
  }

}
