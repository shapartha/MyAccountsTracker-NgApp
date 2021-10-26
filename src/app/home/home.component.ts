import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"
import { Category } from '../model/category';
import { HeaderTabs } from '../constant/header-tabs';
import { AppService } from '../app.service';
import { AppConstant } from '../constant/app-const';
import { Account } from '../model/account';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  accounts: Account[] = [];
  currentTab: string = "Login";
  headerTabs: HeaderTabs = new HeaderTabs();
  title = 'My Accounts Tracker';
  constructor(private router: Router, private appService: AppService) {
    let _loggedInUser = this.appService.getAppUserId;
    if (_loggedInUser == undefined || isNaN(_loggedInUser) || _loggedInUser == 0) {
      this.currentTab = "Login";
      this.handleTabChange({path: '/login'});
    } else {
      this.currentTab = "Home";
      this.getAllCategories();
    }
  }

  getAllCategories() {
    this.appService.getCategory('{"user_id":' + this.appService.getAppUserId + '}').subscribe(data => {
      if (data.success) {
        for (var i = 0; i < data.dataArray.length; i++) {
          let categoryAmt = 0;
          let _category = new Category();
          _category.name = data.dataArray[i].category_name;
          _category.id = data.dataArray[i].category_id;
          this.appService.getAccountsByCategory('{"category_id":' + _category.id + ',"user_id":' + this.appService.getAppUserId + '}').then(
            val => {
              if (val.success) {
                for (var j = 0; j < val.dataArray.length; j++) {
                  categoryAmt += parseFloat(val.dataArray[j].balance);
                  let _account = new Account();
                  _account.id = val.dataArray[j].account_id;
                  _account.name = val.dataArray[j].account_name;
                  _account.category_id = val.dataArray[j].category_id;
                  _account.category_name = val.dataArray[j].category_name;
                  _account.balance = val.dataArray[j].balance;
                  _account.created_date = val.dataArray[j].created_date;
                  _account.updated_date = val.dataArray[j].updated_date;
                  _account.user_id = Number(val.dataArray[j].user_id);
                  _account.is_equity = Boolean(Number(val.dataArray[j].is_equity));
                }
              }
              _category.amount = this.formatAmountWithComma((Math.round(categoryAmt * 100) / 100).toFixed(2));
              this.categories.push(_category);
            },
            err => {
              console.error(err);
              this.handleTabChange({path: 'error'});
            }
          ).catch(fault => {
            console.error("Fault -> " + fault);
            this.handleTabChange({path: 'error'});
          });
        }
      } else {
        this.handleTabChange({path: 'error'});
      }
    });
  }

  formatAmountWithComma(amount: string): string {
    var amountVal = amount.split(".");
    var formattedAmount = Math.abs(parseInt(amountVal[0]));
    var isNegative = parseInt(amountVal[0]) < 0 ? "-" : "";
    var formattedAmountText = formattedAmount.toLocaleString();
    if (amountVal.length > 1) {
      return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText + "." + amountVal[1];
    } else {
      return isNegative + AppConstant.RUPEE_SYMBOL + formattedAmountText;
    }
  }

  handleTabChange(uri: any) {
    this.router.navigate([uri.path]);
    this.currentTab = uri.name;
  }

  ngOnInit(): void {
  }

}
