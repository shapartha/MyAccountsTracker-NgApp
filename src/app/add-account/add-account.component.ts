import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { SaveAccount } from '../model/account';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {
  saveAccount: SaveAccount = new SaveAccount();
  categories: any[] = [];
  constructor(private router: Router, private appService: AppService) { 
    this.appService.getCategory('{"user_id":' + this.appService.getAppUserId + '}').subscribe(data => {
      if (data.success) {
        data.dataArray.forEach((element : any) => {
          let _category = {
            category_id: element.category_id,
            category_name: element.category_name
          }
          this.categories.push(_category);
        });
      } else {
        this.handleRoute('/error');
      }
      this.appService.hideLoader();
    });
  }

  ngOnInit(): void {
  }

  saveAccountDetails() {
    if (this.saveAccount.account_name == undefined || this.saveAccount.account_name?.length! < 3) {
      this.appService.showAlert("Account name must be atleast 3 characters", "Close");
      return;
    }
    if (this.saveAccount.category_id == undefined || this.saveAccount.category_id == "") {
      this.appService.showAlert("Select a valid Category for the account", "Close");
      return;
    }
    if (this.saveAccount.balance == undefined) {
      this.appService.showAlert("Please enter the initial balance. If no initial balance, enter '0'", "Close");
      return;
    }
    this.appService.showLoader();
    this.saveAccount.user_id = this.appService.getAppUserId.toString();
    this.appService.saveAccount([this.saveAccount]).then(data => {
      if (data[0].response === "200") {
        this.appService.showAlert("Account : '" + this.saveAccount.account_name + "' created successfully", "Close");
        this.saveAccount = new SaveAccount();
      } else {
        this.appService.showAlert("Error Occurred : " + data[0].response + " | " + data[0].responseDescription, "Close");
      }
      this.appService.hideLoader();
    }, err => {
      console.error(err);
      this.appService.hideLoader();
    });
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }

}
