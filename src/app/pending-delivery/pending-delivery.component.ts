import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { Transaction } from '../model/transaction';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogImageViewContent } from '../transactions/transactions.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogGenericConfirmation } from '../auto-record-trans/auto-record-trans.component';

@Component({
  selector: 'app-pending-delivery',
  templateUrl: './pending-delivery.component.html',
  styleUrls: ['./pending-delivery.component.scss']
})
export class PendingDeliveryComponent implements OnInit {

  menuTopLeftPosition = { x: '0', y: '0' };
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  pendingDeliveries: Transaction[] = [];
  
  constructor(private appService: AppService, public dialog: MatDialog, private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.populateTransactions();
  }

  populateTransactions() {
    this.pendingDeliveries = [];
    var user_id = this.appService.getAppUserId;
    this.appService.showLoader();
    this.appService.getDeliveryTrans('{"user_id": ' + user_id + '}')
    .then(data => {
      if (data.dataArray === undefined) {
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
        _trans.is_delivery_order = item.is_delivery_order;
        _trans.is_delivered = item.is_delivered;
        _trans.acc_id = item.account_id;
        _trans.acc_name = item.account_name;
        _trans.cat_id = item.category_id;
        _trans.user_id = item.user_id;
        _trans.acc_balance = item.balance;
        _trans.receiptImgId = item.trans_receipt_image_id;
        this.pendingDeliveries.push(_trans);
      });
      this.appService.hideLoader();
    }, err => {
      this.handleRedirect("error?err=" + err);
      this.appService.hideLoader();
    }).catch(fault => {
      this.handleRedirect("error?fault=" + fault);
      this.appService.hideLoader();
    });
  }

  handleRedirect(uri: string) {
    window.location.href = uri;
  }

  getClassVal(value: any) {
    let _type = value.transType;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
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

  viewReceipt(item: any, evt: any) {
    evt.stopPropagation();
    this.appService.showLoader();
    this.appService.getReceiptImage({ "receipt_uid": item.receiptImgId }).then(resp => {
      let _bitmap_data = resp.dataArray[0].bitmap_data;
      item.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
      this.appService.hideLoader();
    }, err => {
      this.appService.showAlert("Error retrieving receipt image : " + JSON.stringify(err), "Close");
      this.appService.hideLoader();
    });
    const dialogRef = this.dialog.open(DialogImageViewContent, {
      data: item,
      id: 'dialog-image-elements',
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      item.previewUrl = null;
    });
  }

  markDeliveryOrder(item: any) {
    this.appService.showLoader();
    let _updTrans = {
      is_delivery_order: ((item.is_delivery_order == undefined || item.is_delivery_order == 0) ? true : false),
      trans_id: item.id
    };
    this.updateTrans(_updTrans);
  }

  setOrderDelivered(item: any) {
    this.openConfirmationDialog(item);
  }

  updateTrans(_obj_: any) {
    this.appService.updateTransaction([_obj_]).then(resp => {
      if (resp[0].success === true) {
        this.appService.showAlert("Transaction Updated Successfully.", "Close");
        this.populateTransactions();
      } else {
        this.appService.showAlert("Transaction Update Failed. Failure: " + JSON.stringify(resp[0]), "Close");
      }
      this.appService.hideLoader();
    }, err => {
      this.appService.showAlert("Transaction Update Failed. Error: " + JSON.stringify(err), "Close");
      this.appService.hideLoader();
    });
  }

  openConfirmationDialog(item: any) {
    item["dialogTitle"] = "Set this order as Delivered ?";
    item["dialogBody"] = "Are you sure you want to set this order as DELIVERED ?";
    item["dialogBtnText"] = "Set";
    const dialogRef = this.dialog.open(DialogGenericConfirmation, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) {
        this.appService.showLoader();
        let _updTrans = {
          is_delivered: true,
          trans_id: item.id
        };
        this.updateTrans(_updTrans);
      }
    });
  }
}
