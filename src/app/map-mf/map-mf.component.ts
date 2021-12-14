import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { SaveTransaction } from '../model/transaction';

@Component({
  selector: 'app-map-mf',
  templateUrl: './map-mf.component.html',
  styleUrls: ['./map-mf.component.scss']
})
export class MapMfComponent implements OnInit {

  mutualFunds: any[] = [];
  accounts: any[] = [];
  mf: any = {};

  constructor(public appService: AppService) { }

  ngOnInit(): void {
    this.initData();
  }

  async initData() {
    const fetchAccResp = await this.appService.getAllAccounts(JSON.stringify({ user_id: this.appService.getAppUserId }));
    if (fetchAccResp.success === true) {} else {
      this.appService.showAlert("No accounts found in the system");
      this.appService.hideLoader();
      return;
    }
    this.accounts = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_mf === '1');
    const fetchMfSchemesResp = await this.appService.getAllMutualFunds({});
    if (fetchMfSchemesResp.success === true) {
      if (fetchMfSchemesResp.response !== '200') {
        this.appService.showAlert("No Mutual Funds found in the system");
        this.appService.hideLoader();
        return;
      }
      this.mutualFunds = fetchMfSchemesResp.dataArray;
    }
    this.mf = {
      purchaseDate: new Date()
    }
    this.appService.hideLoader();
  }

  async mapMutualFund(data: any) {
    if (data.accountId == undefined || data.accountId == null) {
      this.appService.showAlert("Account is not selected or invalid");
      return;
    }
    if (data.invAmount == undefined || data.invAmount == null || data.invAmount == 0) {
      this.appService.showAlert("Invested Amount is blank or invalid");
      return;
    }
    if (data.units == undefined || data.units == null || data.units == 0) {
      this.appService.showAlert("No. of Units is blank or invalid");
      return;
    }
    if (data.purchaseDate == undefined || data.purchaseDate == null) {
      this.appService.showAlert("Purchase Date is blank or invalid");
      return;
    }
    if (data.schemeCode == undefined || data.schemeCode == null || data.nav == undefined || data.nav == null) {
      this.appService.showAlert("Mutual Fund is not selected or invalid");
      return;
    }
    this.appService.showLoader();
    let inpObj = {
      scheme_code: data.schemeCode,
      scheme_name: this.mutualFunds.filter(_mf => _mf.scheme_code === data.schemeCode)[0].scheme_name,
      units: this.appService.roundUpAmount(data.units, 4),
      purchase_date: this.appService.convertDate(data.purchaseDate),
      nav_date: this.appService.convertDate(data.navDate),
      user_id: this.appService.getAppUserId,
      nav_amt: this.appService.roundUpAmt(data.nav),
      avg_nav: this.appService.roundUpAmt(data.avgNav),
      account_id: data.accountId,
      inv_amt: this.appService.roundUpAmt(this.appService.calculateMfInvestedAmount(data.invAmount, data.purchaseDate))
    };
    const checkExistMfMapRes = await this.appService.getMfSchemesByAccountScheme(inpObj);
    if (checkExistMfMapRes.success === true && checkExistMfMapRes.dataArray == undefined) {
      const saveMfMapResp = await this.appService.saveMfMapping([inpObj]);
      if (saveMfMapResp[0].success !== true) {
        this.appService.showAlert(saveMfMapResp[0]);
        this.appService.hideLoader();
        return;
      }
    }
    let _mfTransObj_ = {
      scheme_code: inpObj.scheme_code,
      account_id: inpObj.account_id,
      trans_date: inpObj.nav_date,
      units: inpObj.units,
      nav: inpObj.avg_nav,
      amount: inpObj.inv_amt,
      trans_type: 'CREDIT',
      balance_units: inpObj.units
    };
    const mfTransResp = await this.appService.saveMfTrans([_mfTransObj_]);
    if (mfTransResp[0].success !== true) {
      this.appService.showAlert(mfTransResp[0]);
      this.appService.hideLoader();
      return;
    }
    if (checkExistMfMapRes.success === true && checkExistMfMapRes.dataArray !== undefined) {
      let _updMfMapObj_ = {
        scheme_name: inpObj.scheme_name,
        nav_amt: inpObj.nav_amt,
        units: Number(inpObj.units) + Number(checkExistMfMapRes.dataArray[0].units),
        inv_amt: Number(inpObj.inv_amt) + Number(checkExistMfMapRes.dataArray[0].inv_amt),
        nav_date: inpObj.nav_date,
        avg_nav: 0,
        account_id: inpObj.account_id,
        scheme_code: inpObj.scheme_code
      };
      _updMfMapObj_.avg_nav = Number((_updMfMapObj_.inv_amt / _updMfMapObj_.units).toFixed(4));
      const updMfMapResp = await this.appService.updateMfMapping([_updMfMapObj_]);
      if (updMfMapResp[0].success !== true) {
        this.appService.showAlert(updMfMapResp[0]);
        this.appService.hideLoader();
        return;
      }
    }
    let trans = new SaveTransaction();
    trans.acc_id = inpObj.account_id;
    trans.amount = inpObj.inv_amt.toString();
    trans.date = inpObj.purchase_date;
    trans.desc = inpObj.scheme_name + " Mapped to Account: " + this.accounts.filter((_acc: any) => _acc.account_id === inpObj.account_id)[0].account_name;
    trans.type = "CREDIT";
    trans.user_id = this.appService.getAppUserId.toString();
    const addTransResp = await this.appService.saveTransaction(JSON.stringify(trans));
    if (addTransResp.success !== true) {
      this.appService.showAlert(addTransResp);
      this.appService.hideLoader();
      return;
    }
    this.appService.showAlert("Mutual Fund Mapped !!!");
    this.mf = {};
    this.appService.hideLoader();
  }

  async onChangeMF(data: any) {
    this.mf["nav"] = '';
    this.mf["navDate"] = '';
    const fetchMfNavResp: any = await this.appService.fetchMfNav(data.value);
    if (fetchMfNavResp.status.toUpperCase() === "SUCCESS") {
      this.mf["nav"] = this.appService.roundUpAmt(fetchMfNavResp.data[0].nav);
      this.mf["navDate"] = this.appService.formatDate(fetchMfNavResp.data[0].date);
    }
  }

  onChangeAmountUnits(data: any) {
    let _avg_nav = (this.mf.invAmount / this.mf.units);
    this.mf["avgNav"] = Number(this.appService.roundUpAmount(_avg_nav, 4));
  }

}
