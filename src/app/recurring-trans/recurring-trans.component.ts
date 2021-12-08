import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { AppConstant } from '../constant/app-const';
import { HeaderTabs } from '../constant/header-tabs';

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
    const getAllRecurTransResp = await this.appService.getAllRecurringTrans({ user_id: this.appService.getAppUserId});
    if (getAllRecurTransResp.response === '200') {
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
          tooltipDisabled: (obj.account_name.length + ((obj.scheme_name !== undefined && obj.scheme_name !== null) ? obj.scheme_name.length : 0)) > 60 ? false : true
        };
        this.r_trans.push(_itm);
      });
    } else {
      this.appService.showAlert("Non-Success Response: " + JSON.stringify(getAllRecurTransResp), "Close");
    }
    this.appService.hideLoader();
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
    //
  }

  deleteItem(data: any) {
    //
  }

}
