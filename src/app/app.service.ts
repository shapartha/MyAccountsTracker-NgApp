import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class AppService {
    apiServerUrl: string = "https://shapartha-android-zone.000webhostapp.com/accounts-tracker/api";
    apiFuncName: string = "";
    API_GET_TOKEN: string = "getToken";
    API_GET_CATEGORY: string = "getCategoryUserId";
    API_GET_ACCOUNTS_BY_CATEGORY: string = "getAccountsByCategory";
    API_USER_LOGIN: string = "getUserDataEmailPassword";
    static API_KEY: string = "tn4mzlCxWb7Ix90";
    appToken: string = "";
    appUserId: number = 0;

    constructor(private http: HttpClient) {
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
    
    getCategory(apiFuncParams: any): Observable<any> {
        this.apiFuncName = this.API_GET_CATEGORY;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams());
    }

    loginUser(apiFuncParams: any) {
        this.apiFuncName = this.API_USER_LOGIN;
        return this.http.get<any>(this.apiServerUrl + "?apiFunctionName=" + encodeURI(this.apiFuncName) + "&apiFunctionParams=" + encodeURI(apiFuncParams) + this.appendMandatoryParams()).toPromise();
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
}