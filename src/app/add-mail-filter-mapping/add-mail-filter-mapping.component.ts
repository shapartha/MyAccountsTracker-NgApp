import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Account } from '../model/account';

@Component({
  selector: 'app-add-mail-filter-mapping',
  templateUrl: './add-mail-filter-mapping.component.html',
  styleUrls: ['./add-mail-filter-mapping.component.scss']
})
export class AddMailFilterMappingComponent implements OnInit {

  obj: any = {};
  accounts: Account[] = [];

  constructor(public appService: AppService) { }

  ngOnInit(): void {
    this.initData();
  }

  async initData() {
    const allAccountsResp = await this.appService.getAllAccounts(JSON.stringify({ user_id: this.appService.getAppUserId }));
    allAccountsResp.dataArray.forEach((element: any) => {
      if (element.is_equity == false && element.is_mf == false) {
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
        this.accounts.push(_acc);
      }
    });
    this.appService.hideLoader();
  }

  async saveMapping() {
    if (this.validationJsonString(this.obj.debitConditions) && this.validationJsonString(this.obj.creditConditions)) {
      let _inp = {
        filter: this.obj.filterName,
        acc_id: this.obj.account_id,
        filter_function: this.obj.functionName,
        debit_conditions_json: this.obj.debitConditions,
        credit_conditions_json: this.obj.creditConditions
      }
      if (this.obj.debitConditions == undefined || this.obj.debitConditions == null || this.obj.debitConditions.trim() == "") {
        delete _inp.debit_conditions_json;
      }
      if (this.obj.creditConditions == undefined || this.obj.creditConditions == null || this.obj.creditConditions.trim() == "") {
        delete _inp.credit_conditions_json;
      }
      this.appService.showLoader();
      const saveFilterMappingResp = await this.appService.saveMailFilterMapping([_inp]);
      this.appService.hideLoader();
      if (saveFilterMappingResp[0].success && saveFilterMappingResp[0].response == '200') {
        this.appService.showAlert("Filter condition mapped successfully");
        this.obj = {};
      } else {
        this.appService.showAlert("Unable to save filter mapping");
      }
    } else {
      this.appService.showAlert("Conditions are not properly formatted in JSON");
    }
  }

  validationJsonString(data: string): boolean {
    let chkResult = false;
    if (data == undefined || data == null || data.trim() == "") {
      chkResult = true;
    } else {
      try {
        JSON.parse(data);
        chkResult = true;
      } catch (_e) { }
    }
    return chkResult;
  }

}
