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
    let apiCallData = await this.appService.getAllMailFilterMappings();
    if (apiCallData.success == true && apiCallData.response == '200') {
      this.accFilterMappings = apiCallData.dataArray;
    }
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
    }, 15000);
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
    }, 15000);
  }
  
  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = "Gmail Tracking";
    item.description = item.trans_desc;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  markMsgProcessed(item: any) {
    console.log(item);
    //TODO: update/insert last_msg_id in table
    // let apiCallResp = await this.appS
  }

  acceptMessage(item: any) {
    //TODO: save transaction api
    this.markMsgProcessed(item);
  }

}
