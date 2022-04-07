import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from "@angular/router"

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  currentTab: string = "Logout";
  constructor(private appService: AppService, private router: Router) {
    let _loggedInUser = this.appService.getAppUserId;
    if (_loggedInUser == undefined || isNaN(_loggedInUser) || _loggedInUser == 0) {
      this.currentTab = "Login";
      this.handleTabChange({path: 'login'});
    } else {
      this.appService.eraseCookie("app-user-id");
      this.appService.eraseCookie("app-token");
      this.appService.eraseCookie("gapi_apikey");
      this.appService.eraseCookie("gapi_clientid");
      this.appService.removeSessionStorageData("gapi_gmail_data");
      setTimeout(() => {
        this.currentTab = "Login";
        this.handleTabChange({path: 'login'});
      }, 3000);
    }
    this.appService.hideLoader();
  }

  handleTabChange(uri: any) {
    window.location.href = uri.path;
  }

  ngOnInit(): void {
  }

}
