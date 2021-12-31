import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { HeaderTabs } from '../constant/header-tabs';

declare function handleClientLoad(): any;

@Component({
  selector: 'app-auto-record-trans',
  templateUrl: './auto-record-trans.component.html',
  styleUrls: ['./auto-record-trans.component.scss']
})
export class AutoRecordTransComponent implements OnInit {

  headerTabs: HeaderTabs = new HeaderTabs();
  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  mailDataJson: any = [];

  constructor(public appService: AppService) { }

  ngOnInit(): void {
    this.appService.showLoader();
    handleClientLoad();
    setTimeout(() => {
      var mailData = this.appService.getCookie('gapi_gmail_data');
      this.mailDataJson = JSON.parse(mailData);
      this.appService.hideLoader();
    }, 10000);
  }

}
