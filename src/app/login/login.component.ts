import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from "@angular/router"
import { User } from '../model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  alertClass: string = "";
  alertText: string = "";
  user: User;
  currentTab: string = "Login";
  constructor(private appService: AppService, private router: Router) { 
    this.user = new User();
    let _loggedInUser = this.appService.getAppUserId;
    if (_loggedInUser != undefined && !isNaN(_loggedInUser) && _loggedInUser != 0) {
      this.currentTab = "Home";
      this.handleTabChange('home');
    }
    this.appService.hideLoader();
  }

  handleTabChange(uri: any) {
    window.location.href = uri;
  }

  ngOnInit(): void {
  }

  submitSignIn(user: User) {
    if (user.email_id != undefined && user.email_id != '' && user.password != undefined && user.password != '') {
      this.appService.showLoader();
      this.appService.loginUser('{"email_id": "' + user.email_id + '", "password": "' + btoa(user.password) + '"}')
      .then(val => {
        if (val.success) {
          this.appService.setAppUserId = val.dataArray[0].user_id;
          this.alertClass = "alert-success";
          this.alertText = "Login Successful ! Redirecting...";
          this.disableButtons();
          setTimeout(() => {
            this.currentTab = "Home";
            this.handleTabChange('/home');
          }, 1000);
        } else {
          this.alertClass = "alert-danger";
          this.alertText = "Login Credentials Failed";
        }
        this.appService.hideLoader();
      }, err => {
        this.alertClass = "alert-danger";
        this.alertText = "API Error -> " + err;
        this.appService.hideLoader();
      })
      .catch(fault => {
        this.alertClass = "alert-danger";
        this.alertText = "API Error -> " + fault;
        this.appService.hideLoader();
      });
    } else {
      this.alertClass = "alert-danger";
      this.alertText = "Login Error -> Email ID or Password field cannot be blank";
    }
  }

  disableButtons() {
    document.getElementById("register")!.setAttribute('disabled', 'true');
    document.getElementById("reset")!.setAttribute('disabled', 'true');
  }

  resetForm() {
    this.user.email_id = "";
    this.user.password = "";
  }

  dismissAlert() {
    this.alertText = "";
    this.alertClass = "";
  }

}
