import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AppService, XIRR } from '../app.service';
import { MfTransHeaderTabs } from '../constant/header-tabs';
import { Account } from '../model/account';

@Component({
  selector: 'app-mf-dashboard',
  templateUrl: './mf-dashboard.component.html',
  styleUrls: ['./mf-dashboard.component.scss']
})
export class MfDashboardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedAccountObject: Account = {};
  @Output() selectedAccountObjectChange = new EventEmitter();
  @Input() selectedAccount: string = "";
  @Output() onContextMenuEvent = new EventEmitter();
  @Input() refreshTransactions: boolean = false;
  selectedTab: string = "mf-dashboard";
  @Output() refreshTransactionsChange = new EventEmitter();
  headerTabs: MfTransHeaderTabs = new MfTransHeaderTabs();
  currentTab: string = "Dashboard";
  mfMappings: any[] = [];
  investmentValuation: number = 0;
  investmentChange: number = 0;
  overallXirr: number = 0.00;
  apiRespData: any | any[];
  indices: any[] = [];
  subs: Subscription | undefined;

  constructor(public router: Router, public appService: AppService, public xirrService: XIRR) { }

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

  ngOnDestroy() {
    this.subs?.unsubscribe();
  }

  validateClass(val: number) {
    if (val < 0) {
      return 'negative-val';
    }
    return 'positive-val';
  }

  populateDashboard() {
    this.mfMappings = [];
    this.appService.showLoader();
    let _inpObj_ = {
      account_id: this.selectedAccountObject.id,
      user_id: this.appService.getAppUserId
    }
    this.appService.getMfSchemesByAccount(_inpObj_).then(resp => {
      this.appService.hideLoader();
      if (resp.success === true) {
        if (resp.response !== '200') {
          return;
        }
        resp.dataArray.forEach((element: any) => {
          let _item = {
            account_id: element.account_id,
            account_data: this.selectedAccountObject,
            avg_nav: element.avg_nav,
            inv_amt: element.inv_amt,
            nav_amt: element.nav_amt,
            nav_date: element.nav_date,
            scheme_code: element.scheme_code,
            scheme_name: element.scheme_name,
            units: element.units,
            user_id: element.user_id,
            curr_amt: '0',
            xirr_val: 0,
            abs_return: 0
          };
          _item.curr_amt = this.appService.formatAmountWithComma((_item.units * _item.nav_amt).toString());
          _item.nav_date = this.appService.formatDate(_item.nav_date);
          this.mfMappings.push(_item);
        });
        this.populateXIRR();
      } else {
        this.appService.showAlert(JSON.stringify(resp));
      }
    }, err => {
      this.appService.hideLoader();
      this.appService.showAlert(JSON.stringify(err));
    });
  }

  async populateXIRR() {
    this.appService.showLoader();
    this.mfMappings.forEach(async element => {
      let _inpObj_ = {
        scheme_code: element.scheme_code,
        account_id: element.account_id
      };
      const mfTransAscResp = await this.appService.getMfTransByAccSchemeAsc(_inpObj_);
      if (mfTransAscResp.success === true) {
        if (mfTransAscResp.response !== '200') {
          this.appService.hideLoader();
          return;
        }
        let _payments: number[] = [];
        let _days: Date[] = [];
        mfTransAscResp.dataArray.forEach((itm: any) => {
          if (itm.trans_type.toUpperCase() === 'CREDIT') {
            _payments.push(0 - itm.amount);
          } else {
            _payments.push(Number(this.appService.roundUpAmount(itm.amount)));
          }
          _days.push(new Date(itm.trans_date));
        });
        _payments.push(Number(this.appService.roundUpAmount(element.nav_amt * element.units)));
        _days.push(new Date(element.nav_date));
        
        let xirrVal = this.xirrService.getXirrVal(0.1, _payments, _days);
        if (isNaN(xirrVal) || !isFinite(xirrVal)) {
          xirrVal = 0.00;
        } else {
          xirrVal = Number(this.appService.roundUpAmount(xirrVal * 100));
        }
        element.xirr_val = xirrVal;
      } else {
        this.appService.showAlert(mfTransAscResp);
      }
      let _absYearlyReturn: number = 0;
      _absYearlyReturn = this.appService.roundUpAmt(((this.appService.formatStringValueToAmount(element.curr_amt) - element.inv_amt) / element.inv_amt) * 100);
      element.abs_return = _absYearlyReturn;
    });
    let _accInpObj_ = {
      account_id: this.selectedAccountObject.id,
      user_id: this.appService.getAppUserId
    }
    const mfTransResp = await this.appService.getMfTransByAcc(_accInpObj_);
    if (mfTransResp.success === true) {
      if (mfTransResp.response !== '200') {
        this.appService.hideLoader();
        return;
      }
      let _payments: number[] = [];
        let _days: Date[] = [];
        mfTransResp.dataArray.forEach((itm: any) => {
          if (itm.trans_type.toUpperCase() === 'CREDIT') {
            _payments.push(0 - itm.amount);
          } else {
            _payments.push(Number(this.appService.roundUpAmount(itm.amount)));
          }
          _days.push(new Date(itm.trans_date));
        });
        _payments.push(Number(this.appService.formatStringValueToAmount(this.selectedAccountObject.balance).toFixed(2)));
        _days.push(new Date());
        let xirrVal = this.xirrService.getXirrVal(0.1, _payments, _days);
        if (isNaN(xirrVal) || !isFinite(xirrVal)) {
          xirrVal = 0.00;
        } else {
          xirrVal = Number(this.appService.roundUpAmount(xirrVal * 100));
        }
        this.overallXirr = xirrVal;
    } else {
      this.appService.showAlert(mfTransResp);
    }
    this.appService.hideLoader();
  }

  ngOnInit(): void {
    this.populateDashboard();
    this.fetchStockIndicesVal();
  }

  handleTabChange(uri: any) {
    this.selectedTab = uri.path;
    this.currentTab = uri.name;
  }

  refreshMfData() {
    if (this.mfMappings.length <= 0) {
      this.appService.showAlert("No Mutual Funds are mapped with this account");
      return;
    }
    this.investmentValuation = 0;
    this.appService.showLoader();
    var counter = 0;
    this.appService.showLoader();
    this.mfMappings.forEach(element => {
      this.appService.fetchMfNav(element.scheme_code).then((resp: any) => {
        var _mappedMf_ = this.mfMappings.filter(mfMap => mfMap.scheme_code === element.scheme_code)[0];
        _mappedMf_.scheme_name = resp.meta.scheme_name;
        _mappedMf_.nav_amt = this.appService.roundUpAmount(resp.data[0].nav);
        _mappedMf_.nav_date = this.appService.formatDate(resp.data[0].date);
        _mappedMf_.curr_amt = this.appService.formatAmountWithComma(this.appService.roundUpAmount(resp.data[0].nav * _mappedMf_.units));
        this.investmentValuation += this.appService.formatStringValueToAmount(_mappedMf_.curr_amt);
        counter++;
        if (counter === this.mfMappings.length) {
          this.updateMfMapping();
          this.appService.hideLoader();
        }
      }, err => {
        this.appService.showAlert("Error Occurred Fetching Latest MF NAVs -> " + JSON.stringify(err));
        this.appService.hideLoader();
        return;
      });
    });
  }

  async updateMfMapping() {
    let _updObj_: any[] = [];
    this.mfMappings.forEach(element => {
      let _indObj_ = {
        account_id: element.account_id,
        avg_nav: element.avg_nav,
        inv_amt: element.inv_amt,
        units: element.units,
        nav_amt: element.nav_amt,
        nav_date: this.appService.getDate(element.nav_date),
        scheme_code: element.scheme_code
      }
      _updObj_.push(_indObj_);
    });
    this.investmentChange = Number(this.appService.roundUpAmount(this.investmentValuation - this.appService.formatStringValueToAmount(this.selectedAccountObject.balance)));
    if (this.investmentChange != 0) {
      this.apiRespData = await this.appService.updateMfMapping(_updObj_);
      if (this.validateMfMappingResponse(this.apiRespData)) {
          let _acc = {
            account_id: this.selectedAccountObject.id,
            balance: this.appService.roundUpAmt(this.investmentValuation),
            user_id: this.appService.getAppUserId
          };
          this.apiRespData = await this.appService.updateAccount([_acc]);
          if (this.apiRespData[0].success === true) {
            this.selectedAccountObject.balance = this.appService.formatAmountWithComma(_acc.balance.toFixed(2));
            this.selectedAccountObjectChange.emit(this.selectedAccountObject);
            let _inpData = {
              trans_amount : Math.abs(this.investmentChange).toString(),
              account_id : this.selectedAccountObject.id,
              trans_date : this.appService.convertDate(),
              trans_desc : "Periodic Profit/Loss",
              trans_type : (this.investmentChange < 0) ? "DEBIT" : "CREDIT",
              user_id : this.appService.getAppUserId.toString()
            }
            this.apiRespData = await this.appService.saveTransactionOnly([_inpData]);
            this.populateXIRR();
          } else {
            this.appService.showAlert(this.apiRespData);
          }
      } else {
        this.appService.showAlert("Validation of MF Mapping Update Response Failed !");
      }
    }
  }

  validateMfMappingResponse(data: any) {
    let _resp = true;
    data.forEach((element: any) => {
      if (element.response !== '200' && !!_resp) {
        _resp = false;
      }
    });
    return _resp;
  }

  onContextMenuMf(event: MouseEvent, item: any, type: string) {
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
