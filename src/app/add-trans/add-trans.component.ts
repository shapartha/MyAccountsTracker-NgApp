import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from "@angular/router"

@Component({
  selector: 'app-add-trans',
  templateUrl: './add-trans.component.html',
  styleUrls: ['./add-trans.component.scss']
})
export class AddTransComponent implements OnInit {
  isTransferTrans = false;
  isRecurringTrans = false;
  constructor(private appService: AppService, private router: Router) { }

  ngOnInit(): void {
    this.appService.hideLoader();
  }

  handleRoute(uri: any) {
    this.router.navigate([uri]);
  }
}
