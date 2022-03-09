import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  noSearchItems: boolean = false;
  transactionSearchText: any;
  refreshTransactions: boolean = false;
  selectedAccount: string = "SEARCH";
  searchObj: any = {};
  rowCount: number = 0;
  searchText: any;

  constructor(public appService: AppService, private router: Router) {
    if (this.router.getCurrentNavigation() != null) {
      let objQueryParams = this.router.getCurrentNavigation()!.extras.state;
      if (objQueryParams != undefined) {
        if (objQueryParams.queryParams.transactionSearch != undefined && objQueryParams.queryParams.transactionSearch != "") {
          this.transactionSearchText = objQueryParams.queryParams.transactionSearch;
          this.searchObj = {
            text: this.transactionSearchText,
            user_id: this.appService.getAppUserId
          };
        }
      } else {
        this.noSearchItems = true;
      }
    }
  }

  search(evt: any) {
    if (evt.keyCode == 13) {
      this.appService.searchRecords(this.searchText);
    }
  }

  recordCount(evt: any) {
    this.rowCount = evt.rowCount;
  }

  ngOnInit(): void {
    this.appService.hideLoader();
  }

}
