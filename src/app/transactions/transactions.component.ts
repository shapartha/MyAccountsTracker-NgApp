import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AppService } from '../app.service';
import { Transaction } from '../model/transaction';
import { Account } from '../model/account';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnChanges {
  @Input() selectedAccount: string = "ALL";
  @Input() selectedAccountObject: Account = {};
  transactions: Transaction[] = [];
  displayTrans: Transaction[] = [];
  currentTransRecordCount: number = 0;
  showMoreLabel: boolean = false;

  constructor(private appService: AppService) { 
    this.populateTransactions();
  }

  populateTransactions() {
    this.transactions = [];
    if (this.selectedAccount == "ALL") {
      var user_id = this.appService.getAppUserId;
      this.appService.showLoader();
      this.appService.getAllTrans('{"user_id": ' + user_id + '}')
      .then(data => {
        data.dataArray!.forEach((item: any) => {
          let _trans = new Transaction();
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.appService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.appService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          this.transactions.push(_trans);
        });
        this.currentTransRecordCount = 30;
        this.filterDisplayTrans();
        this.appService.hideLoader();
      }, err => {
        this.handleRedirect("error?err");
        this.appService.hideLoader();
      }).catch(fault => {
        this.handleRedirect("error?fault");
        this.appService.hideLoader();
      });
    } else if (this.selectedAccount == "") {
      this.displayTrans = [];
    } else {
      var user_id = this.appService.getAppUserId;
      var acc_id = this.selectedAccountObject == null ? 0 : this.selectedAccountObject.id;
      this.appService.showLoader();
      this.appService.getTransByAccount('{"user_id": ' + user_id + ', "account_id": ' + acc_id + '}')
      .then(data => {
        data.dataArray!.forEach((item: any) => {
          let _trans = new Transaction();
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.appService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.appService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          this.transactions.push(_trans);
        });
        console.log("Fetch Transactions API Success");
        this.currentTransRecordCount = (this.transactions.length >= 30) ? 30 : this.transactions.length;
        this.filterDisplayTrans();
        this.appService.hideLoader();
      }, err => {
        this.handleRedirect("error?err");
        this.appService.hideLoader();
      }).catch(fault => {
        this.handleRedirect("error?fault");
        this.appService.hideLoader();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.selectedAccount);
    if (changes.selectedAccount && !changes.selectedAccount.firstChange) {
      this.populateTransactions();
    }
  }

  filterDisplayTrans(showNext: boolean = false) {
    if (!showNext) {
      this.displayTrans = [];
      let _nextCount = this.transactions.length >= this.currentTransRecordCount ? this.currentTransRecordCount : this.transactions.length;
      for (var i = 0; i < _nextCount; i++) {
        this.displayTrans[i] = this.transactions[i];
      }
      this.showMoreLabel = (this.transactions.length == _nextCount) ? false : true;
      this.currentTransRecordCount = _nextCount;
    } else {
      let _nextCount = this.transactions.length >= (this.currentTransRecordCount + 30) ? (this.currentTransRecordCount + 30) : this.transactions.length;
      for (var i = this.currentTransRecordCount; i < _nextCount; i++) {
        this.displayTrans[i] = this.transactions[i];
      }
      this.showMoreLabel = (this.transactions.length == _nextCount) ? false : true;
      this.currentTransRecordCount = _nextCount;
    }
  }

  handleRedirect(uri: string) {
    window.location.href = uri;
  }

  ngOnInit(): void {
  }

  getClassVal(value: any) {
    let _type = value.transType;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }

}
