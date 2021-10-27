import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Transaction } from '../model/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  selectedAccount: string = "";
  transactions: Transaction[] = [];
  displayTrans: Transaction[] = [];
  currentTransRecordCount: number = 30;

  constructor(private appService: AppService) { 
    if (this.selectedAccount == "") {
      var user_id = this.appService.getAppUserId;
      this.appService.getAllTrans('{"user_id": ' + user_id + '}')
      .then(data => {
        data.dataArray!.forEach((item: any) => {
          let _trans = new Transaction();
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.amount = item.trans_amount;
          this.transactions.push(_trans);
        });
        this.filterDisplayTrans();
      }, err => {
        this.handleRedirect("/error?err");
      }).catch(fault => {
        this.handleRedirect("/error?fault");
      });
    }
  }

  filterDisplayTrans(showNext: boolean = false) {
    if (!showNext) {
      for (var i = 0; i < this.currentTransRecordCount; i++) {
        this.displayTrans[i] = this.transactions[i];
      }
    } else {
      for (var i = this.currentTransRecordCount; i < (this.currentTransRecordCount + 30); i++) {
        this.displayTrans[i] = this.transactions[i];
      }
      this.currentTransRecordCount += 30;
    }
  }

  handleRedirect(uri: string) {
    window.location.href = uri;
  }

  ngOnInit(): void {
  }

  getClassVal(value: any) {
    return value.indexOf("-") != -1 ? 'negative-val' : 'positive-val'
  }

}
