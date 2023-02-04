import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  errData: any = {};
  errParams: any = {};

  constructor(private appService: AppService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.appService.hideLoader();
    this.activatedRoute.data.subscribe(data => {
      this.errData = data;
    });
    this.activatedRoute.queryParams.subscribe(data => {
      this.errParams = data;
    });
  }

}
