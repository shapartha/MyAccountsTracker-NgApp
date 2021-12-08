import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstant } from './constant/app-const';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
    API_UPDATE_MF_MAPPING: string = "updateMfMapping";
    API_SAVE_TRANSACTION: string = "addTransactionProcess";
    API_SAVE_TRANSACTION_ONLY: string = "storeTrans";
    API_UPLOAD_RECEIPT: string = "storeReceipt";
    API_GET_RECEIPT: string = "getReceiptImage";
    API_SAVE_CATEGORY: string = "storeCategory";
    API_SAVE_ACCOUNT: string = "storeAccount";
    API_DELETE_ACCOUNT: string = "deleteAccount";
    API_DELETE_CATEGORY: string = "deleteCategory";
    API_DELETE_TRANSACTION: string = "deleteTrans";
    API_UPDATE_CATEGORY: string = "updateCategory";
    API_UPDATE_ACCOUNT: string = "updateAccount";
    API_UPDATE_TRANSACTION: string = "updateTrans";
    API_GET_ALL_SCHEDULED_TRANS: string = "getAllScheduledTrans";
    API_PROCESS_SCHEDULED_TRANS: string = "processScheduledTransaction";
    API_UPDATE_SCHEDULED_TRANS: string = "updateScheduledTrans";
    API_GET_MF_TRANS_BY_ACC_SCHEME_ASC: string = "getMfTransByAccountSchemeAscending";
    API_GET_MF_TRANS_BY_ACC_SCHEME: string = "getMfTransByAccountScheme";
    API_GET_MF_TRANS_BY_ACC: string = "getMfTransByAccount";
    API_SAVE_MF_TRANS: string = "storeMfTrans";
    API_UPDATE_MF_TRANS: string = "updateMfTrans";
    API_DELETE_MF_MAPPING: string = "deleteMfMapping";
    API_GET_ALL_RECUR_TRANS: string = "getRecTransByUser";
    API_UPDATE_RECUR_TRANS: string = "updateRecTrans";
    API_DELETE_RECUR_TRANS: string = "deleteRecTrans";
    static API_KEY: string = "tn4mzlCxWb7Ix90";
    appToken: string = "";
    appUserId: number = 0;
    API_FETCH_MF_NAV: string = "https://api.mfapi.in/mf/";

    constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
        if (this.getAppToken == "") {
            this.invokeTokenCall();
        }
    }

    getToken(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_TOKEN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams));
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

    roundUpAmount(amount: string | number, digitCount?: number) {
        if (typeof amount == 'string') {
            amount = Number(amount);
        }
        let _dCount = digitCount;
        if (_dCount === undefined || _dCount === null) {
            _dCount = 2;
        }
        return amount.toFixed(_dCount);
    }

    roundUpAmt(amount: string | number) {
        return Number(this.roundUpAmount(amount));
    }

    formatAmountWithComma(amount: string | number): string {
        if (typeof amount == 'number') {
            amount = amount.toString();
        }
        var amountVal = amount.split(".");
        var formattedAmount = Math.abs(parseInt(amountVal[0]));
        var isNegative = parseInt(amountVal[0]) < 0 ? "-" : "";
        var formattedAmountText = formattedAmount.toLocaleString();
        if (amountVal.length > 1) {
            return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText + "." + amountVal[1].substr(0, 2);
        } else {
            return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText + ".00";
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
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getAccountsByName(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ACCOUNTS_BY_NAME;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getCategory(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_CATEGORY;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams());
    }

    loginUser(apiFuncParams: any) {
        this.apiFuncName = this.API_USER_LOGIN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getAllTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_TRANS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getTransByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_TRANS_BY_ACCOUNT;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    getMfSchemesByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_SCHEMES_BY_ACCOUNT;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    updateMfMapping(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_MF_MAPPING;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    getAllAccounts(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_ACCOUNTS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams()).toPromise();
    }
    
    saveTransaction(apiFuncParams: any) {
        this.apiFuncName = this.API_SAVE_TRANSACTION;
        let _apiFuncParams = JSON.parse(apiFuncParams);
        let _formattedDateStr = _apiFuncParams.date.split("T")[0];
        _apiFuncParams.date = _formattedDateStr;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(_apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    saveTransactionOnly(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_SAVE_TRANSACTION_ONLY;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;
    }
    
    uploadReceiptImage(apiFuncParams: any) : Observable<any> {
        this.apiFuncName = this.API_UPLOAD_RECEIPT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        return this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams(),
        {'headers': headers});
    }

    getReceiptImage(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_GET_RECEIPT;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise; 
    }
    
    saveCategory(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_SAVE_CATEGORY;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
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
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    saveMfTrans(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_SAVE_MF_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    updateMfTrans(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_MF_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
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
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    deleteMfMapping(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_DELETE_MF_MAPPING;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
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
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
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
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    updateCategory(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_CATEGORY;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
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
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    updateTransaction(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_TRANSACTION;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    getAllScheduledTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_SCHEDULED_TRANS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    /**
     * 
     * @param apiFuncParams ops_mode : 1 - PROCESS, 2 - DELETE, 3 - POSTPONE
     */
    processScheduledTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_PROCESS_SCHEDULED_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;   
    }
    
    updateScheduledTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_UPDATE_SCHEDULED_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;   
    }
    
    getAllRecurringTrans(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_ALL_RECUR_TRANS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    updateRecTrans(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_UPDATE_RECUR_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }
    
    deleteRecTrans(apiFuncParams: any) : Promise<any> {
        this.apiFuncName = this.API_DELETE_RECUR_TRANS;
        const headers = { 
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
            {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise;       
    }

    fetchMfNav(schemeCode: any) {
        const headers = { 
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.get(this.API_FETCH_MF_NAV + schemeCode, {'headers': headers}).toPromise()
            .then(resp => {
                resolve(resp);
            }, err => {
                reject(err)
            });
        });
        return promise; 
    }
    
    getMfTransByAccSchemeAsc(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_TRANS_BY_ACC_SCHEME_ASC;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    getMfTransByAccScheme(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_TRANS_BY_ACC_SCHEME;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }
    
    getMfTransByAcc(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_TRANS_BY_ACC;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
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
        if (_temp[2].length == 4) {
            return _temp[0] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[2];
        }
        return _temp[2] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[0];
    }

    getDate(_currDate? : string): string {
        let _cDate: Date;
        if (_currDate === undefined || _currDate === null) {
            _cDate = new Date();
        } else {
            _cDate = new Date(_currDate);
        }
        return _cDate.getFullYear() + "-" + (_cDate.getMonth() + 1) + "-" + _cDate.getDate();
    }

    convertDate(_date?: any) {
        function pad(s: any) { return (s < 10) ? '0' + s : s; }
        var d = new Date();
        if (_date !== undefined && _date !== null) {
            d = new Date(_date);
        }
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
    }

    getMonthName(val: string): string {
        return AppConstant.MONTH[parseInt(val)];
    }

    showAlert(msg: string | object, actionTxt?: string) {
        if (actionTxt == undefined || actionTxt == null) {
            actionTxt = "Close";
        }
        if (typeof msg !== 'string') {
            msg = JSON.stringify(msg);
        }
        this.snackBar.open(msg, actionTxt);
        setTimeout(() => {
            this.snackBar.dismiss();
        }, 5000);
    }

    formatStringValueToAmount(amt: string | undefined) : number {
        if (amt === undefined) {
            return 0;
        }
        return parseFloat((amt.split(AppConstant.RUPEE_SYMBOL)[1]).replace(/,/g, ""));
    }

    handleTabChange(uri: any) {
      this.router.navigate([uri.path]);
    }

    getClassVal(value: any) {
      let _type = value;
      return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
    }
}


@Injectable({providedIn:'root'})
export class XIRR {
    constructor() {}
    private tol = 0.001;

    dateDiff(d1: Date, d2: Date) {
        let day = 24*60*60*1000;
        let diff = (d1.getTime() - d2.getTime());
        return diff/day;
    }

    f_xirr(p: number, dt: Date, dt0: Date, x: number) {
        let calcXirr = p * Math.pow((1.0 + x), (this.dateDiff(dt0,dt) / 365.0));
        return calcXirr;
    }

    df_xirr(p: number, dt: Date, dt0: Date, x: number) {
        return (1.0 / 365.0) * this.dateDiff(dt0,dt) * p * Math.pow((x + 1.0), ((this.dateDiff(dt0,dt) / 365.0) - 1.0));
    }

    total_f_xirr(payments: number[], days: Date[], x: number) {
        let resf = 0.0;
        for (var i = 0; i < payments.length; i++) {
            resf = resf + this.f_xirr(payments[i], days[i], days[0], x);
        }
        return resf;
    }

    total_df_xirr(payments: number[], days: Date[], x: number) {
        let resf = 0.0;
        for (var i = 0; i < payments.length; i++) {
            resf = resf + this.df_xirr(payments[i], days[i], days[0], x);
        }
        return resf;
    }

    getXirrVal(guess: number, payments: number[], days: Date[]) {
        let x0 = guess;
        let x1 = 0.0;
        let err = 1e+100;
        while (err > this.tol && x1 <= 100000) {
            var dfXirr = this.total_df_xirr(payments, days, x0);
            if (dfXirr == 0) {
                break;
            }
            x1 = x0 - this.total_f_xirr(payments, days, x0) / dfXirr;
            err = Math.abs(x1 - x0);
            x0 = x1;
        }
        return x0;
    }
}