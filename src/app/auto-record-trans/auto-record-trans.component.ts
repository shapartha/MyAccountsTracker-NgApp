import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { HeaderTabs } from '../constant/header-tabs';

declare function handleClientLoad(): any;
declare function checkSignInStatus(): any;
declare function handleSignoutClick(): any;
declare function handleAuthClick(): any;

@Component({
  selector: 'app-auto-record-trans',
  templateUrl: './auto-record-trans.component.html',
  styleUrls: ['./auto-record-trans.component.scss']
})
export class AutoRecordTransComponent implements OnInit {

  headerTabs: HeaderTabs = new HeaderTabs();
  menuTopLeftPosition = { x: '0', y: '0' };
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  mailDataJson: any = [];
  accFilterMappings: any = [];
  allAccounts: any = [];
  isSignedIn = false;

  constructor(public appService: AppService) { }

  async getAllAccounts() {
    let apiCallData = await this.appService.getAllAccounts(JSON.stringify({ user_id: this.appService.getAppUserId }));
    if (apiCallData.success == true && apiCallData.response == '200') {
      this.allAccounts = apiCallData.dataArray;
    }
  }

  async getAllFilterAccMappings() {
    //TODO: move this to DB & fetch these from api
    this.accFilterMappings.push({
      filter: 'from:credit_cards@icicibank.com',
      acc_id: 90398162
    });
  }

  initLoadData() {
    handleClientLoad();
    setTimeout(() => {
      var mailData = this.appService.getCookie('gapi_gmail_data');
      if (mailData != undefined && mailData != null && mailData !== '') {
        this.mailDataJson = JSON.parse(mailData);
        this.mailDataJson.forEach((mail_data: any) => {
          let _accId = this.accFilterMappings.filter((accFilterMap: any) => accFilterMap.filter == mail_data.filter)[0].acc_id;
          mail_data["acc_name"] = this.allAccounts.filter((_acc: any) => _acc.account_id == _accId)[0].account_name;
        });
        this.isSignedIn = true;
      }
      this.appService.hideLoader();
    }, 10000);
  }

  ngOnInit(): void {
    this.appService.showLoader();
    this.getAllAccounts();
    this.getAllFilterAccMappings();
    this.initLoadData();
  }

  isGoogleSignedIn(): boolean {
    return checkSignInStatus();
  }

  googleSignOut() {
    handleSignoutClick();
    this.appService.showLoader();
    setTimeout(() => {
      this.mailDataJson = [];
      this.isSignedIn = this.isGoogleSignedIn();
      this.appService.hideLoader();
    }, 3000);
  }

  googleSignIn() {
    handleAuthClick();
    this.appService.showLoader();
    setTimeout(() => {
      this.isSignedIn = this.isGoogleSignedIn();
      this.initLoadData();
    }, 10000);
  }

}
