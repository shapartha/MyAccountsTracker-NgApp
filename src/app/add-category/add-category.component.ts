import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { Category } from '../model/category';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  categoryName: string = "";
  constructor(private appService: AppService, private router: Router) { 
    this.appService.hideLoader();
  }

  ngOnInit(): void {
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }

  saveCategory() {
    if (this.categoryName == undefined || this.categoryName?.length! < 3) {
      this.appService.showAlert("Category name must be atleast 3 characters", "Close");
      return;
    }
    let _category = {
      category_name: this.categoryName,
      user_id: this.appService.getAppUserId
    };
    this.appService.showLoader();
    this.appService.saveCategory([_category]).then(data => {
      if (data[0].success === true) {
        this.appService.showAlert("Category : '" + this.categoryName + "' created successfully", "Close");
        this.categoryName = "";
      } else {
        this.appService.showAlert("Error Occurred : " + data[0].response + " | " + data[0].responseDescription, "Close");
      }
      this.appService.hideLoader();
    }, err => {
      console.error(err);
      this.appService.hideLoader();
    });
  }
}
