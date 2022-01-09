import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  @Output() onContextMenuEvent = new EventEmitter();
  transactions: Transaction[] = [];
  displayTrans: Transaction[] = [];
  currentTransRecordCount: number = 0;
  showMoreLabel: boolean = false;
  @Input() refreshTransactions: boolean = false;
  @Output() refreshTransactionsChange = new EventEmitter();

  constructor(private appService: AppService) { 
  }

  populateTransactions() {
    this.transactions = [];
    if (this.selectedAccount == "ALL") {
      var user_id = this.appService.getAppUserId;
      this.appService.showLoader();
      this.appService.getAllTrans('{"user_id": ' + user_id + '}')
      .then(data => {
        if (data.dataArray === undefined) {
          this.displayTrans = [];
          this.appService.hideLoader();
          return;
        }
        data.dataArray!.forEach((item: any) => {
          let _trans = new Transaction();
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.appService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.appService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          _trans.is_mf = item.is_mf;
          _trans.is_equity = item.is_equity;
          _trans.acc_id = item.account_id;
          _trans.acc_name = item.account_name;
          _trans.cat_id = item.category_id;
          _trans.user_id = item.user_id;
          _trans.acc_balance = item.balance;
          _trans.receiptImgId = item.trans_receipt_image_id;
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
        if (data.dataArray === undefined) {
          this.displayTrans = [];
          this.appService.hideLoader();
          return;
        }
        data.dataArray!.forEach((item: any) => {
          let _trans = new Transaction();
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.appService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.appService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          _trans.is_mf = item.is_mf;
          _trans.is_equity = item.is_equity;
          _trans.acc_id = item.account_id;
          _trans.acc_name = item.account_name;
          _trans.cat_id = item.category_id;
          _trans.user_id = item.user_id;
          _trans.acc_balance = item.balance;
          _trans.receiptImgId = item.trans_receipt_image_id;
          this.transactions.push(_trans);
        });
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
    if (changes.selectedAccount && !changes.selectedAccount.firstChange) {
      this.populateTransactions();
    }
    if (changes.refreshTransactions && changes.refreshTransactions.currentValue === true) {
      this.populateTransactions();
      this.refreshTransactions = false;
      this.refreshTransactionsChange.emit();
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
    this.populateTransactions();
  }

  getClassVal(value: any) {
    let _type = value.transType;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }

  onContextMenu(event: MouseEvent, item: any, type: string) { 
    let _emitObj = {
      evt: event,
      itm: item,
      typ: type
    }
    this.onContextMenuEvent.emit(_emitObj);
  }

}
