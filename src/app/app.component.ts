import { Component } from '@angular/core';
import { AppService } from './app.service';
import { AppMenuItems } from './constant/app-const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My Accounts Tracker';
  menu: AppMenuItems = new AppMenuItems();;
  menuItems: any[];
  isShown: boolean = false;

  constructor(private appService: AppService) {
    this.menuItems = this.menu.menuItem!;
    this.initGoogleApi();
  }

  async initGoogleApi() {
    if (this.appService.getCookie('gapi_apikey') == "" || this.appService.getCookie('gapi_clientid') == "") {
      await this.appService.getGApiDetails();
    }
  }

  checkLoginState(): boolean {
    let _loggedInUser = this.appService.getAppUserId;
    if (_loggedInUser != undefined && !isNaN(_loggedInUser) && _loggedInUser != 0) {
      return true;
    }
    return false;
  }

  showDropdown() {
    if (!this.isShown) {
      document.getElementById("dropdown-list")!.style.display = 'block';
      this.isShown = true;
    } else {
      document.getElementById("dropdown-list")!.style.display = 'none';
      this.isShown = false;
    }
  }
}