import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { AppMenuItems } from './constant/app-const';
import { RouterDataExchangeService } from './router-data-exchange.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'My Accounts Tracker';
  menu: AppMenuItems = new AppMenuItems();;
  menuItems: any[];
  itemData: any;

  constructor(private appService: AppService, private routerDataExchangeService: RouterDataExchangeService) {
    this.menuItems = this.menu.menuItem!;
    this.itemData = {};
    this.initGoogleApi();
  }

  ngOnInit() {
    this.routerDataExchangeService.data$.subscribe(res => this.itemData = res);
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

  showDropdown(evt: any) {
    evt.stopPropagation();
    let isShown = document.getElementById("dropdown-list")!.style.display;
    if (isShown == 'none' || isShown == '') {
      document.getElementById("dropdown-list")!.style.display = 'block';
    } else {
      document.getElementById("dropdown-list")!.style.display = 'none';
    }
  }

  openLink(pathVal: string) {
    this.routerDataExchangeService.passData(this.itemData);
    this.appService.handleTabChange({ path: pathVal });
  }
}