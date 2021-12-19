import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { SaveTransaction } from '../model/transaction';

@Component({
  selector: 'app-map-eq',
  templateUrl: './map-eq.component.html',
  styleUrls: ['./map-eq.component.scss']
})
export class MapEqComponent implements OnInit {

  equities: any[] = [];
  accounts: any[] = [];
  eq: any = {};

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
    this.accounts = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_equity === '1');
    const fetchEquitiesResp = await this.appService.getAllStocks({});
    if (fetchEquitiesResp.success === true) {
      if (fetchEquitiesResp.response !== '200') {
        this.appService.showAlert("No Stocks found in the system");
        this.appService.hideLoader();
        return;
      }
      this.equities = fetchEquitiesResp.dataArray;
    }
    this.eq = {
      purchaseDate: new Date()
    }
    this.appService.hideLoader();
  }

  async mapStock(data: any) {
    if (data.accountId == undefined || data.accountId == null) {
      this.appService.showAlert("Account is not selected or invalid");
      return;
    }
    if (data.noOfShares == undefined || data.noOfShares == null || data.noOfShares == 0) {
      this.appService.showAlert("No. of Shares is blank or invalid");
      return;
    }
    if (data.purchasePrice == undefined || data.purchasePrice == null || data.purchasePrice == 0) {
      this.appService.showAlert("Price per share is blank or invalid");
      return;
    }
    if (data.purchaseDate == undefined || data.purchaseDate == null) {
      this.appService.showAlert("Purchase Date is blank or invalid");
      return;
    }
    if (data.stockSymbol == undefined || data.stockSymbol == null || data.invAmount == undefined || data.invAmount == null || Number(data.invAmount) === 0) {
      this.appService.showAlert("Company Stock is either not selected or invalid");
      return;
    }
    this.appService.showLoader();
    let inpObj = {
      stock_symbol: data.stockSymbol,
      stock_name: this.equities.filter(_eq => _eq.stock_symbol === data.stockSymbol)[0].stock_name,
      no_of_shares: Number(this.appService.roundUpAmount(data.noOfShares, 0)),
      purchase_date: this.appService.convertDate(data.purchaseDate),
      user_id: this.appService.getAppUserId,
      purchase_price: this.appService.roundUpAmt(data.purchasePrice),
      account_id: data.accountId,
      inv_amt: this.appService.roundUpAmt(data.invAmount)
    };
    const saveStockMappResp = await this.appService.saveStockMapping([inpObj]);
    if (saveStockMappResp[0].success !== true) {
      this.appService.showAlert(saveStockMappResp[0]);
      this.appService.hideLoader();
      return;
    }
    let trans = new SaveTransaction();
    trans.acc_id = inpObj.account_id;
    trans.amount = inpObj.inv_amt.toString();
    trans.date = inpObj.purchase_date;
    trans.desc = inpObj.no_of_shares + " shares of " + inpObj.stock_name + " mapped to account: " + this.accounts.filter((_acc: any) => _acc.account_id === inpObj.account_id)[0].account_name;
    trans.type = "CREDIT";
    trans.user_id = this.appService.getAppUserId.toString();
    const addTransResp = await this.appService.saveTransaction(JSON.stringify(trans));
    if (addTransResp.success !== true) {
      this.appService.showAlert(addTransResp);
      this.appService.hideLoader();
      return;
    }
    this.appService.showAlert("Stock Mapped !!!");
    this.eq = {};
    this.appService.hideLoader();
  }

  async onChangeEQ(data: any) {
    this.eq["cmp"] = '';
    this.eq["lastMarketDate"] = '';
    const fetchMfNavResp: any = await this.appService.fetchStockCMP(data.value);
    if (fetchMfNavResp.message.toUpperCase() === "SUCCESS") {
      this.eq["cmp"] = this.appService.roundUpAmt(fetchMfNavResp.data.pricecurrent);
      this.eq["lastMarketDate"] = this.appService.formatDate(this.appService.convertDate(fetchMfNavResp.data.lastupd));
    }
  }

  onChangePriceNumber(data: any) {
    let invAmount = this.appService.roundUpAmt(data.noOfShares * data.purchasePrice);
    this.eq["invAmount"] = invAmount;
  }

}
