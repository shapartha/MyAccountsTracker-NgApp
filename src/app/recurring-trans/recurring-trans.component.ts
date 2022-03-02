import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { AppConstant } from '../constant/app-const';
import { HeaderTabs } from '../constant/header-tabs';
import { Account } from '../model/account';

@Component({
  selector: 'app-recurring-trans',
  templateUrl: './recurring-trans.component.html',
  styleUrls: ['./recurring-trans.component.scss']
})
export class RecurringTransComponent implements OnInit {

  rupeeSymbol: string = AppConstant.RUPEE_SYMBOL;
  headerTabs: HeaderTabs = new HeaderTabs();
  r_trans: any = [];
  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(private appService: AppService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getInitData();
  }

  async getInitData() {
    this.appService.showLoader();
    const getAllRecurTransResp = await this.appService.getAllRecurringTrans({ user_id: this.appService.getAppUserId});
    if (getAllRecurTransResp.success === true) {
      if (getAllRecurTransResp.response !== '200') {
        this.appService.hideLoader();
        return;
      }
      getAllRecurTransResp.dataArray.forEach((obj: any) => {
        let _itm = {
          rec_trans_id: obj.rec_trans_id,
          rec_trans_desc: obj.rec_trans_desc,
          rec_trans_date: obj.rec_trans_date,
          rec_trans_amount: this.appService.formatAmountWithComma(obj.rec_trans_amount),
          account_id: obj.account_id,
          account_name: obj.account_name,
          balance: obj.balance,
          category_id: obj.category_id,
          rec_trans_type: obj.rec_trans_type,
          is_equity: obj.is_equity,
          is_mf: obj.is_mf,
          rec_trans_executed: obj.rec_trans_executed,
          rec_trans_last_executed_date: this.appService.formatDate(obj.rec_trans_last_executed),
          rec_mf_scheme_code: obj.rec_mf_scheme_name,
          rec_mf_scheme_name: obj.scheme_name,
          tooltipDisabled: true
        };
        try {
          _itm.tooltipDisabled = (obj.account_name.length + ((obj.scheme_name !== undefined && obj.scheme_name !== null) ? obj.scheme_name.length : 0)) > 60 ? false : true;
        } catch (e) {}
        this.r_trans.push(_itm);
      });
    } else {
      this.appService.showAlert("Non-Success Response: " + JSON.stringify(getAllRecurTransResp), "Close");
    }
    this.appService.hideLoader();
  }

  dynaClass(val: string) {
    if (val == "1") {
      return "r-transaction-item r-transaction-executed-item";
    } else {
      return "r-transaction-item";
    }
  }

  handleTabChange(uri: any) {
    this.appService.handleTabChange(uri);
  }

  getClassVal(value: any) {
    return this.appService.getClassVal(value.rec_trans_type);
  }
  
  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = "Recurring Transaction";
    item.description = item.rec_trans_desc;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  updateItem(data: any) {
    this.openUpdateDialog(data);
  }

  deleteItem(data: any) {
    this.openDeleteDialog(data);
  }

  async openUpdateDialog(item: any) {
    if (item.menuType == "Recurring Transaction") {
      let _accList_: Account[] = [];
      this.appService.showLoader();
      const getAllAccResp = await this.appService.getAllAccounts('{"user_id": ' + this.appService.getAppUserId + '}');
      getAllAccResp.dataArray.forEach((element: any) => {
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
      item.newDesc = item.rec_trans_desc;
      item.newAmount = this.appService.formatStringValueToAmount(item.rec_trans_amount);
      item.newAccId = item.account_id;
      item.newRecDate = item.rec_trans_date;
      item.newLastExecDate = new Date(item.rec_trans_last_executed_date);
      item.newTransExec = (item.rec_trans_executed === '1') ? true : false;
      item.accList = _accList_;
      item.newMfId = item.rec_mf_scheme_code;
      item.newIsMf = item.is_mf;
      item.mfSchemes = [];
      if (item.is_mf === '1') {
        const getMfSchemesResp = await this.appService.getMfSchemesByAccount({ account_id: item.newAccId });
        getMfSchemesResp.dataArray.forEach((element: any) => {
          item.mfSchemes.push(element);
        });
      }
      this.appService.hideLoader();
    }
    const dialogRef = this.dialog.open(UpdateDialogRecurringTrans, {
      data: item,
      id: 'dialog-update-elements',
      width: '600px'
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && item.menuType === "Recurring Transaction") {
        let _updatedItem_ = this.r_trans.filter((trns: any) => trns.rec_trans_id === item.rec_trans_id)[0];
        _updatedItem_.rec_trans_desc = item.newDesc;
        _updatedItem_.rec_trans_amount = this.appService.formatAmountWithComma(item.newAmount.toString());
        _updatedItem_.rec_trans_last_executed_date = this.appService.formatDate(this.appService.convertDate(item.newLastExecDate));
        _updatedItem_.account_id = item.newAccId;
        _updatedItem_.account_name = item.newAccName;
        _updatedItem_.rec_mf_scheme_code = item.newMfId;
        _updatedItem_.rec_mf_scheme_name = item.newMfName;
        _updatedItem_.rec_trans_date = item.newRecDate;
        _updatedItem_.rec_trans_executed = item.newTransExec;
        _updatedItem_.is_mf = item.newIsMf;
      }
    });
  }

  openDeleteDialog(item: any) {
    const dialogRef = this.dialog.open(DeleteDialogRecurringTrans, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(async result => {
      if (result !== true) {
        if (item.menuType === 'Recurring Transaction') {
          this.appService.showLoader();
          let _inpObj_ = {
            rec_trans_id: item.rec_trans_id
          };
          const deleteRecTransResp = await this.appService.deleteRecTrans([_inpObj_]);
          if (deleteRecTransResp[0].success === true) {
            var _transToRemove = this.r_trans.findIndex((trns: any) => trns.rec_trans_id === item.rec_trans_id);
            this.r_trans.splice(_transToRemove, 1);
            this.appService.showAlert(item.menuType + " : " + item.rec_trans_desc + " deleted successfully");
          } else {
            this.appService.showAlert("An error occurred | " + deleteRecTransResp[0].response + ":" + deleteRecTransResp[0].responseDescription);
          }
          this.appService.hideLoader();
        }
      }
    });
  }
}





@Component({
  selector: 'dialog-delete',
  templateUrl: '../dialog/dialog-delete.html',
})
export class DeleteDialogRecurringTrans {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}





@Component({
  selector: 'dialog-update',
  templateUrl: '../dialog/dialog-update-schedule-trans.html',
  styleUrls: ['./recurring-trans.component.scss']
})
export class UpdateDialogRecurringTrans {
  
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

  async onChangeAcc(_data_: any) {
    let item = _data_.d;
    let updates = _data_.e;
    let _newAcc = item.accList.filter((_acc: any) => _acc.id === updates.value)[0];
    _data_.d.id = _newAcc.id;
    _data_.d.name = _newAcc.name;
    _data_.d.balance = _newAcc.balance;
    _data_.d.category_id = _newAcc.category_id;
    _data_.d.category_name = _newAcc.category_name;
    _data_.d.is_equity = _newAcc.is_equity;
    _data_.d.newIsMf = _newAcc.is_mf;
    if (_newAcc.is_mf !== '1') {
      _data_.d.newMfId = null;
    } else {
      const getMfSchemes2Resp = await this.appService.getMfSchemesByAccount({ account_id: _newAcc.id });
      getMfSchemes2Resp.dataArray.forEach((element: any) => {
        _data_.d.mfSchemes.push(element);
      });
    }
    _data_.d.user_id = _newAcc.user_id;
  }

  onChangeMfScheme(_data_: any) {
  }

  async onUpdateDialog(data: any) {
    if (data.menuType === "Recurring Transaction") {
      if (data.newDesc == undefined || data.newDesc?.length! < 3) {
        this.appService.showAlert("Description must be atleast 3 characters", "Close");
        return;
      }
      if (data.newLastExecDate == undefined || data.newLastExecDate == null) {
        this.appService.showAlert("Last Executed Date is invalid or blank.", "Close");
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
      if (data.newRecDate == undefined || data.newRecDate == null) {
        this.appService.showAlert("Recurring Date is invalid or not selected.", "Close");
        return;
      }
      if (data.newIsMf === '1' && (data.newMfId == undefined || data.newMfId == null)) {
        this.appService.showAlert("Mutual Fund Scheme is invalid or not selected.", "Close");
        return;
      }
      let _updTrans = {
        rec_trans_desc: data.newDesc,
        rec_trans_id: data.rec_trans_id,
        rec_trans_last_executed: this.appService.convertDate(data.newLastExecDate),
        rec_trans_amount: data.newAmount,
        rec_account_id: data.newAccId,
        user_id: this.appService.getAppUserId,
        rec_trans_date: data.newRecDate,
        rec_mf_scheme_name: '0',
        rec_trans_executed: data.newTransExec.toString()
      };
      if (data.newIsMf === '1') {
        _updTrans.rec_mf_scheme_name = data.newMfId;
      }
      this.appService.showLoader();
      const updRecTransResp = await this.appService.updateRecTrans([_updTrans]);
      if (updRecTransResp[0].success === true) {
        data.newAccName = data.accList.filter((_acc: any) => _acc.id === data.newAccId)[0].name;
        data.newMfName = (data.newIsMf === '1') ? data.mfSchemes.filter((_mf: any) => _mf.scheme_code === data.newMfId)[0].scheme_name : null;
        this.appService.showAlert("Recurring Transaction updated successfully.");
        this.close(data);
      }
      this.appService.hideLoader();
    }
  }
}