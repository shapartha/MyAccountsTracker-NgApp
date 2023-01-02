import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { DialogDeleteContent, DialogUpdateContent } from '../home/home.component';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  noSearchItems: boolean = false;
  transactionSearchText: any;
  refreshTransactions: boolean = false;
  selectedAccount: string = "SEARCH";
  searchObj: any = {};
  rowCount: number = 0;
  searchText: any;
  menuTopLeftPosition = { x: '0', y: '0' };
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(public appService: AppService, private router: Router, public dialog: MatDialog, private domSanitizer: DomSanitizer) {
    if (this.router.getCurrentNavigation() != null) {
      let objQueryParams = this.router.getCurrentNavigation()!.extras.state;
      if (objQueryParams != undefined) {
        if (objQueryParams.queryParams.transactionSearch != undefined && objQueryParams.queryParams.transactionSearch != "") {
          this.transactionSearchText = objQueryParams.queryParams.transactionSearch;
          this.searchObj = {
            text: this.transactionSearchText,
            user_id: this.appService.getAppUserId
          };
        }
      } else {
        this.noSearchItems = true;
      }
    }
  }

  search(evt: any) {
    if (evt.keyCode == 13) {
      this.appService.searchRecords(this.searchText);
    }
  }

  recordCount(evt: any) {
    this.rowCount = evt.rowCount;
  }

  ngOnInit(): void {
    this.appService.hideLoader();
  }

  onContextMenuEvent(eventObj: any) {
    eventObj.evt.preventDefault();
    this.menuTopLeftPosition.x = eventObj.evt.clientX + 'px';
    this.menuTopLeftPosition.y = eventObj.evt.clientY + 'px';
    eventObj.itm.menuType = "Transaction";
    this.contextMenu.menuData = { 'item': eventObj.itm };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
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

  copyItem(item: any) {
    if (item.is_mf == true || item.is_equity == true) {
      this.appService.showAlert("Mutual Funds/Stocks " + (item.menuType == 'Account' ? "account" : "transaction") + " can't be copied as a new transaction.", "Close");
      return;
    }
    this.appService.handleTabChange({ path: 'add-trans' }, item);
  }
  
  openUpdateDialog(item: any) {
    item.newTransDesc = item.description;
    item.newTransDate = new Date(item.date);
    if (item.receiptImgId != null && item.receiptImgId != undefined && item.receiptImgId != 0) {
      item.imageId = item.receiptImgId;
      this.appService.showLoader();
      this.appService.getReceiptImage({ "receipt_uid": item.imageId }).then(resp => {
        let _bitmap_data = resp.dataArray[0].bitmap_data;
        item.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
        this.appService.hideLoader();
      }, err => {
        this.appService.showAlert("Error retrieving receipt image : " + JSON.stringify(err), "Close");
        this.appService.hideLoader();
      });
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
      if (item.refreshTransactions == true) {
        this.refreshTransactions = true;
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
        if (item.menuType === 'Transaction') {
          if (item.is_mf == true || item.is_equity == true) {
            this.appService.showAlert("Transactions can't be deleted. Please Redeem/Sell units to perform transactions", "Close");
            return;
          }
          this.appService.showLoader();
          this.appService.deleteTransaction([{ trans_id: item.id }]).then(data => {
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
                  this.refreshTransactions = true;
                  this.rowCount--;
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
