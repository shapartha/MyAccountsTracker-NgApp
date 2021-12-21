import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { HeaderTabs } from '../constant/header-tabs';

@Component({
  selector: 'app-manage-mf',
  templateUrl: './manage-mf.component.html',
  styleUrls: ['./manage-mf.component.scss']
})
export class ManageMfComponent implements OnInit {

  panelOpenState = false;
  headerTabs: HeaderTabs = new HeaderTabs();
  mutualFunds: any = [];
  newMf: any = {};
  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(public appService: AppService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getInitData();
  }

  async getInitData() {
    this.appService.showLoader();
    const getAllMutualFundsResp = await this.appService.getAllMutualFunds({});
    if (getAllMutualFundsResp.success === true) {
      if (getAllMutualFundsResp.response !== '200') {
        this.appService.hideLoader();
        return;
      }
      this.mutualFunds = getAllMutualFundsResp.dataArray;
    } else {
      this.appService.showAlert("Non-Success Response: " + JSON.stringify(getAllMutualFundsResp));
    }
    this.appService.hideLoader();
  }
  
  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = "Mutual Fund";
    item.description = item.scheme_name;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  deleteItem(data: any) {
    this.openDeleteDialog(data);
  }

  openDeleteDialog(item: any) {
    const dialogRef = this.dialog.open(DeleteDialogMutualFunds, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(async result => {
      if (result !== true) {
        if (item.menuType === 'Mutual Fund') {
          this.appService.showLoader();
          let _inpObj_ = {
            scheme_code: item.scheme_code
          };
          const deleteMfResp = await this.appService.deleteMutualFund([_inpObj_]);
          if (deleteMfResp[0].success === true) {
            var mfToRemove = this.mutualFunds.findIndex((mf: any) => mf.scheme_code === item.scheme_code);
            this.mutualFunds.splice(mfToRemove, 1);
            this.appService.showAlert(item.menuType + " : " + item.scheme_name + " deleted successfully");
          } else {
            this.appService.showAlert("An error occurred | " + deleteMfResp[0].response + ":" + deleteMfResp[0].responseDescription);
          }
          this.appService.hideLoader();
        }
      }
    });
  }

  async saveMutualFund() {
    if (this.newMf.scheme_code === null || this.newMf.scheme_code === undefined || this.newMf.scheme_code.trim() === '') {
      this.appService.showAlert("Scheme code is required");
      return;
    }
    if (this.newMf.scheme_name === null || this.newMf.scheme_name === undefined || this.newMf.scheme_name.trim() === '') {
      this.appService.showAlert("Scheme Name is required");
      return;
    }
    this.appService.showLoader();
    const saveMfResp = await this.appService.saveMutualFund([ this.newMf ]);
    if (saveMfResp[0].success === true) {
      this.appService.showAlert("Mutual Fund Added Successfully");
      this.mutualFunds.unshift(this.newMf);
      this.newMf = {};
      let accordionElem = <HTMLElement>document.querySelector("mat-expansion-panel-header");
      accordionElem.click();
    } else {
      this.appService.showAlert(saveMfResp[0]);
    }
    this.appService.hideLoader();
  }

  async onChangeSchemeCode() {
    this.appService.showLoader();
    const fetchLatestMfNavResp: any = await this.appService.fetchMfNav(this.newMf.scheme_code);
    if (fetchLatestMfNavResp.status === 'SUCCESS') {
      this.newMf["scheme_name"] = fetchLatestMfNavResp.meta.scheme_name;
    } else {
      this.appService.showAlert(fetchLatestMfNavResp);
    }
    this.appService.hideLoader();
  }

}




@Component({
  selector: 'dialog-delete',
  templateUrl: '../dialog/dialog-delete.html',
})
export class DeleteDialogMutualFunds {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}