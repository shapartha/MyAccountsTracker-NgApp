import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router"
import { Category } from '../model/category';
import { HeaderTabs } from '../constant/header-tabs';
import { AppService } from '../app.service';
import { Account } from '../model/account';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaveTransaction } from '../model/transaction';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  refreshTransactions: boolean = false;
  refreshMfTransactions: boolean = false;
  refreshPendSchTrans = false;
  refreshPendRecTrans = false;
  categories: Category[] = [];
  accounts: Account[] = [];
  currentTab: string = "Login";
  headerTabs: HeaderTabs = new HeaderTabs();
  selectedCategory: string = "";
  selectedAccount: string = "ALL";
  selectedAccountObject: Account = {};
  title = 'My Accounts Tracker';
  fileBitmap: any;
  constructor(private router: Router, private appService: AppService, public dialog: MatDialog, private domSanitizer: DomSanitizer) {
    this.currentTab = "Home";
    this.getAllCategories();
  }

  getAllCategories() {
    this.appService.showLoader();
    this.appService.getCategory('{"user_id":' + this.appService.getAppUserId + '}').subscribe(data => {
      console.log("Fetch Category API Success");
      if (data.success) {
        for (var i = 0; i < data.dataArray.length; i++) {
          let categoryAmt = 0;
          let _category = new Category();
          _category.name = data.dataArray[i].category_name;
          _category.id = data.dataArray[i].category_id;
          this.appService.getAccountsByCategory('{"category_id":' + _category.id + ',"user_id":' + this.appService.getAppUserId + '}').then(
            val => {
              console.log("Fetch Accounts API Success");
              if (val.success) {
                _category.accounts = [];
                for (var j = 0; j < val.dataArray.length; j++) {
                  categoryAmt += parseFloat(val.dataArray[j].balance);
                  let _account = new Account();
                  _account.id = val.dataArray[j].account_id;
                  _account.name = val.dataArray[j].account_name;
                  _account.category_id = val.dataArray[j].category_id;
                  _account.category_name = val.dataArray[j].category_name;
                  _account.balance = this.formatAmountWithComma((Math.round(val.dataArray[j].balance! * 100) / 100).toFixed(2));
                  _account.created_date = val.dataArray[j].created_date;
                  _account.updated_date = val.dataArray[j].updated_date;
                  _account.user_id = Number(val.dataArray[j].user_id);
                  _account.is_equity = Boolean(Number(val.dataArray[j].is_equity));
                  _account.is_mf = Boolean(Number(val.dataArray[j].is_mf));
                  _category.accounts.push(_account);
                }
                _category.amount = this.formatAmountWithComma((Math.round(categoryAmt * 100) / 100).toFixed(2));
                this.categories.push(_category);
              }
              this.appService.hideLoader();
            },
            err => {
              console.error(err);
              this.handleTabChange({path: 'error'});
              this.appService.hideLoader();
            }
          ).catch(fault => {
            console.error("Fault -> " + fault);
            this.handleTabChange({path: 'error'});
            this.appService.hideLoader();
          });
        }
      } else {
        this.handleTabChange({path: 'error'});
      }
    });
  }

  showAccounts(data: Category) {
    this.accounts = data.accounts!;
    this.selectedCategory = data.name;
    this.selectedAccount = "";
    this.selectedAccountObject = {};
  }

  clearCategory() {
    this.selectedAccount = "ALL";
    this.selectedAccountObject = {};
    this.selectedCategory = "";
    this.accounts = [];
  }

  showTransactions(data: Account) {
    this.selectedAccount = data.name!;
    this.selectedAccountObject = data;
  }

  clearAccount() {
    this.selectedAccount = "";
    this.selectedAccountObject = {};
  }

  onMfAccRefresh(data: any) {
    let _category = this.categories.filter(cat => cat.id === data.category_id)[0];
    let _categorySum = 0;
    _category.accounts?.forEach(element => {
      _categorySum += this.appService.formatStringValueToAmount(element.balance);
    });
    _category.amount = this.appService.formatAmountWithComma(_categorySum.toFixed(2));
  }

  formatAmountWithComma(amount: string): string {
    return this.appService.formatAmountWithComma(amount);
  }

  getClassVal(value: any) {
    return value.indexOf("-") != -1 ? 'negative-val' : 'positive-val'
  }

  handleTabChange(uri: any) {
    this.router.navigate([uri.path]);
    this.currentTab = uri.name;
  }

  ngOnInit(): void {
  }

  onContextMenuEvent(emitObj: any) {
    this.onContextMenu(emitObj.evt, emitObj.itm, emitObj.typ);
  }
  
  onContextMenu(event: MouseEvent, item: any, type: string) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = type;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  invokeSaveTransactionApi(_inpData: any) {
    this.appService.showLoader();
    this.appService.saveTransaction(JSON.stringify(_inpData)).then(resp => {
      if (resp.response !== "200") {
        this.appService.showAlert("Some error occurred while saving transaction. Please contact admin.", "Close");
      }
      this.refreshTransactions = true;
      this.appService.hideLoader();
    }, err => {
      console.error(err);
      this.appService.hideLoader();
      this.appService.showAlert("Error Occurred while Saving Transaction ! Please contact admin.", "Close");
    }).catch(fault => {
      console.error(fault);
      this.appService.hideLoader();
      this.appService.showAlert("Fault Occurred while Saving Transaction ! Please contact admin.", "Close");
    });
  }

  async processRecTransNow(item: any, edit?: number) {
    this.appService.showLoader();
    let _inpObj = {
      desc: item.rec_trans_desc,
      date: this.appService.convertDate(new Date()),
      amount: item.rec_trans_amount,
      rec_trans_id: item.rec_trans_id
    };
    if (edit !== undefined) {
      _inpObj.desc = item.newRecDesc;
      _inpObj.date = this.appService.convertDate(item.newRecTransExecDate);
      _inpObj.amount = this.appService.roundUpAmount(item.newRecAmt);
    }
    const completeRecTransResp = await this.appService.completeRecurTrans(_inpObj);
    if (completeRecTransResp.success === true) {
      this.refreshPendRecTrans = true;
      this.refreshTransactions = true;
      
      let _updCat = this.categories.filter(_cat => _cat.id === item.category_id)[0];
      let _updAct = _updCat.accounts!.filter(_acc => _acc.id === item.account_id)[0];
      let _trnAmt = Number(item.rec_trans_amount);
      if (item.rec_trans_type.toUpperCase() === 'CREDIT') {
        _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) + _trnAmt);
        _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) + _trnAmt);
      } else {
        _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) - _trnAmt);
        _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) - _trnAmt);
      }

      this.appService.showAlert("Recurring Transaction completed successfully.")
    } else {
      this.appService.showAlert(completeRecTransResp);
    }
    this.appService.hideLoader();
  }

  async skipRecTrans(data: any) {
    let _updTrans = {
      rec_trans_desc: data.rec_trans_desc,
      rec_trans_id: data.rec_trans_id,
      rec_trans_last_executed: this.appService.convertDate(new Date()),
      rec_trans_amount: data.rec_trans_amount,
      rec_account_id: data.rec_account_id,
      user_id: this.appService.getAppUserId,
      rec_trans_date: data.rec_trans_date,
      rec_mf_scheme_name: "0",
      rec_trans_executed: "true"
    };
    if (data.is_mf === '1') {
      _updTrans.rec_mf_scheme_name = data.rec_mf_scheme_name;
    }
    this.appService.showLoader();
    const updRecTransResp = await this.appService.updateRecTrans([_updTrans]);
    if (updRecTransResp[0].success === true) {
      this.refreshPendRecTrans = true;
      this.appService.showAlert("Recurring Transaction skipped for current occurrence successfully.");
    } else {
      this.appService.showAlert(updRecTransResp[0]);
    }
    this.appService.hideLoader();}

  async processSchTransNow(item: any) {
    this.appService.showLoader();
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 1
    };
    const procResp: any = await this.appService.processScheduledTrans(_inpObj_);
    if (procResp.success === true) {
      this.refreshPendSchTrans = true;
      this.refreshTransactions = true;
      
      let _updCat = this.categories.filter(_cat => _cat.id === item.category_id)[0];
      let _updAct = _updCat.accounts!.filter(_acc => _acc.id === item.account_id)[0];
      let _trnAmt = Number(item.trans_amount);
      if (item.trans_type.toUpperCase() === 'CREDIT') {
        _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) + _trnAmt);
        _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) + _trnAmt);
      } else {
        _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) - _trnAmt);
        _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) - _trnAmt);
      }

      this.appService.showAlert("Scheduled Transaction processed successfully");
    } else {
      this.appService.showAlert(procResp);
    }
    this.appService.hideLoader();
  }

  async removeSchTrans(item: any) {
    this.appService.showLoader();
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 2
    };
    const procResp: any = await this.appService.processScheduledTrans(_inpObj_);
    if (procResp.success === true) {
      this.refreshPendSchTrans = true;
      this.appService.showAlert("Scheduled Transaction removed successfully");
    } else {
      this.appService.showAlert(procResp);
    }
    this.appService.hideLoader();
  }

  async postponeSchTrans(item: any) {
    this.appService.showLoader();
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 3
    };
    const procResp: any = await this.appService.processScheduledTrans(_inpObj_);
    if (procResp.success === true) {
      this.refreshPendSchTrans = true;
      this.appService.showAlert("Scheduled Transaction postponed successfully");
    } else {
      this.appService.showAlert(procResp);
    }
    this.appService.hideLoader();
  }

  redeemAll(item: any) {
    item.redeemType = 'Fully';
    this.openRedeemDialog(item);
  }

  redeemPartial(item: any) {
    item.redeemType = 'Partially';
    this.openRedeemDialog(item);
  }

  updateItem(item: any) {
    this.openUpdateDialog(item);
  }

  deleteItem(item: any) {
    if (item.is_mf == true || item.is_equity == true) {
      this.appService.showAlert("Mutual Funds/Stocks " + (item.menuType == 'Account' ? "account" : "transaction") + " can't be deleted. Please Redeem/Sell units to perform transactions", "Close");
      return;
    }
    this.openDeleteDialog(item);
  }

  openRedeemDialog(item: any) {
    if (item.menuType === 'MF Dashboard') {
      item.rdmAmt = this.appService.formatStringValueToAmount(item.curr_amt);
      item.rdmUnits = item.units;
      item.rdmNav = item.nav_amt;
      item.rdmDte = new Date(item.nav_date);
    }
    const dialogRef = this.dialog.open(DialogRedeemContent, {
      data: item,
      id: 'dialog-redeem-elements'
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && item.menuType === 'MF Dashboard') {
        this.refreshMfTransactions = true;
        let _cat = this.categories.filter(_b => _b.id === this.selectedAccountObject.category_id)[0];
        let _accnt = this.accounts.filter((_a: any) => _a.id === this.selectedAccountObject.id)[0]
        _cat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_cat.amount) - 
                      (this.appService.formatStringValueToAmount(_accnt.balance) - result.data.newAccBalance));
        _accnt.balance = this.appService.formatAmountWithComma(this.appService.roundUpAmt(result.data.newAccBalance));
      }
    });
  }

  openUpdateDialog(item: any) {
    if (item.menuType == "Category") {
      item.newName = item.name;
    } else if (item.menuType == "Account") {
      item.newAccName = item.name;
      item.newAccBalance = this.appService.formatStringValueToAmount(item.balance);
      item.newAccCategory = item.category_id;
      item.categories = this.categories;
    } else if (item.menuType == "Transaction") {
      item.newTransDesc = item.description;
      item.newTransDate = new Date(item.date);
      if (item.receiptImgId != null && item.receiptImgId != undefined && item.receiptImgId != 0) {
        item.imageId = item.receiptImgId;
        this.appService.showLoader();
        this.appService.getReceiptImage({"receipt_uid": item.imageId}).then(resp => {
          let _bitmap_data = resp.dataArray[0].bitmap_data;
          item.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
          this.appService.hideLoader();  
        }, err => {
          this.appService.showAlert("Error retrieving receipt image : " + JSON.stringify(err), "Close");
          this.appService.hideLoader();
        });
      }
    } else if (item.menuType === 'Today Recurring Transaction') {
      item.newRecDesc = item.rec_trans_desc;
      item.newRecTransExecDate = new Date();
      item.newRecAmt = item.rec_trans_amount;
    }
    const dialogRef = this.dialog.open(DialogUpdateContent, {
      data: item,
      id: 'dialog-update-elements',
      width: '600px'
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) {
        return;
      }
      if (item.menuType === "Category") {
        let _category = this.categories.filter(cat => cat.id === result.data.id)[0];
        _category.name = result.data.newName;
      } else if (item.menuType === "Account") {
        let _account = this.accounts.filter(acc => acc.id === result.data.id)[0];
        if (_account.category_id != result.data.newAccCategory) {
          if (this.selectedAccount == _account.name) {
            this.selectedAccount = "";
          }
          let _currCat = this.categories.filter(cat => cat.id === result.data.category_id)[0];
          let _oldCatAmt = this.appService.formatStringValueToAmount(_currCat.amount) - this.appService.formatStringValueToAmount(_account.balance);
          _currCat.amount = this.appService.formatAmountWithComma(_oldCatAmt.toString());
          this.accounts.splice(this.accounts.findIndex(acc => acc.id === result.data.id), 1);
        }
        _account.name = result.data.newAccName;

        if (this.appService.formatStringValueToAmount(_account.balance) !== result.data.newAccBalance) {
          let _diffAmt = result.data.newAccBalance - this.appService.formatStringValueToAmount(_account.balance);
          let _trans = new SaveTransaction();
          _trans.amount = Math.abs(_diffAmt).toString();
          _trans.date = this.appService.convertDate(null);
          _trans.desc = "Adjustments";
          _trans.type = (_diffAmt < 0 ? "DEBIT" : "CREDIT");
          _trans.acc_id = _account.id;
          _trans.user_id = this.appService.getAppUserId.toString();
          this.invokeSaveTransactionApi(_trans);
          if (_account.category_id == result.data.newAccCategory) {
            let _currCat = this.categories.filter(cat => cat.id === _account.category_id)[0];
            _currCat.amount = this.appService.formatAmountWithComma((this.appService.formatStringValueToAmount(_currCat.amount) + _diffAmt).toString());
          }
        }
        _account.balance = this.appService.formatAmountWithComma(result.data.newAccBalance.toString());

        if (_account.category_id != result.data.newAccCategory) {
          _account.category_id = result.data.newAccCategory;
          _account.category_name = this.categories.filter(_cat => _cat.id === _account.category_id)[0].name;
          let _catgry = this.categories.filter(cat => cat.id === result.data.newAccCategory)[0];
          _catgry.amount = this.appService.formatAmountWithComma((this.appService.formatStringValueToAmount(_catgry.amount) + result.data.newAccBalance).toString());
          _catgry.accounts?.push(_account);
        }
      } else if (item.menuType === 'Transaction') {
        if (item.refreshTransactions == true) {
          this.refreshTransactions = true;
        }
      } else if (item.menuType === 'Today Recurring Transaction') {
        this.processRecTransNow(item, 1);
      }
    });
  }

  openDeleteDialog(item: any) {
    const dialogRef = this.dialog.open(DialogDeleteContent, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) {
        if (item.menuType === 'Account') {
          this.appService.showLoader();
          this.appService.deleteAccount([{ account_id : item.id}]).then(data => {
            if (data[0].success === true) {
              if (this.selectedAccount == this.accounts.filter(acc => acc.id === item.id)[0].name) {
                this.selectedAccount = "";
              }
              this.appService.showAlert(item.menuType + ":" + item.name + " deleted successfully", "Close");
              var _accToRemove = this.accounts.findIndex(acc => acc.id === item.id);
              this.accounts.splice(_accToRemove, 1);
            } else {
              this.appService.showAlert("An error occurred | " + data[0].response + ":" + data[0].responseDescription, "Close");
            }
            this.appService.hideLoader();
          });
        } else if (item.menuType === 'Category') {
          this.appService.showLoader();
          this.appService.deleteCategory([{ category_id : item.id}]).then(data => {
            if (data[0].success === true) {
              if (this.selectedCategory == this.categories.filter(cat => cat.id === item.id)[0].name) {
                this.selectedCategory = "";
                this.selectedAccount = "";
              }
              this.appService.showAlert(item.menuType + ":" + item.name + " deleted successfully", "Close");
              var _accsToRemove = this.accounts.filter(acc => acc.category_id === item.id);
              _accsToRemove.forEach(element => {
                var _accToRemove = this.accounts.findIndex(acct => acct.id === element.id);
                this.accounts.splice(_accToRemove, 1);
              });
              var _catToRemove = this.categories.findIndex(cat => cat.id === item.id);
              this.categories.splice(_catToRemove, 1);
            } else {
              this.appService.showAlert("An error occurred | " + data[0].response + ":" + data[0].responseDescription, "Close");
            }
            this.appService.hideLoader();
          });
        } else if (item.menuType === 'Transaction') {
          if (item.is_mf == true || item.is_equity == true) {
            this.appService.showAlert("Transactions can't be deleted. Please Redeem/Sell units to perform transactions", "Close");
            return;
          }
          this.appService.showLoader();
          this.appService.deleteTransaction([{ trans_id : item.id}]).then(data => {
            if (data[0].success === true) {
              if (item.transType.toUpperCase() == "DEBIT") {
                item.acc_balance = parseFloat(item.acc_balance) + this.appService.formatStringValueToAmount(item.amount);
              } else {
                item.acc_balance = parseFloat(item.acc_balance) - this.appService.formatStringValueToAmount(item.amount);
              }
              let _acc = {
                account_id: item.acc_id,
                account_name: item.acc_name,
                balance: item.acc_balance.toString(),
                user_id: item.user_id,
                category_id: item.cat_id
              };
              this.appService.updateAccount([_acc]).then(data => {
                if (data[0].success === true) {
                  this.appService.showAlert(item.menuType + ":" + item.description + " deleted successfully", "Close");
                  var _updCat = this.categories.filter(itm => itm.id === item.cat_id)[0];
                  var _updAccCat = _updCat.accounts?.filter(res => res.id === item.acc_id)[0];
                  var _newCatBalance = this.appService.formatStringValueToAmount(_updCat.amount) - this.appService.formatStringValueToAmount(_updAccCat?.balance!);
                  if (this.accounts.length > 0) {
                    var _updAcc = this.accounts.filter(itm => itm.id === item.acc_id)[0];
                    _updAcc.balance = this.formatAmountWithComma((Math.round(_acc.balance! * 100) / 100).toFixed(2));
                  }
                  _newCatBalance += parseFloat(_acc.balance);
                  _updCat.amount = this.formatAmountWithComma((Math.round(_newCatBalance * 100) / 100).toFixed(2));
                  this.refreshTransactions = true;
                } else {
                  this.appService.showAlert("Some Error occurred updating the account details.", "Close");
                }
                this.appService.hideLoader();
              });
            } else {
              this.appService.hideLoader();
              this.appService.showAlert("An error occurred | " + data[0].response + ":" + data[0].responseDescription, "Close");
            }
          });
        }
      }
    });
  }
}

@Component({
  selector: 'dialog-delete',
  templateUrl: '../dialog/dialog-delete.html',
})
export class DialogDeleteContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

@Component({
  selector: 'dialog-redeem',
  templateUrl: '../dialog/dialog-redeem.html',
  styleUrls: ['./home.component.scss']
})
export class DialogRedeemContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public appService: AppService) {}

  onCloseDialog() {
    const dialogRef = this.dialog.getDialogById('dialog-redeem-elements');
    dialogRef?.close();
  }

  async onRedeemDialog(data: any) {
    this.appService.showLoader();
    if (data.menuType === 'MF Dashboard') {
      let _transObj_ = {
        trans_desc : "Redeemed " + this.appService.formatAmountWithComma(data.rdmAmt.toFixed(2)) + " from " + data.scheme_name,
        trans_date : this.appService.convertDate(data.rdmDte),
        trans_amount : data.rdmAmt.toFixed(2),
        trans_type : "DEBIT",
        account_id : data.account_id,
        user_id : this.appService.getAppUserId.toString()
      };
      const transResp = await this.appService.saveTransactionOnly([_transObj_]);
      if (transResp[0].success === true) {
        let _accObj_ = {
          account_id: data.account_id,
          account_name: data.account_data.name,
          category_id: data.account_data.category_id,
          user_id: this.appService.getAppUserId,
          balance: this.appService.formatStringValueToAmount(data.account_data.balance) - data.rdmAmt
        };
        const accResp = await this.appService.updateAccount([_accObj_]);
        if (accResp[0].success === true) {
          let _mfTransObj_ = {
            scheme_code: data.scheme_code,
            account_id: data.account_id,
            trans_date: this.appService.convertDate(data.rdmDte),
            units: data.rdmUnits,
            nav: data.rdmNav,
            amount: data.rdmAmt,
            balance_units: 0.00
          };
          const mfTrans = await this.appService.saveMfTrans([_mfTransObj_]);
          let _inpObj_ = {
            account_id: data.account_id,
            scheme_code: data.scheme_code,
            user_id: this.appService.getAppUserId
          };
          let _balUnits = 0.0, _invAmt = 0.0;
          const getMfTransResp = await this.appService.getMfTransByAccScheme(_inpObj_);
          let _redeemedUnits = _mfTransObj_.units;
          let _toUpdateMfTrans : any[] = [];
          for (var x = 0; x < getMfTransResp.dataArray.length; x++) {
            let _b = getMfTransResp.dataArray[x];
            let _avlBalanceUnits = _b.balance_units;
            if (_avlBalanceUnits >= _redeemedUnits) {
              _avlBalanceUnits -= _redeemedUnits;
              _redeemedUnits = 0;
            } else {
              _redeemedUnits -= _avlBalanceUnits;
              _avlBalanceUnits = 0;
            }
            _b.balance_units = _avlBalanceUnits;
            _toUpdateMfTrans.push(_b);
            if (_redeemedUnits == 0) {
              break;
            }
          }
          const updMfTransResp = await this.appService.updateMfTrans(_toUpdateMfTrans);
          if (mfTrans[0].success === true && getMfTransResp.success === true && updMfTransResp[0].success === true) {
            if (data.redeemType === 'Partially') {
              const getMfTransResp = await this.appService.getMfTransByAccScheme(_inpObj_);
              getMfTransResp.dataArray.forEach((_a: any) => {
                _balUnits += this.appService.roundUpAmt(_a.balance_units);
                _invAmt += this.appService.roundUpAmt(_a.balance_units * _a.nav);
              });
              let _updMfMapObj_ = {
                scheme_name: data.scheme_name,
                nav_amt: data.nav_amt,
                units: _balUnits,
                inv_amt: _invAmt,
                nav_date: this.appService.convertDate(data.nav_date),
                avg_nav: Number((_invAmt / _balUnits).toFixed(4)),
                account_id: data.account_id,
                scheme_code: data.scheme_code
              };
              const updMfMapResp = await this.appService.updateMfMapping([_updMfMapObj_]);
              if (updMfMapResp[0].success === true) {
                this.appService.showAlert("Partial Redemption Successful");
                data.newInvAmt = _updMfMapObj_.inv_amt;
                data.newUnits = _updMfMapObj_.units;
                data.newAvgNav = _updMfMapObj_.avg_nav;
                data.newAccBalance = _accObj_.balance;
              } else {
                this.appService.showAlert(updMfMapResp[0]);
              }
            } else {
              let _deleteObj_ = {
                account_id: data.account_id,
                scheme_code: data.scheme_code
              };
              const deleteMfMapResp = await this.appService.deleteMfMapping([_deleteObj_]);
              if (deleteMfMapResp[0].success === true) {
                this.appService.showAlert("Full Redemption Successful");
                data.newAccBalance = _accObj_.balance;
              } else {
                this.appService.showAlert(deleteMfMapResp[0]);
              }
            }
          } else {
            this.appService.showAlert(mfTrans[0]);
          }
        } else {
          this.appService.showAlert(accResp[0]);
        }
      } else {
        this.appService.showAlert(transResp[0]);
      }
    }
    this.close(data);
    this.appService.hideLoader();
  }

  onChangeRedeemAmount(data: any) {
    data.rdmUnits = this.appService.formatStringValueToAmount(this.appService.formatAmountWithComma((data.rdmAmt / data.rdmNav).toString()));
  }

  close(data: any) {
    const dialogRef = this.dialog.getDialogById('dialog-redeem-elements');
    if (dialogRef != undefined && dialogRef != null) {
      dialogRef.close({ data : data });
    }
  }
}

@Component({
  selector: 'dialog-update',
  templateUrl: '../dialog/dialog-update.html',
  styleUrls: ['./home.component.scss']
})
export class DialogUpdateContent {
  fileUploadMessage: string = '';
  fileName = 'Replace file';
  fileType: any;
  currentFile: any;
  newPreviewUrl: any;
  fileBitmap: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public appService: AppService,
    public domSanitizer: DomSanitizer) {}

  onCloseDialog() {
    const dialogRef = this.dialog.getDialogById('dialog-update-elements');
    dialogRef?.close();
  }

  onUpdateDialog(data: any) {
    if (data.menuType === "Category") {
      if (data.newName.length < 3) {
        this.appService.showAlert("Valid Category Name required", "Close");
        return;
      }
      let _category = {
        category_id: data.id,
        category_name: data.newName,
        user_id: this.appService.getAppUserId
      };
      this.appService.showLoader();
      this.appService.updateCategory([_category]).then(resp => {
        if (resp[0].success === true) {
          this.close(data);
        } else {
          this.appService.showAlert(resp[0].responseDescription, "Close");
        }
        this.appService.hideLoader();
      }, err => {
        this.appService.showAlert(err, "Close");
        this.appService.hideLoader();
      });
    } else if (data.menuType === "Account") {
      if (data.newAccName == undefined || data.newAccName?.length! < 3) {
        this.appService.showAlert("Account name must be atleast 3 characters", "Close");
        return;
      }
      if (data.newAccCategory == undefined || data.newAccCategory == "") {
        this.appService.showAlert("Select a valid Category for the account", "Close");
        return;
      }
      if (data.newAccBalance == undefined) {
        this.appService.showAlert("Please enter the current balance. If no current balance, enter '0'", "Close");
        return;
      }
      let _acc = {
        account_id: data.id,
        account_name: data.newAccName,
        balance: data.newAccBalance.toString(),
        user_id: this.appService.getAppUserId,
        category_id: data.newAccCategory
      };
      this.appService.showLoader();
      this.appService.updateAccount([_acc]).then(resp => {
        if (resp[0].success === true) {
          this.close(data);
        } else {
          this.appService.showAlert("Some Error occurred updating the account details.", "Close");
        }
        this.appService.hideLoader();
      });
    } else if (data.menuType === "Transaction") {
      if (data.newTransDesc == undefined || data.newTransDesc?.length! < 3) {
        this.appService.showAlert("Description must be atleast 3 characters", "Close");
        return;
      }
      if (data.newTransDate == undefined || data.newTransDate == null) {
        this.appService.showAlert("Date is invalid or blank.", "Close");
        return;
      }
      this.appService.showLoader();
      if (this.newPreviewUrl !== null && this.newPreviewUrl !== undefined) {
        this.upload(data);
      } else {
        let _updTrans = {
          trans_desc: data.newTransDesc,
          trans_id: data.id,
          trans_date: this.appService.convertDate(data.newTransDate)
        };
        this.updateTrans(_updTrans, data);
      }
    } else if (data.menuType === 'Today Recurring Transaction') {
      if (data.newRecDesc == undefined || data.newRecDesc?.length! < 3) {
        this.appService.showAlert("Description must be atleast 3 characters", "Close");
        return;
      }
      if (data.newRecTransExecDate == undefined || data.newRecTransExecDate == null) {
        this.appService.showAlert("Date is invalid or blank.", "Close");
        return;
      }
      if (data.newRecAmt == undefined || data.newRecAmt == 0) {
        this.appService.showAlert("Amount is invalid or blank");
        return;
      }
      this.close(data);
    }
  }

  close(data: any) {
    const dialogRef = this.dialog.getDialogById('dialog-update-elements');
    if (dialogRef != undefined && dialogRef != null) {
      dialogRef.close({ data : data });
      this.appService.showAlert(data.menuType + " updated successfully", "Close");
    }
  }

  //#region File Upload
  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
      this.newPreviewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
      this.fileType = file.type;
      this.fileUploadMessage = "File selected for uploading"
    } else {
      this.currentFile = undefined;
      this.fileName = 'Replace File';
      this.newPreviewUrl = null;
      this.fileType = null;
      this.fileUploadMessage = '';
    }
  }

  _handleReaderLoaded(readerEvt: any) {
    var binaryString = readerEvt.target.result;
    this.fileBitmap = "data:" + this.fileType + ";base64," + btoa(binaryString);
  }
  
  updateTrans(_obj_: any, _data_: any) {
    this.appService.updateTransaction([_obj_]).then(resp => {
      if (resp[0].success === true) {
        this.appService.showAlert("Transaction Updated Successfully.", "Close");
        _data_.refreshTransactions = true;
        this.close(_data_);
      } else {
        this.appService.showAlert("Transaction Update Failed. Failure: " + JSON.stringify(resp[0]), "Close");
      }
      this.appService.hideLoader();
    }, err => {
      this.appService.showAlert("Transaction Update Failed. Error: " + JSON.stringify(err), "Close");
      this.appService.hideLoader();
    });
  }

  upload(_obj_: any) {
    let _inpObj = {
      bitmap_data: this.fileBitmap,
      created_at: this.appService.getDate()
    }
    this.appService.uploadReceiptImage(JSON.stringify(_inpObj)).subscribe(data => {
      console.log("Data -> " + JSON.stringify(data));
      let _updTrans = {
        trans_desc: _obj_.newTransDesc,
        trans_id: _obj_.id,
        trans_date: this.appService.convertDate(_obj_.newTransDate),
        trans_receipt_image_id: data.dataArray[0].receipt_id
      };
      this.updateTrans(_updTrans, _obj_);
    }, err => {
      console.error("Error -> " + JSON.stringify(err));
      this.appService.showAlert("Image Upload Failed due to Error", "Close");
      this.appService.hideLoader();
    });
  }
  //#endregion File Upload
}