import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router"
import { Category } from '../model/category';
import { HeaderTabs } from '../constant/header-tabs';
import { AppService } from '../app.service';
import { Account } from '../model/account';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  categories: Category[] = [];
  accounts: Account[] = [];
  currentTab: string = "Login";
  headerTabs: HeaderTabs = new HeaderTabs();
  selectedCategory: string = "";
  selectedAccount: string = "ALL";
  selectedAccountObject: Account = {};
  title = 'My Accounts Tracker';
  constructor(private router: Router, private appService: AppService, public dialog: MatDialog) {
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

  updateItem(item: any) {
    console.log(item);
  }

  deleteItem(item: any) {
    this.openDialog(item);
  }

  openDialog(item: any) {
    const dialogRef = this.dialog.open(DialogDeleteContent, {
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) {
        if (item.menuType === 'Account') {
          this.appService.showLoader();
          this.appService.deleteAccount([{ account_id : item.id}]).then(data => {
            if (data[0].response === '200') {
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
            if (data[0].response === '200') {
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
            if (data[0].response === '200') {
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
                if (data[0].response == '200') {
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

