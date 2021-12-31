import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { AppService } from '../app.service';
import { HeaderTabs } from '../constant/header-tabs';

@Component({
  selector: 'app-manage-eq',
  templateUrl: './manage-eq.component.html',
  styleUrls: ['./manage-eq.component.scss']
})
export class ManageEqComponent implements OnInit {
  
  panelOpenState = false;
  headerTabs: HeaderTabs = new HeaderTabs();
  stocks: any = [];
  newStock: any = {};
  menuTopLeftPosition =  {x: '0', y: '0'} ;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(public appService: AppService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getInitData();
  }

  async getInitData() {
    this.appService.showLoader();
    const getAllStocksResp = await this.appService.getAllStocks({});
    if (getAllStocksResp.success === true) {
      if (getAllStocksResp.response !== '200') {
        this.appService.hideLoader();
        return;
      }
      this.stocks = getAllStocksResp.dataArray;
    } else {
      this.appService.showAlert("Non-Success Response: " + JSON.stringify(getAllStocksResp));
    }
    this.appService.hideLoader();
  }
  
  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    item.menuType = "Stock";
    item.description = item.stock_name;
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  deleteItem(data: any) {
    this.openDeleteDialog(data);
  }

  refreshStocks() {
    this.appService.showLoader();
    this.stocks.forEach((element: any) => {
      this.appService.fetchStockCMP(element.stock_symbol).then(async (resp: any) => {
        let inpObj = {
          stock_symbol: element.stock_symbol,
          current_market_price: resp.data.pricecurrent,
          last_market_date: this.appService.convertDate(resp.data.lastupd)
        }
        const updStkResp = await this.appService.updateStockMaster([ inpObj ]);
        if (updStkResp[0].success === true) {
          let _updObj_ = this.stocks.filter((stk: any) => stk.stock_symbol === inpObj.stock_symbol)[0];
          _updObj_.current_market_price = inpObj.current_market_price;
          _updObj_.last_market_date = inpObj.last_market_date;
        }
        this.appService.hideLoader();
      });
    });
  }

  openDeleteDialog(item: any) {
    const dialogRef = this.dialog.open(DeleteDialogStocks, {
      data: item
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(async result => {
      if (result !== true) {
        if (item.menuType === 'Stock') {
          this.appService.showLoader();
          let _inpObj_ = {
            stock_symbol: item.stock_symbol
          };
          const deleteStockResp = await this.appService.deleteStock([_inpObj_]);
          if (deleteStockResp[0].success === true) {
            var _transToRemove = this.stocks.findIndex((stk: any) => stk.stock_symbol === item.stock_symbol);
            this.stocks.splice(_transToRemove, 1);
            this.appService.showAlert(item.menuType + " : " + item.stock_name + " deleted successfully");
          } else {
            this.appService.showAlert("An error occurred | " + deleteStockResp[0].response + ":" + deleteStockResp[0].responseDescription);
          }
          this.appService.hideLoader();
        }
      }
    });
  }

  async saveStock() {
    if (this.newStock.stock_symbol === null || this.newStock.stock_symbol === undefined || this.newStock.stock_symbol.trim() === '') {
      this.appService.showAlert("Stock Symbol is required");
      return;
    }
    if (this.newStock.stock_name === null || this.newStock.stock_name === undefined || this.newStock.stock_name.trim() === '') {
      this.appService.showAlert("Stock Name is required");
      return;
    }
    this.appService.showLoader();
    this.newStock.last_market_date = this.appService.convertDate(this.newStock.last_market_date);
    const saveStockResp = await this.appService.saveStock([ this.newStock ]);
    if (saveStockResp[0].success === true) {
      this.appService.showAlert("Stock Added Successfully");
      this.stocks.unshift(this.newStock);
      this.newStock = {};
      let accordionElem = <HTMLElement>document.querySelector("mat-expansion-panel-header");
      accordionElem.click();
    } else {
      this.appService.showAlert(saveStockResp[0]);
    }
    this.appService.hideLoader();
  }

  async onChangeStockSymbol() {
    this.appService.showLoader();
    this.newStock.stock_symbol = this.newStock.stock_symbol.toUpperCase();
    const fetchLatestCMPResp: any = await this.appService.fetchStockCMP(this.newStock.stock_symbol);
    if (fetchLatestCMPResp.code === '200') {
      this.newStock["stock_name"] = fetchLatestCMPResp.data.company;
      this.newStock["current_market_price"] = fetchLatestCMPResp.data.pricecurrent;
      this.newStock["last_market_date"] = this.appService.formatDate(this.appService.convertDate(fetchLatestCMPResp.data.lastupd));
    } else {
      this.appService.showAlert(fetchLatestCMPResp);
    }
    this.appService.hideLoader();
  }
}





@Component({
  selector: 'dialog-delete',
  templateUrl: '../dialog/dialog-delete.html',
})
export class DeleteDialogStocks {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}