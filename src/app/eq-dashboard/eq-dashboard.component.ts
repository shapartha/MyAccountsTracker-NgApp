import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { EqTransHeaderTabs } from '../constant/header-tabs';
import { Account } from '../model/account';

@Component({
  selector: 'app-eq-dashboard',
  templateUrl: './eq-dashboard.component.html',
  styleUrls: ['./eq-dashboard.component.scss']
})
export class EqDashboardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedAccountObject: Account = {};
  @Output() selectedAccountObjectChange = new EventEmitter();
  @Input() selectedAccount: string = "";
  @Output() onContextMenuEvent = new EventEmitter();
  @Input() refreshTransactions: boolean = false;
  @Output() refreshTransactionsChange = new EventEmitter();
  headerTabs: EqTransHeaderTabs = new EqTransHeaderTabs();
  selectedTab = "eq-dashboard";
  currentTab = "Dashboard";
  eqMappings: any[] = [];
  indices: any[] = [];
  subs: Subscription | undefined;

  constructor(public appService: AppService) { }

  ngOnDestroy() {
    this.subs?.unsubscribe();
  }

  ngOnInit(): void {
    this.populateDashboard();
    this.fetchStockIndicesVal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedAccount && !changes.selectedAccount.firstChange) {
      this.populateDashboard();
    }
    if (changes.refreshTransactions && changes.refreshTransactions.currentValue === true) {
      this.populateDashboard();
      this.refreshTransactions = false;
      this.refreshTransactionsChange.emit(this.refreshTransactions);
    }
  }

  invokeStockLiveApi(val: any) {
    this.appService.fetchStockLiveData(val).then((resp: any) => {
      let _respData = {
        pricecurrent: resp.data.pricecurrent,
        percentchange: resp.data.pricepercentchange,
        lastupd: resp.data.lastupd,
        symbolname: resp.data.company
      };
      this.indices.push(_respData);
    });
  }

  fetchStockIndicesVal() {
    this.indices = [];
    this.invokeStockLiveApi(AppService.STOCK_INDICES.SENSEX);
    this.invokeStockLiveApi(AppService.STOCK_INDICES.NIFTY);
    var obs = interval(10000);
    this.subs = obs.subscribe(_x => {
      this.indices = [];
      this.invokeStockLiveApi(AppService.STOCK_INDICES.SENSEX);
      this.invokeStockLiveApi(AppService.STOCK_INDICES.NIFTY);
    });
  }

  validateClass(val: number) {
    if (val < 0) {
      return 'negative-val';
    }
    return 'positive-val';
  }

  async populateDashboard() {
    this.eqMappings = [];
    this.appService.showLoader();
    let _inpObj_ = {
      account_id: this.selectedAccountObject.id,
      user_id: this.appService.getAppUserId
    };
    const getStockMapResp = await this.appService.getEqMappingByAccount(_inpObj_);
    this.appService.hideLoader();
    if (getStockMapResp.success === true) {
      if (getStockMapResp.response !== '200') {
        return;
      }
      getStockMapResp.dataArray.forEach((element: any) => {
        let _item = {
          account_id: element.account_id,
          account_data: this.selectedAccountObject,
          avg_price: this.appService.formatAmountWithComma(element.avg_price),
          inv_amt: this.appService.formatAmountWithComma(element.inv_amt),
          current_market_price: this.appService.formatAmountWithComma(element.current_market_price),
          purchase_date: this.appService.formatDate(element.purchase_date),
          stock_symbol: element.stock_symbol,
          stock_name: element.stock_name,
          no_of_shares: element.no_of_shares,
          user_id: element.user_id,
          curr_amt: '0',
          ann_return: 0,
          abs_return: 0
        };
        _item.curr_amt = this.appService.formatAmountWithComma((_item.no_of_shares * element.current_market_price).toString());
        _item.abs_return = this.appService.roundUpAmt((((_item.no_of_shares * element.current_market_price) / element.inv_amt) - 1) * 100);
        let _daydiff_ = this.appService.calculateDateDiff(element.purchase_date);
        _item.ann_return = (((_item.no_of_shares * element.current_market_price) - element.inv_amt) * 100 ) / (element.inv_amt * (_daydiff_/365));
        this.eqMappings.push(_item);
      });
      this.refreshEqData();
    } else {
      this.appService.showAlert(JSON.stringify(getStockMapResp));
    }
    this.appService.hideLoader();
  }

  handleTabChange(uri: any) {
    this.selectedTab = uri.path;
    this.currentTab = uri.name;
  }

  refreshEqData() {
    if (this.eqMappings.length <= 0) {
      this.appService.showAlert("No Stocks are mapped with this account");
      return;
    }
    let investmentValuation = 0;
    this.appService.showLoader();
    var counter = 0;
    this.eqMappings.forEach(element => {
      this.appService.fetchStockCMP(element.stock_symbol).then((resp: any) => {
        var _mappedEq_ = this.eqMappings.filter(eqMap => eqMap.stock_symbol === element.stock_symbol)[0];
        _mappedEq_.current_market_price = this.appService.roundUpAmount(resp.data.pricecurrent);
        _mappedEq_.curr_amt = this.appService.formatAmountWithComma((_mappedEq_.no_of_shares * resp.data.pricecurrent).toString());
        _mappedEq_.abs_return = this.appService.roundUpAmt((((_mappedEq_.no_of_shares * resp.data.pricecurrent) / this.appService.formatStringValueToAmount(_mappedEq_.inv_amt)) - 1) * 100);
        let _daydiff_ = this.appService.calculateDateDiff(_mappedEq_.purchase_date);
        _mappedEq_.ann_return = (((_mappedEq_.no_of_shares * resp.data.pricecurrent) - this.appService.formatStringValueToAmount(_mappedEq_.inv_amt)) * 100 ) / (this.appService.formatStringValueToAmount(_mappedEq_.inv_amt) * (_daydiff_/365));
        investmentValuation += this.appService.formatStringValueToAmount(_mappedEq_.curr_amt);
        counter++;
        if (counter === this.eqMappings.length) {
          this.updateEqMapping(investmentValuation, resp.data.lastupd);
          this.appService.hideLoader();
        }
      }, err => {
        this.appService.showAlert("Error Occurred Fetching Latest Stock Prices -> " + JSON.stringify(err));
        this.appService.hideLoader();
        return;
      });
    });
  }

  async updateEqMapping(investmentValuation: number, lastUpdate: string) {
    let _updObj_: any[] = [];
    this.eqMappings.forEach(element => {
      let _indObj_ = {
        current_market_price: element.current_market_price,
        last_market_date: lastUpdate.split(" ")[0],
        stock_symbol: element.stock_symbol
      }
      _updObj_.push(_indObj_);
    });
    let investmentChange = Number(this.appService.roundUpAmount(investmentValuation - this.appService.formatStringValueToAmount(this.selectedAccountObject.balance)));
    if (investmentChange != 0) {
      const apiResp = await this.appService.updateStockMaster(_updObj_);
      if (this.validateEqMappingResponse(apiResp)) {
        let _acc = {
          account_id: this.selectedAccountObject.id,
          balance: this.appService.roundUpAmt(investmentValuation),
          user_id: this.appService.getAppUserId
        };
        const apiRespAcc = await this.appService.updateAccount([_acc]);
        if (apiRespAcc[0].success === true) {
          this.selectedAccountObject.balance = this.appService.formatAmountWithComma(_acc.balance.toFixed(2));
          this.selectedAccountObjectChange.emit(this.selectedAccountObject);
          let _inpData = {
            trans_amount : Math.abs(investmentChange).toString(),
            account_id : this.selectedAccountObject.id,
            trans_date : this.appService.convertDate(),
            trans_desc : "Periodic Profit/Loss",
            trans_type : (investmentChange < 0) ? "DEBIT" : "CREDIT",
            user_id : this.appService.getAppUserId.toString()
          }
          const apiRespTrans = await this.appService.saveTransactionOnly([_inpData]);
          if (apiRespTrans[0].success === true) {
            this.appService.showAlert("Stock Data refreshed successfully")
          } else {
            this.appService.showAlert(apiRespTrans)
          }
        } else {
          this.appService.showAlert(apiRespAcc);
        }
      } else {
        this.appService.showAlert("Validation of Stocks Mapping Update Response Failed !");
      }
    }
  }

  validateEqMappingResponse(data: any) {
    let _resp = true;
    data.forEach((element: any) => {
      if (element.response !== '200' && !!_resp) {
        _resp = false;
      }
    });
    return _resp;
  }

  onContextMenuEq(event: MouseEvent, item: any, type: string) {
    let _emitObj = {
      evt: event,
      itm: item,
      typ: type
    }
    this.onContextMenuEvent.emit(_emitObj);
  }

  onContextMenu(_emitObj_: any) { 
    this.onContextMenuEvent.emit(_emitObj_);
  }

}
