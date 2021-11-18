import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { SaveAccount } from '../model/account';
import { SaveTransaction } from '../model/transaction';

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
        this.appService.getAccountsByName(JSON.stringify({account_name: this.saveAccount.account_name, user_id: this.saveAccount.user_id})).then(data => {
          let _inpData = new SaveTransaction();
          _inpData.amount = this.saveAccount.balance;
          _inpData.acc_id = data.dataArray[0].account_id;
          _inpData.date = this.appService.getDate();
          _inpData.desc = "Initial Balance";
          _inpData.type = "CREDIT";
          _inpData.user_id = this.appService.getAppUserId.toString();
          this.appService.saveTransaction(JSON.stringify(_inpData)).then(resp => {
            if (resp.response !== "200") {
              this.appService.showAlert("Some error occurred while saving Transaction. Please try again.", "Close");
            }
            this.appService.hideLoader();
            this.saveAccount = new SaveAccount();
          }, err => {
            console.error("Error -> " + err);
            this.appService.hideLoader();
            this.appService.showAlert("Error Occurred while Saving Transaction ! Please try again.", "Close");
          }).catch(fault => {
            console.error("Fault -> " + fault);
            this.appService.hideLoader();
            this.appService.showAlert("Fault Occurred while Saving Transaction ! Please try again.", "Close");
          });
        });
      } else {
        this.appService.showAlert("Error Occurred : " + data[0].response + " | " + data[0].responseDescription, "Close");
      }
    }, err => {
      console.error(err);
      this.appService.hideLoader();
    });
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }

}
