import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { AppService } from '../app.service';
import { AppConstant } from '../constant/app-const';
import { HeaderTabs } from '../constant/header-tabs';
import { Account } from '../model/account';

@Component({
  selector: 'app-scheduled-trans',
  templateUrl: './scheduled-trans.component.html',
  styleUrls: ['./scheduled-trans.component.scss']
})
export class ScheduledTransComponent implements OnInit {

  rupeeSymbol: string = AppConstant.RUPEE_SYMBOL;
  headerTabs: HeaderTabs = new HeaderTabs();
  s_trans: any = [];
  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(public appService: AppService, public dialog: MatDialog, public domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.appService.showLoader();
    this.appService.getAllScheduledTrans({ user_id: this.appService.getAppUserId}).then(resp => {
      if (resp.response === '200') {
        resp.dataArray.forEach((obj: any) => {
          let _itm = {
            trans_id: obj.trans_id,
            trans_desc: obj.trans_desc,
            trans_date: this.appService.formatDate(obj.trans_date),
            trans_amount: this.appService.formatAmountWithComma(obj.trans_amount.toString()),
            account_id: obj.account_id,
            account_name: obj.account_name,
            trans_receipt_image_id: obj.trans_receipt_image_id,
            trans_type: obj.trans_type,
            is_equity: obj.is_equity,
            is_mf: obj.is_mf,
            mf_nav: obj.mf_nav,
            nav_amt: obj.nav_amt,
            nav_date: obj.nav_date,
            scheme_code: obj.scheme_code,
            scheme_name: obj.scheme_name,
            units: obj.units,
            avg_nav: obj.avg_nav,
            rec_date: null
          };
          if (obj.rec_date != null && obj.rec_date != undefined && obj.rec_date != "") {
            _itm.rec_date = obj.rec_date;
          }
          this.s_trans.push(_itm);
        });
      } else {
        this.appService.showAlert("Non-Success Response: " + JSON.stringify(resp), "Close");
      }
      this.appService.hideLoader();
    }, err => {
      this.appService.showAlert("Error => " + JSON.stringify(err), "Close");
      this.appService.hideLoader();
    });
  }

  handleTabChange(uri: any) {
    this.appService.handleTabChange(uri);
  }

  getClassVal(value: any) {
    let _type = value.trans_type;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }
  
  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = "Scheduled Transaction";
    item.description = item.trans_desc;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  updateItem(item: any) {
    this.openUpdateDialog(item);
  }

  deleteItem(item: any) {
    this.openDeleteDialog(item);
  }

  openDeleteDialog(item: any) {
    const dialogRef = this.dialog.open(DeleteDialogScheduleTrans, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) {
        if (item.menuType === 'Scheduled Transaction') {
          this.appService.showLoader();
          let _inpObj_ = {
            trans_id: item.trans_id,
            ops_mode: 2
          };
          this.appService.processScheduledTrans(_inpObj_).then((data: any) => {
            if (data.response === '200') {
              var _transToRemove = this.s_trans.findIndex((trns: any) => trns.trans_id === item.trans_id);
              this.s_trans.splice(_transToRemove, 1);
              this.appService.showAlert(item.menuType + " : " + item.description + " deleted successfully", "Close");
            } else {
              this.appService.showAlert("An error occurred | " + data.response + ":" + data.responseDescription, "Close");
            }
            this.appService.hideLoader();
          });
        }
      }
    });
  }

  openUpdateDialog(item: any) {
    if (item.menuType == "Scheduled Transaction") {
      let _accList_: Account[] = [];
      this.appService.showLoader();
      this.appService.getAllAccounts('{"user_id": ' + this.appService.getAppUserId + '}').then(data => {
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
            _accList_.push(_acc);
          }
        });
        this.appService.hideLoader();
      }, err => {
        this.appService.showAlert("Error Occurred while fetching accounts => " + JSON.stringify(err));
        this.appService.hideLoader();
      }).catch(fault => {
        this.appService.showAlert("Fault Occurred while fetching accounts => " + JSON.stringify(fault), "Close");
        this.appService.hideLoader();
      });

      item.newDesc = item.trans_desc;
      item.newAmount = this.appService.formatStringValueToAmount(item.trans_amount);
      item.newAccId = item.account_id;
      item.newDate = new Date(item.trans_date);
      if (item.trans_receipt_image_id !== null && item.trans_receipt_image_id !== undefined && item.trans_receipt_image_id !== 0) {
        item.imageId = item.trans_receipt_image_id;
        this.appService.getReceiptImage({"receipt_uid": item.imageId}).then(resp => {
          let _bitmap_data = resp.dataArray[0].bitmap_data;
          item.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
          this.appService.hideLoader();  
        }, err => {
          this.appService.showAlert("Error retrieving receipt image : " + JSON.stringify(err), "Close");
          this.appService.hideLoader();
        });
      }
      item.accList = _accList_;
      item.newMfId = item.scheme_code;
      item.newMfNav = item.mf_nav;
      item.mfSchemes = [];
      if (item.is_mf === '1') {
        this.appService.showLoader();
        this.appService.getMfSchemesByAccount({ account_id: item.newAccId }).then(data => {
          data.dataArray.forEach((element: any) => {
            item.mfSchemes.push(element);
          });
          this.appService.hideLoader();
        }, err => {
          this.appService.hideLoader();
          this.appService.showAlert("Error loading Mutual Fund Schemes. Try refreshing the page => " + JSON.stringify(err), "Close");
        }).catch(fault => {
          this.appService.hideLoader();
          this.appService.showAlert("Fault occurred while loading Mutual Fund schemes. Try refreshing the page => " + JSON.stringify(fault), "Close");
        });
      }
      if (item.rec_date !== null && item.rec_date !== undefined && item.rec_date !== '') {
        item.newReccDate = item.rec_date;
      }
    }
    const dialogRef = this.dialog.open(UpdateDialogScheduleTrans, {
      data: item,
      id: 'dialog-update-elements',
      width: '600px'
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && item.menuType === "Scheduled Transaction") {
        let _updatedItem_ = this.s_trans.filter((trns: any) => trns.trans_id === item.trans_id)[0];
        _updatedItem_.trans_desc = item.newDesc;
        _updatedItem_.trans_amount = this.appService.formatAmountWithComma(item.newAmount.toString());
        _updatedItem_.trans_date = this.appService.formatDate(this.appService.convertDate(item.newDate));
        _updatedItem_.account_id = item.newAccId;
        _updatedItem_.account_name = item.newAccName;
        _updatedItem_.scheme_code = item.newMfId;
        _updatedItem_.mf_nav = item.newMfNav;
        _updatedItem_.rec_date = item.newReccDate;
      }
    });
  }

}


@Component({
  selector: 'dialog-delete',
  templateUrl: '../dialog/dialog-delete.html',
})
export class DeleteDialogScheduleTrans {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}





@Component({
  selector: 'dialog-update',
  templateUrl: '../dialog/dialog-update-schedule-trans.html',
  styleUrls: ['./scheduled-trans.component.scss']
})
export class UpdateDialogScheduleTrans {
  
  monthDays: number[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public appService: AppService) {
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
  }

  onCloseDialog() {
    const dialogRef = this.dialog.getDialogById('dialog-update-elements');
    dialogRef?.close();
  }

  close(data: any) {
    const dialogRef = this.dialog.getDialogById('dialog-update-elements');
    if (dialogRef != undefined && dialogRef != null) {
      dialogRef.close({ data : data });
      this.appService.showAlert(data.menuType + " updated successfully", "Close");
    }
  }

  onChangeAcc(_data_: any) {
    let _newAcc = this.data.accList.filter((acc: any) => acc.id === _data_.value)[0];
    if (_newAcc.is_mf === '1') {
      this.data.mfSchemes = [];
      this.data.newMfNav = undefined;
      this.appService.showLoader();
      this.appService.getMfSchemesByAccount({ account_id: _newAcc.id }).then(data => {
        data.dataArray.forEach((element: any) => {
          this.data.mfSchemes.push(element);
        });
        this.appService.hideLoader();
      }, err => {
        this.appService.hideLoader();
        this.appService.showAlert("Error loading Mutual Fund Schemes. Try refreshing the page => " + JSON.stringify(err), "Close");
      }).catch(fault => {
        this.appService.hideLoader();
        this.appService.showAlert("Fault occurred while loading Mutual Fund schemes. Try refreshing the page => " + JSON.stringify(fault), "Close");
      });
    }
    this.data.is_mf = _newAcc.is_mf;
  }

  onChangeMfScheme(_data_: any) {
    let _newMf = this.data.mfSchemes.filter((mf: any) => mf.scheme_code === _data_.value)[0];
    if (_newMf == undefined) {
      this.data.newMfNav = undefined;
    } else {
      this.data.newMfNav = _newMf.nav_amt;
    }
  }

  onUpdateDialog(data: any) {
    if (data.menuType === "Scheduled Transaction") {
      if (data.newDesc == undefined || data.newDesc?.length! < 3) {
        this.appService.showAlert("Description must be atleast 3 characters", "Close");
        return;
      }
      if (data.newDate == undefined || data.newDate == null) {
        this.appService.showAlert("Date is invalid or blank.", "Close");
        return;
      }
      if (data.newAmount == undefined || data.newAmount == null) {
        this.appService.showAlert("Amount is invalid or blank.", "Close");
        return;
      }
      if (data.newAccId == undefined || data.newAccId == null) {
        this.appService.showAlert("Account is invalid or not selected.", "Close");
        return;
      }
      this.appService.showLoader();
      let _updTrans = {
        trans_desc: data.newDesc,
        trans_id: data.trans_id,
        trans_date: this.appService.convertDate(data.newDate),
        trans_amount: data.newAmount,
        account_id: data.newAccId,
        user_id: this.appService.getAppUserId,
        rec_date: null,
        scheme_code: null,
        mf_nav: null
      };
      if (data.is_mf === '1') {
        _updTrans.scheme_code = data.newMfId;
        _updTrans.mf_nav = data.newMfNav;
      }
      if (data.rec_date !== null && data.rec_date !== undefined && data.rec_date !== '') {
        _updTrans.rec_date = data.newReccDate;
      }
      this.appService.showLoader();
      this.appService.updateScheduledTrans([_updTrans]).then((resp: any) => {
        if (resp[0].response === '200') {
          data.newAccName = data.accList.filter((_acc: any) => _acc.id === data.newAccId)[0].name;
          this.appService.showAlert("Scheduled Transaction updated successfully.");
          this.appService.hideLoader();
          this.close(data);
        }
      }, err => {
        this.appService.showAlert("Error Occurred => " + JSON.stringify(err));
        this.appService.hideLoader();
      });
    }
  }
}