import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstant } from './constant/app-const';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({providedIn:'root'})
export class AppService {
    apiServerUrl: string = "https://shapartha-android-zone.000webhostapp.com/accounts-tracker/api/";
    apiFuncName: string = "";
    API_GET_TOKEN: string = "getToken";
    API_GET_CATEGORY: string = "getCategoryUserId";
    API_GET_ACCOUNTS_BY_CATEGORY: string = "getAccountsByCategory";
    API_GET_ACCOUNTS_BY_NAME: string = "getAccountByName";
    API_GET_ALL_TRANS: string = "getTransByUser";
    API_GET_TRANS_BY_ACCOUNT: string = "getTransByAccount";
    API_USER_LOGIN: string = "getUserDataEmailPassword";
    API_GET_ALL_ACCOUNTS: string = "getAccountsByUser";
    API_GET_MF_SCHEMES_BY_ACCOUNT: string = "getMfMappingByAccount";
    API_SAVE_TRANSACTION: string = "addTransactionProcess";
    API_UPLOAD_RECEIPT: string = "storeReceipt";
    API_SAVE_CATEGORY: string = "storeCategory";
    API_SAVE_ACCOUNT: string = "storeAccount";
    API_DELETE_ACCOUNT: string = "deleteAccount";
    API_DELETE_CATEGORY: string = "deleteCategory";
    API_DELETE_TRANSACTION: string = "deleteTrans";
    API_UPDATE_ACCOUNT: string = "updateAccount";
    static API_KEY: string = "tn4mzlCxWb7Ix90";
    appToken: string = "";
    appUserId: number = 0;

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {
        if (this.getAppToken == "") {
            this.invokeTokenCall();
        }
    }

    getToken(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_TOKEN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams));
    }

    public get getAppToken() : string {
        return this.getCookie('app-token');
    }
    
    public set setAppToken(appToken : string) {
        this.setCookie("app-token", appToken, 2);
    }

    public get getAppUserId() : number {
        return parseInt(this.getCookie('app-user-id'));
    }
    
    public set setAppUserId(v : number) {
        this.setCookie("app-user-id", v, 2);
    }
    
    appendMandatoryParams(): string {
        let _apiJsonParams = "&apiKey=" + AppService.API_KEY;
        _apiJsonParams += "&apiToken=" + this.getAppToken;
        return _apiJsonParams;
    }

    formatAmountWithComma(amount: string): string {
      var amountVal = amount.split(".");
      var formattedAmount = Math.abs(parseInt(amountVal[0]));
      var isNegative = parseInt(amountVal[0]) < 0 ? "-" : "";
      var formattedAmountText = formattedAmount.toLocaleString();
      if (amountVal.length > 1) {
        return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText + "." + amountVal[1];
      } else {
        return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText;
      }
    }

    invokeTokenCall() {
        this.getToken('{"api_key":"' + AppService.API_KEY + '"}').subscribe(data => {
            if (data.success) {
                this.setAppToken = data.dataArray.token;
            }
        });
    }
    
    getAccountsByCategory(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ACCOUNTS_BY_CATEGORY;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getAccountsByName(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ACCOUNTS_BY_NAME;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getCategory(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_CATEGORY;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams());
    }

    loginUser(apiFuncParams: any) {
        this.apiFuncName = this.API_USER_LOGIN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getAllTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_TRANS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getTransByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_TRANS_BY_ACCOUNT;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getMfSchemesByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_SCHEMES_BY_ACCOUNT;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getAllAccounts(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_ACCOUNTS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    saveTransaction(apiFuncParams: any) {
        this.apiFuncName = this.API_SAVE_TRANSACTION;
        let _apiFuncParams = JSON.parse(apiFuncParams);
        let _formattedDateStr = _apiFuncParams.date.split("T")[0];
        _apiFuncParams.date = _formattedDateStr;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(_apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    uploadReceiptImage(apiFuncParams: any) : Observable<any> {
        this.apiFuncName = this.API_UPLOAD_RECEIPT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        return this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams(),
        {'headers': headers});
    }
    
    saveCategory(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_SAVE_CATEGORY;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    saveAccount(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_SAVE_ACCOUNT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    deleteCategory(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_DELETE_CATEGORY;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    deleteAccount(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_DELETE_ACCOUNT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    deleteTransaction(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_DELETE_TRANSACTION;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    updateAccount(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_ACCOUNT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }

    showLoader() {
        let _loaderDiv = document.getElementById("loader-container");
        let _displayStatus = _loaderDiv!.style.display;
        if (_displayStatus.toUpperCase() == "NONE") {
            _loaderDiv!.style.display = '';
        }
    }

    hideLoader() {
        let _loaderDiv = document.getElementById("loader-container");
        let _displayStatus = _loaderDiv!.style.display;
        if (_displayStatus.toUpperCase() != "NONE") {
            _loaderDiv!.style.display = 'none';
        }
    }

    //#region Cookie
    setCookie(name: string, value: any, days: number) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    getCookie(name: string) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return "";
    }
    eraseCookie(name: string) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    //#endregion Cookie
    
    formatDate(val: string): string {
        let _temp = val.split("-");
        return _temp[2] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[0];
    }

    getDate(): string {
        let _currDate = new Date();
        return _currDate.getFullYear() + "-" + (_currDate.getMonth() + 1) + "-" + _currDate.getDate();
    }

    convertDate(_date: any) {
        function pad(s: any) { return (s < 10) ? '0' + s : s; }
        var d = new Date();
        if (_date !== undefined) {
            d = new Date(_date);
        }
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
    }

    getMonthName(val: string): string {
        return AppConstant.MONTH[parseInt(val)];
    }

    showAlert(msg: string, actionTxt: string) {
      this.snackBar.open(msg, actionTxt);
    }

    formatStringValueToAmount(amt: string) : number {
        return parseFloat((amt.split(AppConstant.RUPEE_SYMBOL)[1]).replace(/,/g, ""));
    }
}