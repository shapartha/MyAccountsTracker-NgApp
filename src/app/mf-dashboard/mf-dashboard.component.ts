import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { HeaderTabs, MfTransHeaderTabs } from '../constant/header-tabs';
import { Account } from '../model/account';
import { SaveTransaction } from '../model/transaction';

@Component({
  selector: 'app-mf-dashboard',
  templateUrl: './mf-dashboard.component.html',
  styleUrls: ['./mf-dashboard.component.scss']
})
export class MfDashboardComponent implements OnInit, OnChanges {

  @Input() selectedAccountObject: Account = {};
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

  constructor(public router: Router, public appService: AppService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedAccount && !changes.selectedAccount.firstChange) {
      this.populateDashboard();
    }
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
      if (resp.response === '200') {
        resp.dataArray.forEach((element: any) => {
          let _item = {
            account_id: element.account_id,
            avg_nav: element.avg_nav,
            inv_amt: element.inv_amt,
            nav_amt: element.nav_amt,
            nav_date: element.nav_date,
            scheme_code: element.scheme_code,
            scheme_name: element.scheme_name,
            units: element.units,
            user_id: element.user_id,
            curr_amt: '0'
          };
          _item.curr_amt = this.appService.formatAmountWithComma((_item.units * _item.nav_amt).toString());
          _item.nav_date = this.appService.formatDate(_item.nav_date);
          this.mfMappings.push(_item);
        });
      } else {
        this.appService.showAlert(JSON.stringify(resp));
      }
    }, err => {
      this.appService.hideLoader();
      this.appService.showAlert(JSON.stringify(err));
    });
  }

  ngOnInit(): void {
    this.populateDashboard();
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
        }
        this.appService.hideLoader();
      }, err => {
        this.appService.showAlert("Error Occurred Fetching Latest MF NAVs -> " + JSON.stringify(err));
        this.appService.hideLoader();
        return;
      });
    });
  }

  updateMfMapping() {
    this.appService.showLoader();
    let _updObj_: any[] = [];
    this.mfMappings.forEach(element => {
      let _indObj_ = {
        account_id: element.account_id,
        avg_nav: element.avg_nav,
        inv_amt: element.inv_amt,
        units: element.units,
        nav_amt: element.nav_amt,
        nav_date: element.nav_date,
        scheme_code: element.scheme_code
      }
      _updObj_.push(_indObj_);
    });
    this.appService.updateMfMapping(_updObj_).then(resp => {
      if (this.validateMfMappingResponse(resp)) {
        this.updateAccountData();
      }
      this.appService.hideLoader();
    }, err => {
      this.appService.showAlert(err);
      this.appService.hideLoader();
    });
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

  updateAccountData() {
    this.investmentChange = Number(this.appService.roundUpAmount(this.investmentValuation - this.appService.formatStringValueToAmount(this.selectedAccountObject.balance)));
    if (this.investmentChange != 0) {
      let _acc = {
        account_id: this.selectedAccountObject.id,
        balance: this.investmentValuation,
        user_id: this.appService.getAppUserId
      };
      this.appService.showLoader();
      this.appService.updateAccount([_acc]).then(resp => {
        if (resp[0].response === '200') {
          this.addTransactionData(this.investmentChange);
        } else {
          this.appService.showAlert(resp);
        }
        this.appService.hideLoader();
      }, err => {
        this.appService.showAlert(err);
        this.appService.hideLoader();
      });
    }
  }

  addTransactionData(diffAmt: number) {
    let _inpData = new SaveTransaction();
    _inpData.amount = diffAmt.toString();
    _inpData.acc_id = this.selectedAccountObject.id;
    _inpData.date = this.appService.convertDate();
    _inpData.desc = "Periodic Profit/Loss";
    _inpData.type = (diffAmt < 0) ? "DEBIT" : "CREDIT";
    _inpData.user_id = this.appService.getAppUserId.toString();
    this.appService.saveTransaction(JSON.stringify(_inpData));
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
