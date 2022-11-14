import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstant } from './constant/app-const';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationExtras, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppService {
    apiServerUrl: string = "https://redirection-root-4755utlstq-el.a.run.app/";
    apiFuncName: string = "";
    API_GET_TOKEN: string = "getToken";
    GAPI_GET_APIKEY: string = "getApiKey";
    GAPI_GET_CLIENTID: string = "getClientId";
    API_GET_CATEGORY: string = "getCategoryUserId";
    API_GET_ACCOUNTS_BY_CATEGORY: string = "getAccountsByCategory";
    API_GET_ACCOUNTS_BY_NAME: string = "getAccountByName";
    API_GET_ALL_TRANS: string = "getTransByUser";
    API_GET_TRANS_BY_ACCOUNT: string = "getTransByAccount";
    API_USER_LOGIN: string = "getUserDataEmailPassword";
    API_GET_ALL_ACCOUNTS: string = "getAccountsByUser";
    API_GET_MF_SCHEMES_BY_ACCOUNT: string = "getMfMappingByAccount";
    API_GET_MF_SCHEMES_BY_ACCOUNT_SCHEME: string = "getMfMappingByAccountScheme";
    API_UPDATE_MF_MAPPING: string = "updateMfMapping";
    API_SAVE_MF_MAPPING: string = "storeMfMapping";
    API_UPDATE_EQ_MAPPING: string = "updateStockMapping";
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
    API_GET_TODAY_SCHEDULE_TRANS: string = "getScheduledTransToday";
    API_GET_TODAY_RECUR_TRANS: string = "getPendingRecTrans";
    API_COMPLETE_RECUR_TRANS: string = "completeRecurringTransactionProcess";
    API_GET_EQ_MAPPING_BY_ACC: string = "getStockMappingByAccount";
    API_GET_EQ_MAPPING_BY_ACC_SYM: string = "getStockMappingByAccountSymbol";
    API_UPDATE_STOCK: string = "updateStock";
    API_GET_ALL_MF: string = "getAllMf";
    API_GET_ALL_STOCKS: string = "getAllStocks";
    API_SAVE_STOCK_MAPPING: string = "storeStockMapping";
    API_DELETE_STOCK: string = "deleteStock";
    API_SAVE_STOCK: string = "storeStock";
    API_SAVE_MF: string = "storeMf";
    API_DELETE_MF: string = "deleteMf";
    API_GET_ALL_MAIL_FILTER_MAPPING: string = "getAllMailFilterMappings";
    API_GET_MAIL_FILTER_MAPPING_BY_FILTER: string = "getMailFilterMappingByFilter";
    API_GET_MAIL_FILTER_MAPPING_BY_ACC: string = "getMailFilterMappingByAccId";
    API_UPDATE_MAIL_FILTER_MAPPING: string = "updateMailFilterMapping";
    API_DELETE_MAIL_FILTER_MAPPING: string = "deleteMailFilterMapping";
    API_SAVE_MAIL_FILTER_MAPPING: string = "storeMailFilterMapping";
    API_SEARCH_TRANSACTION: string = "searchTransactions";
    API_COOKIE_SAVE: string = "saveCookie";
    API_COOKIE_UPDATE: string = "updateCookie";
    API_COOKIE_DELETE: string = "deleteCookie";
    API_COOKIE_GET: string = "getCookie";
    static API_KEY: string = "tn4mzlCxWb7Ix90";
    appToken: string = "";
    appUserId: number = 0;
    API_FETCH_MF_NAV: string = "https://api.mfapi.in/mf/";
    API_FETCH_STOCK_CMP: string = "https://priceapi.moneycontrol.com/pricefeed/bse/equitycash/";
    API_FETCH_STOCK_LIVE_DATA: string = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/";
    static STOCK_INDICES = {
        SENSEX: 'in%3BSEN',
        NIFTY: 'in%3BNSX'
    };

    constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
        if (this.getAppToken == "") {
            this.invokeTokenCall();
        }
    }

    getToken(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_TOKEN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams));
    }

    public get getAppToken(): string {
        return this.getCookie('app-token');
    }

    public set setAppToken(appToken: string) {
        this.setCookie("app-token", appToken, 2);
    }

    public get getAppUserId(): number {
        return parseInt(this.getCookie('app-user-id'));
    }

    public set setAppUserId(v: number) {
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

    searchTransactions(apiFuncParams: any) {
        this.apiFuncName = this.API_SEARCH_TRANSACTION;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    getMfSchemesByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_MF_SCHEMES_BY_ACCOUNT;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    getMfSchemesByAccountScheme(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_MF_SCHEMES_BY_ACCOUNT_SCHEME;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        })
        return promise;
    }

    saveMfMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_MF_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateMfMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_MF_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    getEqMappingByAccount(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_EQ_MAPPING_BY_ACC;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    getEqMappingByAccountSymbol(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_EQ_MAPPING_BY_ACC_SYM;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    updateEqMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_EQ_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
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

    saveTransactionOnly(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_TRANSACTION_ONLY;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    uploadReceiptImage(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_UPLOAD_RECEIPT;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        return this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(apiFuncParams) + this.appendMandatoryParams(),
            { 'headers': headers });
    }

    getReceiptImage(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_RECEIPT;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveCategory(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_CATEGORY;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveAccount(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_ACCOUNT;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveMfTrans(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_MF_TRANS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateMfTrans(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_MF_TRANS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteCategory(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_CATEGORY;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteMfMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_MF_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteAccount(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_ACCOUNT;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteTransaction(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_TRANSACTION;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateCategory(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_CATEGORY;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateAccount(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_ACCOUNT;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateTransaction(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_TRANSACTION;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
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

    getScheduledTransToday(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_TODAY_SCHEDULE_TRANS;
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
                { 'headers': headers }).toPromise()
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
                { 'headers': headers }).toPromise()
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

    getRecurringTransToday(apiFuncParams: any) {
        this.apiFuncName = this.API_GET_TODAY_RECUR_TRANS;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
    }

    completeRecurTrans(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_COMPLETE_RECUR_TRANS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateRecTrans(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_RECUR_TRANS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteRecTrans(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_RECUR_TRANS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
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
            this.http.get(this.API_FETCH_MF_NAV + schemeCode, { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    fetchStockCMP(stockSymbol: any) {
        const headers = {
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.get(this.API_FETCH_STOCK_CMP + stockSymbol, { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    fetchStockLiveData(stockSymbol: any) {
        const headers = {
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.get(this.API_FETCH_STOCK_LIVE_DATA + stockSymbol, { 'headers': headers }).toPromise()
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

    updateStockMaster(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_STOCK;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    getAllMutualFunds(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_ALL_MF;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    calculateMfInvestedAmount(transAmt: number, transDate: string | Date) {
        try {
            if (typeof transDate === 'string') {
                transDate = new Date(transDate);
            }
            let cutOffDt: Date = new Date('2020-07-01');
            if (transDate >= cutOffDt) {
                return 0.99995 * transAmt;
            } else {
                return transAmt;
            }
        } catch (e: any) {
            this.showAlert(e);
            return transAmt;
        }
    }

    getAllStocks(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_ALL_STOCKS;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveStockMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_STOCK_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteStock(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_STOCK;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveStock(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_STOCK;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveMutualFund(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_MF;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteMutualFund(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_MF;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    getAllMailFilterMappings(): Promise<any> {
        this.apiFuncName = this.API_GET_ALL_MAIL_FILTER_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams={}" + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    getMailFilterMappingByFilter(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_MAIL_FILTER_MAPPING_BY_FILTER;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    getMailFilterMappingByAccId(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_GET_MAIL_FILTER_MAPPING_BY_ACC;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    saveMailFilterMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_SAVE_MAIL_FILTER_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateMailFilterMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_UPDATE_MAIL_FILTER_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteMailFilterMapping(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_DELETE_MAIL_FILTER_MAPPING;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    async getServerCookie(_name: any) {
        this.apiFuncName = this.API_COOKIE_GET;
        let apiFuncParams = {
            name: _name
        };
        var cookieVal = "";
        const apiResp = await this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams()).toPromise();
        if (apiResp != undefined && apiResp.success) {
            var tsVal = new Date(apiResp.dataArray[0].expiry);
            if (tsVal >= new Date()) {
                cookieVal = apiResp.dataArray[0].value;
            }
        }
        return cookieVal;
    }

    setServerCookie(_name: any, _val: any, _exp: any): Promise<any> {
        this.apiFuncName = this.API_COOKIE_SAVE;
        let apiFuncParams = {
            name: _name,
            value: _val,
            expiry: _exp
        };
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    updateServerCookie(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_COOKIE_UPDATE;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    deleteServerCookie(apiFuncParams: any): Promise<any> {
        this.apiFuncName = this.API_COOKIE_DELETE;
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };
        let promise = new Promise((resolve, reject) => {
            this.http.post(this.apiServerUrl, "apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + this.appendMandatoryParams(),
                { 'headers': headers }).toPromise()
                .then(resp => {
                    resolve(resp);
                }, err => {
                    reject(err)
                });
        });
        return promise;
    }

    async getGApiDetails(): Promise<boolean> {
        let status = false;
        try {
            this.apiFuncName = this.GAPI_GET_APIKEY;
            let apiKeyStatus = await this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent('{"api_key":"' + AppService.API_KEY + '"}')).toPromise();
            if (apiKeyStatus.success === true) {
                this.setCookie('gapi_apikey', apiKeyStatus.dataArray.apiKey, 1);
            }
            this.apiFuncName = this.GAPI_GET_CLIENTID;
            let clientIdStatus = await this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURIComponent(this.apiFuncName) + "&apiFunctionParams=" + encodeURIComponent('{"api_key":"' + AppService.API_KEY + '"}')).toPromise();
            if (clientIdStatus.success === true) {
                this.setCookie('gapi_clientid', clientIdStatus.dataArray.clientId, 1);
            }
            status = true;
        } catch (e) {
            console.error(e);
        }
        return status;
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
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    getCookie(name: string) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return "";
    }
    eraseCookie(name: string) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    //#endregion Cookie

    //#region Session Storage
    getSessionStorageData(key: string) {
        return sessionStorage.getItem(key);
    }
    
    setSessionStorageData(key: string, value: string) {
        return sessionStorage.setItem(key, value);
    }
    
    removeSessionStorageData(key: string) {
        return sessionStorage.removeItem(key);
    }
    //#endregion

    formatDate(val: string): string {
        let _temp = val.split("-");
        if (_temp[2].length == 4) {
            return _temp[0] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[2];
        }
        return _temp[2] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[0];
    }

    getDate(_currDate?: string): string {
        let _cDate: Date;
        if (_currDate === undefined || _currDate === null) {
            _cDate = new Date();
        } else {
            _cDate = new Date(_currDate);
        }
        return _cDate.getFullYear() + "-" + this.padLeadingZero(_cDate.getMonth() + 1) + "-" + this.padLeadingZero(_cDate.getDate());
    }

    padLeadingZero(s: any) {
        return (s < 10) ? '0' + s : s;
    }

    convertEmailDate(_dateStr: string): string {
        var __parts = _dateStr.split(" ");
        let _time = __parts[1];
        let _date = __parts[0];
        let __date_parts = _date.split("-");
        if (_time != undefined) {
            return [__date_parts[0], this.getMonthName(parseInt(__date_parts[1]).toString()), __date_parts[2]].join('-') + ' ' + _time;
        } else {
            return [__date_parts[0], this.getMonthName(parseInt(__date_parts[1]).toString()), __date_parts[2]].join('-')
        }
    }

    convertDate(_date?: any) {
        var d = new Date();
        if (_date !== undefined && _date !== null) {
            d = new Date(_date);
        }
        return [this.padLeadingZero(d.getDate()), this.padLeadingZero(d.getMonth() + 1), d.getFullYear()].join('-')
    }

    getMonthName(val: string): string {
        return AppConstant.MONTH[parseInt(val)];
    }

    showAlert(msg: string | object, actionTxt?: string) {
        if (actionTxt == undefined || actionTxt == null) {
            actionTxt = "Close";
        }
        if (typeof msg !== 'string') {
            msg = "An error occurred -> " + JSON.stringify(msg);
        }
        this.snackBar.open(msg, actionTxt);
        setTimeout(() => {
            this.snackBar.dismiss();
        }, 5000);
    }

    formatStringValueToAmount(amt: string | undefined): number {
        if (amt === undefined) {
            return 0;
        }
        return parseFloat((amt.split(AppConstant.RUPEE_SYMBOL)[1]).replace(/,/g, ""));
    }

    handleTabChange(uri: any, qParams?: any) {
        if (qParams != undefined) {
            let objToSend: NavigationExtras = {
                queryParams: qParams,
                skipLocationChange: false,
                fragment: 'top'
            };
            this.router.navigate([uri.path], { state: objToSend });
        } else {
            this.router.navigate([uri.path]);
        }
    }

    searchRecords(searchText: any) {
        if (searchText == undefined || searchText.trim() == "") {
            this.showAlert("Enter something to search");
            return;
        } else {
            if (window.location.pathname.indexOf('search-redirect') == -1) {
                this.handleTabChange({ path: 'search-redirect' }, { "transactionSearch": searchText });
            } else {
                this.handleTabChange({ path: 'search-results' }, { "transactionSearch": searchText });
            }
        }
    }

    getClassVal(value: any) {
        let _type = value;
        return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
    }

    getFullDate(day: number, month?: number) {
        let d = new Date();
        if (month === undefined) {
            month = d.getMonth() + 1;
        }
        return [this.padLeadingZero(day), this.padLeadingZero(month), d.getFullYear()].join('-');
    }

    calculateDateDiff(date1: string | Date, date2?: string | Date) {
        let currentDate = new Date();
        if (date2 !== undefined) {
            if (typeof date2 === 'string') {
                date2 = new Date(date2);
            }
            currentDate = date2;
        }
        if (typeof date1 === 'string') {
            date1 = new Date(date1);
        }

        return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) / (1000 * 60 * 60 * 24));
    }
}


@Injectable({ providedIn: 'root' })
export class XIRR {
    constructor() { }
    private tol = 0.001;

    dateDiff(d1: Date, d2: Date) {
        let day = 24 * 60 * 60 * 1000;
        let diff = (d1.getTime() - d2.getTime());
        return diff / day;
    }

    f_xirr(p: number, dt: Date, dt0: Date, x: number) {
        let calcXirr = p * Math.pow((1.0 + x), (this.dateDiff(dt0, dt) / 365.0));
        return calcXirr;
    }

    df_xirr(p: number, dt: Date, dt0: Date, x: number) {
        return (1.0 / 365.0) * this.dateDiff(dt0, dt) * p * Math.pow((x + 1.0), ((this.dateDiff(dt0, dt) / 365.0) - 1.0));
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