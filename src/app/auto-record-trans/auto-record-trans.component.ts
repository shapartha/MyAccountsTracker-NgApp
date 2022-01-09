import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { HeaderTabs } from '../constant/header-tabs';

declare function handleClientLoad(arrayObj: any[]): any;
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

  async initLoadData() {
    await this.getAllAccounts();
    await this.getAllFilterAccMappings();
    handleClientLoad(this.accFilterMappings);
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

  async markMsgProcessed(item: any) {
    this.appService.showLoader();
    let _inpObj = {
      filter: item.google_filter
    };
    let apiCallData = await this.appService.getMailFilterMappingByFilter(_inpObj);
    if (apiCallData.success == true) {
      if (apiCallData.response == '200') {
        let lastMsgId = apiCallData.dataArray[0].last_msg_id;
        if (lastMsgId == null || lastMsgId == undefined || lastMsgId == '') {
          lastMsgId = item.google_msg_id;
        } else {
          lastMsgId += "," + item.google_msg_id;
        }
        let _updObj = {
          mapping_id: apiCallData.dataArray[0].mapping_id,
          last_msg_id: lastMsgId
        };
        let apiCallUpdate = await this.appService.updateMailFilterMapping([_updObj]);
        if (apiCallUpdate[0].success == true) {
          this.appService.showAlert("Message Processed Successfully");
          let _parentObj = this.mailDataJson.filter((pObj: any) => pObj.filter == _inpObj.filter)[0];
          let _childObj = _parentObj.data.findIndex((cObj: any) => _updObj.last_msg_id.indexOf(cObj.google_msg_id) != -1);
          _parentObj.data.splice(_childObj, 1);
        } else {
          this.appService.showAlert("An error occurred processing the message in DB");
        }
      } else {
        this.appService.showAlert(apiCallData);
      }
    } else {
      this.appService.showAlert(apiCallData);
    }
    this.appService.hideLoader();
  }

  acceptMessage(item: any) {
    let _accId = this.accFilterMappings.filter((accFilterMap: any) => accFilterMap.filter == item.google_filter)[0].acc_id;
    let _inpObj = {
      amount : item.trans_amt.replace(",", ""),
      date : item.trans_date.split(" ")[0],
      desc : item.trans_desc.replace("\\",""),
      type : item.trans_type,
      acc_id : _accId,
      user_id : this.appService.getAppUserId
    };
    this.appService.showLoader();
    this.appService.saveTransaction(JSON.stringify(_inpObj)).then(resp => {
      if (resp.success === true) {
        this.appService.showAlert("Saved Successfully");
        this.markMsgProcessed(item);
      } else {
        this.appService.showAlert(resp);
      }
      this.appService.hideLoader();
    });
  }

}
