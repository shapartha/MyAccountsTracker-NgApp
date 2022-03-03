import { Component } from '@angular/core';
import { AppService } from './app.service';
import { AppMenuItems } from './constant/app-const';
import { RoutineService } from './routine.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My Accounts Tracker';
  menu: AppMenuItems = new AppMenuItems();;
  menuItems: any[];

  constructor(private appService: AppService, private routineService: RoutineService) {
    this.menuItems = this.menu.menuItem!;
    this.initGoogleApi();
    this.initRoutineProcess();
  }

  async initGoogleApi() {
    if (this.appService.getCookie('gapi_apikey') == "" || this.appService.getCookie('gapi_clientid') == "") {
      await this.appService.getGApiDetails();
    }
  }

  initRoutineProcess() {
    this.routineService.executeAllProcesses();
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
}