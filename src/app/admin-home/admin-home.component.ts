import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogGenericConfirmation } from '../auto-record-trans/auto-record-trans.component';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {

  constructor(private appService: AppService, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.message != null) {
        this.openGoogleDriveUploadSuccessDialog([], params.message);
      }
    });
    this.appService.hideLoader();
  }

  async invokeMfUpdater() {
    this.appService.showLoader();
    await this.appService.invokeMfStockUpdater(false).then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('MF Updater refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('MF Updater refresh completed');
    });
  }

  async invokeStocksUpdater() {
    this.appService.showLoader();
    await this.appService.invokeMfStockUpdater(true).then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('EQ Updater refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('EQ Updater refresh completed');
    });;
  }

  async invokeRoutines() {
    this.appService.showLoader();
    await this.appService.invokeMonthlyRoutines().then(d => {
      this.appService.hideLoader();
      this.appService.showAlert('Monthly routines refresh completed');
    }).catch(x => {
      console.log(x);
      this.appService.hideLoader();
      this.appService.showAlert('Monthly routines refresh completed');
    });;
  }

  async invokeBackup() {
    this.appService.showLoader();
    window.location.href = this.appService.redirectExternalUri();
  }

  openGoogleDriveUploadSuccessDialog(item: any, fileUploadId: any) {
    item["dialogTitle"] = "Google Drive File Upload";
    item["dialogBody"] = "DB/ Schema Backup has been taken successfully and uploaded to your selected Google Drive account. Do you want to open the file now ?";
    item["dialogBtnText"] = "Open";
    const dialogRef = this.dialog.open(DialogGenericConfirmation, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) {
        window.open('https://drive.google.com/open?id=' + fileUploadId, '_blank');
      }
    });
  }
}
