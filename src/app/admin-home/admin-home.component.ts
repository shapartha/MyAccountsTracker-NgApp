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

  invokeMfUpdater() {
    this.appService.invokeMfStockUpdater(false).catch(x => {
      console.log(x);
    });
  }

  invokeStocksUpdater() {
    this.appService.invokeMfStockUpdater(true).catch(x => {
      console.log(x);
    });;
  }

  invokeRoutines() {
    this.appService.invokeMonthlyRoutines().catch(x => {
      console.log(x);
    });;
  }

}
