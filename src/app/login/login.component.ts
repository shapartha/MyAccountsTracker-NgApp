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
      this.handleTabChange('/home');
    }
  }

  handleTabChange(uri: any) {
    this.router.navigate([uri]);
  }

  ngOnInit(): void {
  }

  submitSignIn(user: User) {
    if (user.email_id != undefined && user.email_id != '' && user.password != undefined && user.password != '') {
      this.appService.loginUser('{"email_id": "' + user.email_id + '", "password": "' + btoa(user.password) + '"}')
      .then(val => {
        if (val.success) {
          this.appService.setAppUserId = val.dataArray[0].user_id;
          this.alertClass = "alert-success";
          this.alertText = "Login Successful ! Redirecting...";
          setTimeout(() => {
            this.currentTab = "Home";
            this.handleTabChange('/home');
          }, 1000);
        } else {
          this.alertClass = "alert-danger";
          this.alertText = "Login Credentials Failed";
        }
      }, err => {
        this.alertClass = "alert-danger";
        this.alertText = "API Error -> " + err;
      })
      .catch(fault => {
        this.alertClass = "alert-danger";
        this.alertText = "API Error -> " + fault;
      });
    }
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
