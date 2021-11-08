import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from "@angular/router"
import { SaveTransaction, Transaction } from '../model/transaction';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account } from '../model/account';
import { AppConstant } from '../constant/app-const';

@Component({
  selector: 'app-add-trans',
  templateUrl: './add-trans.component.html',
  styleUrls: ['./add-trans.component.scss']
})
export class AddTransComponent implements OnInit {
  isTransferTrans = false;
  isRecurringTrans = false;
  isMf = false;
  trans: Transaction = {};
  mainAccList: Account[] = [];
  fromAcc: Account[] = [];
  toAcc: Account[] = [];
  monthDays: number[] = [];
  fromAccDetails: string = "";
  toAccDetails: string = "";
  reccDate: string = "";
  mfSchemeCode: string = "";
  mfSchemes: any[] = [];
  isValid: boolean = true;
  saveTransaction: SaveTransaction = {};
  saveTransactionTrans: SaveTransaction = {};
  constructor(private appService: AppService, private router: Router, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
    this.appService.getAllAccounts('{"user_id": ' + this.appService.getAppUserId + '}').then(data => {
      console.log("FETCH ALL ACCOUNTS Success");
      data.dataArray.forEach((element: any) => {
        if (element.is_equity == false) {
          let _acc = new Account();
          _acc.id = element.account_id;
          _acc.name = element.account_name;
          _acc.balance = element.balance;
          _acc.category_id = element.category_id;
          _acc.category_name = element.category_name;
          _acc.created_date = element.created_date;
          _acc.is_equity = element.is_equity;
          _acc.is_mf = element.is_mf;
          _acc.updated_date = element.updated_date;
          _acc.user_id = element.user_id;
          this.fromAcc.push(_acc);
        }
      });
      this.mainAccList = this.fromAcc.map(obj => ({ ...obj }));
      this.toAcc = this.fromAcc.map(obj => ({ ...obj }));
      this.appService.hideLoader();
    }, err => {
      this.handleRoute("error?" + err);
      this.appService.hideLoader();
    }).catch(fault => {
      this.handleRoute("error?" + fault);
      this.appService.hideLoader();
    });
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }

  showAlert(msg: string, actionTxt: string) {
    this.snackBar.open(msg, actionTxt);
  }

  saveTrans(trans: Transaction) {
    debugger;
    this.saveTransaction = {};
    this.saveTransactionTrans = {};
    if (this.validateForm()) {
      trans.acc_id = this.fromAccDetails;
      trans.user_id = this.appService.getAppUserId.toString();
      if (this.isTransferTrans) {
        this.saveTransactionTrans.amount = trans.amount;
        this.saveTransactionTrans.date = trans.date;
        this.saveTransactionTrans.desc = trans.description;
        this.saveTransactionTrans.type = "CREDIT";
        trans.transType = "DEBIT";
        this.saveTransactionTrans.acc_id = this.toAccDetails;
        this.saveTransactionTrans.user_id = trans.user_id;
        if (this.isRecurringTrans) {
          this.saveTransactionTrans.rec_date = this.reccDate;
        }
      }
      this.saveTransaction.amount = trans.amount;
      this.saveTransaction.date = trans.date;
      this.saveTransaction.desc = trans.description;
      this.saveTransaction.type = trans.transType;
      this.saveTransaction.acc_id = trans.acc_id;
      this.saveTransaction.user_id = trans.user_id;
      if (this.isRecurringTrans) {
        this.saveTransaction.rec_date = this.reccDate;
      }
      this.showAlert("Saved Successfully", "Close");
    } else {
    }
  }

  validateForm(): any {
    this.isValid = false;
    if (this.trans.amount == undefined || this.trans.amount == null) {
      this.showAlert("Amount cannot be blank or empty", "Close");
    } else if (this.trans.description == undefined || this.trans.description?.length! < 3) {
      this.showAlert("Description must be atleast 3 characters", "Close");
    } else if (!this.isTransferTrans && (this.trans.transType == undefined || this.trans.transType == null)) {
      this.showAlert("Please select the transaction type", "Close");
    } else if (this.trans.date == undefined || this.trans.date == null) {
      this.showAlert("Date is invalid or blank", "Close");
    } else if (this.fromAccDetails == undefined || this.fromAccDetails == null || this.fromAccDetails == "") {
      this.showAlert("From Account is invalid or blank", "Close");
    } else if (this.isTransferTrans && (this.toAccDetails == undefined || this.toAccDetails == null || this.toAccDetails == "")) {
      this.showAlert("To Account is invalid or blank", "Close");
    } else if (this.isRecurringTrans && (this.reccDate == undefined || this.reccDate == null || this.reccDate == "")) {
      this.showAlert("Recurring Date is invalid or blank", "Close");
    } else {
      this.isValid = true;
    }
    return this.isValid;
  }

  onChangeFromAccount(_data: any) {
    let _frmAcc = this.checkMfByAccId(_data.value);
    if (_frmAcc.is_mf == true) {
      this.isMf = true;
    } else {
      this.isMf = false;
    }
    this.toAcc = this.mainAccList.map(obj => ({ ...obj }));
    let _spliceIdx = this.toAcc.findIndex(_acc => _acc.id === _frmAcc.id);
    this.toAcc.splice(_spliceIdx, 1);
  }

  onChangeToAccount(_data: any) {
    this.fromAcc = this.mainAccList.map(obj => ({ ...obj }));
    let _toAcc = _data.value;
    let _spliceIdx = this.fromAcc.findIndex(_acc => _acc.id === _toAcc);
    this.fromAcc.splice(_spliceIdx, 1);
  }

  checkMfByAccId(_accId: string): any {
    return this.mainAccList.find(_acc => _acc.id === _accId);
  }

  onChangeMfScheme(_data: any) {

  }
}
