import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from "@angular/router"
import { SaveTransaction, Transaction } from '../model/transaction';
import { Account } from '../model/account';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add-trans',
  templateUrl: './add-trans.component.html',
  styleUrls: ['./add-trans.component.scss']
})
export class AddTransComponent implements OnInit {

  currentFile?: File;
  fileUploadMessage = '';
  fileName = 'Select File';

  isTransferTrans = false;
  isRecurringTrans = false;
  isMf = false;
  isMfSchemeSelected = false;
  selectedMfNavDate = "";
  trans: Transaction = {};
  mainAccList: Account[] = [];
  fromAcc: Account[] = [];
  toAcc: Account[] = [];
  monthDays: number[] = [];
  fromAccDetails: string = "";
  toAccDetails: string = "";
  reccDate: string = "";
  mfSchemeCode: string = "";
  mfSchemes: any[] = [];
  isValid: boolean = true;
  saveTransaction: SaveTransaction = {};
  saveTransactionTrans: SaveTransaction = {};
  previewUrl: any;
  fileBitmap: any;
  isGoBack = false;

  constructor(private appService: AppService, private router: Router, private domSanitizer: DomSanitizer) {
    this.appService.showLoader();
  }

  //#region File Upload
  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
      this.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt: any) {
    var binaryString = readerEvt.target.result;
    this.fileBitmap = btoa(binaryString);
    console.log(this.fileBitmap);
  }

  upload() {
    let _inpObj = {
      bitmap_data: this.fileBitmap,
      created_at: this.appService.getDate()
    }
    this.appService.uploadReceiptImage(JSON.stringify(_inpObj)).subscribe(data => {
      console.log("Data -> " + JSON.stringify(data));
      this.saveTransaction.image_path = data.dataArray[0].receipt_id;
      if (this.isTransferTrans) {
        this.saveTransactionTrans.image_path = data.dataArray[0].receipt_id;
      }
      this.uploadWithoutImage();
    }, err => {
      console.error("Error -> " + err);
      this.appService.showAlert("Image Upload Failed due to Error", "Close");
    });
  }
  //#endregion File Upload

  ngOnInit(): void {
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
    this.appService.getAllAccounts('{"user_id": ' + this.appService.getAppUserId + '}').then(data => {
      console.log("FETCH ALL ACCOUNTS Success");
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
          this.fromAcc.push(_acc);
        }
      });
      this.mainAccList = this.fromAcc.map(obj => ({ ...obj }));
      this.toAcc = this.fromAcc.map(obj => ({ ...obj }));
      this.appService.hideLoader();
    }, err => {
      this.handleRoute("error?" + err);
      this.appService.hideLoader();
    }).catch(fault => {
      this.handleRoute("error?" + fault);
      this.appService.hideLoader();
    });
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }

  saveTransAndGoBack(trans: Transaction) {
    this.isGoBack = true;
    this.saveTrans(trans);
  }

  saveTrans(trans: Transaction) {
    this.saveTransaction = {};
    this.saveTransactionTrans = {};
    if (this.validateForm()) {
      trans.acc_id = this.fromAccDetails;
      trans.user_id = this.appService.getAppUserId.toString();
      if (this.isTransferTrans) {
        this.saveTransactionTrans.amount = trans.amount;
        this.saveTransactionTrans.date = this.appService.convertDate(trans.date);
        this.saveTransactionTrans.desc = trans.description;
        this.saveTransactionTrans.type = "CREDIT";
        trans.transType = "DEBIT";
        this.saveTransactionTrans.acc_id = this.toAccDetails;
        this.saveTransactionTrans.user_id = trans.user_id;
        if (this.isRecurringTrans) {
          this.saveTransactionTrans.rec_date = this.reccDate;
        }
        if (this.isMf) {
          this.saveTransactionTrans.scheme_code = this.mfSchemeCode;
          this.saveTransactionTrans.mf_nav = trans.mfNav;
        }
      }
      this.saveTransaction.amount = trans.amount;
      this.saveTransaction.date = this.appService.convertDate(trans.date);
      this.saveTransaction.desc = trans.description;
      this.saveTransaction.type = trans.transType;
      this.saveTransaction.acc_id = trans.acc_id;
      this.saveTransaction.user_id = trans.user_id;
      if (this.isRecurringTrans) {
        this.saveTransaction.rec_date = this.reccDate;
      }
      if (this.isMf) {
        this.saveTransaction.scheme_code = this.mfSchemeCode;
        this.saveTransaction.mf_nav = trans.mfNav;
      }
      if (this.currentFile) {
        this.upload();
      } else {
        this.uploadWithoutImage();
      }
    }
  }

  uploadWithoutImage() {
    this.invokeSaveTransactionApi(this.saveTransaction);
    if (this.isTransferTrans) {
      this.invokeSaveTransactionApi(this.saveTransactionTrans);
    }
  }

  invokeSaveTransactionApi(_inpData: any) {
    this.appService.showLoader();
    this.appService.saveTransaction(JSON.stringify(_inpData)).then(resp => {
      if (resp.response == "200") {
        this.trans.amount = undefined;
        this.appService.showAlert("Saved Successfully", "Close");
      } else {
        this.appService.showAlert("Some error occurred while saving. Please try again.", "Close");
      }
      this.appService.hideLoader();
      if (this.isGoBack) {
        this.handleRoute("/home");
        this.isGoBack = false;
      }
    }, err => {
      console.error("Error -> " + err);
      this.appService.hideLoader();
      this.appService.showAlert("Error Occurred while Saving ! Please try again.", "Close");
    }).catch(fault => {
      console.error("Fault -> " + fault);
      this.appService.hideLoader();
      this.appService.showAlert("Fault Occurred while Saving ! Please try again.", "Close");
    });
  }

  validateForm(): any {
    this.isValid = false;
    if (this.trans.amount == undefined || this.trans.amount == null) {
      this.appService.showAlert("Amount cannot be blank or empty", "Close");
    } else if (this.trans.description == undefined || this.trans.description?.length! < 3) {
      this.appService.showAlert("Description must be atleast 3 characters", "Close");
    } else if (!this.isTransferTrans && (this.trans.transType == undefined || this.trans.transType == null)) {
      this.appService.showAlert("Please select the transaction type", "Close");
    } else if (this.trans.date == undefined || this.trans.date == null) {
      this.appService.showAlert("Date is invalid or blank", "Close");
    } else if (this.fromAccDetails == undefined || this.fromAccDetails == null || this.fromAccDetails == "") {
      this.appService.showAlert("From Account is invalid or blank", "Close");
    } else if (this.isTransferTrans && (this.toAccDetails == undefined || this.toAccDetails == null || this.toAccDetails == "")) {
      this.appService.showAlert("To Account is invalid or blank", "Close");
    } else if (this.isMf && (this.mfSchemeCode == undefined || this.mfSchemeCode == null || this.mfSchemeCode == "")) {
      this.appService.showAlert("For the selected MF Account, MF Scheme is invalid or blank", "Close");
    } else if (this.isMfSchemeSelected && (this.trans.mfNav == undefined || this.trans.mfNav == null || parseInt(this.trans.mfNav) == 0)) {
      this.appService.showAlert("For the selected MF Scheme, NAV Amount is invalid or blank", "Close");
    } else if (this.isRecurringTrans && (this.reccDate == undefined || this.reccDate == null || this.reccDate == "")) {
      this.appService.showAlert("Recurring Date is invalid or blank", "Close");
    } else {
      this.isValid = true;
    }
    return this.isValid;
  }

  populateMfSchemes(_accId: any) {
    this.mfSchemes = [];
    this.appService.showLoader();
    this.appService.getMfSchemesByAccount('{"account_id": ' + _accId + '}').then(data => {
      data.dataArray.forEach((element: any) => {
        this.mfSchemes.push(element);
      });
      this.appService.hideLoader();
    }, err => {
      console.error(err);
      this.appService.hideLoader();
      this.appService.showAlert("Error loading Mutual Fund Schemes. Try refreshing the page.", "Close");
    }).catch(fault => {
      console.error(fault);
      this.appService.hideLoader();
      this.appService.showAlert("Fault occurred while loading Mutual Fund schemes. Try refreshing the page.", "Close");
    });
  }

  onChangeFromAccount(_data: any) {
    let _frmAcc = this.checkMfByAccId(_data.value);
    let _isThisMf = false;
    let _toAcc = this.checkMfByAccId(this.toAccDetails);
    this.isMf = ((_toAcc != undefined && _toAcc.is_mf == "1") || _frmAcc.is_mf == "1");
    if (_frmAcc.is_mf == true) {
      _isThisMf = true;
      this.populateMfSchemes(_frmAcc.id);
    } else {
      _isThisMf = false;
    }
    this.toAcc = this.mainAccList.map(obj => ({ ...obj }));
    if (_isThisMf) {
      let filteredArr = this.toAcc.filter(_acc => _acc.is_mf === "1");
      filteredArr.forEach((element: any) => {
        let _spliceIdx = this.toAcc.findIndex(_acc => _acc.id === element.id);
        this.toAcc.splice(_spliceIdx, 1);
      });
    } else {
      let _spliceIdx = this.toAcc.findIndex(_acc => _acc.id === _frmAcc.id);
      this.toAcc.splice(_spliceIdx, 1);
    }
  }

  onChangeToAccount(_data: any) {
    let _toAcc = this.checkMfByAccId(_data.value);
    let _isThisMf = false;
    let _frmAcc = this.checkMfByAccId(this.fromAccDetails);
    this.isMf = ((_frmAcc != undefined && _frmAcc.is_mf == "1") || _toAcc.is_mf == "1");
    if (_toAcc.is_mf == true) {
      _isThisMf = true;
      this.populateMfSchemes(_toAcc.id);
    } else {
      _isThisMf = false;
    }
    this.fromAcc = this.mainAccList.map(obj => ({ ...obj }));
    if (_isThisMf) {
      let filteredArr = this.fromAcc.filter(_acc => _acc.is_mf === "1");
      filteredArr.forEach((element: any) => {
        let _spliceIdx = this.fromAcc.findIndex(_acc => _acc.id === element.id);
        this.fromAcc.splice(_spliceIdx, 1);
      });
    } else {
      let _spliceIdx = this.fromAcc.findIndex(_acc => _acc.id === _toAcc.id);
      this.fromAcc.splice(_spliceIdx, 1);
    }
  }

  checkMfByAccId(_accId: string): any {
    return this.mainAccList.find(_acc => _acc.id === _accId);
  }

  onChangeMfScheme(_data: any) {
    if (_data.value !== undefined) {
      this.isMfSchemeSelected = true;
      let _selectedScheme = this.mfSchemes.find(obj => obj.scheme_code === _data.value);
      this.selectedMfNavDate = _selectedScheme.nav_date;
      this.trans.mfNav = _selectedScheme.nav_amt;
    } else {
      this.isMfSchemeSelected = false;
    }
  }
}
