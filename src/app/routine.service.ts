import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  COOKIE_UPD_REC_TRNS_MNTHLY = "routine_upd_rec_trans_monthly";

  constructor(private appService: AppService) { }

  executeAllProcesses() {
    this.updateRecurringTransMonthly();
  }

  async updateRecurringTransMonthly() {
    let checkRunStats = this.appService.getCookie(this.COOKIE_UPD_REC_TRNS_MNTHLY);
    if (checkRunStats != "") {
      console.log(this.COOKIE_UPD_REC_TRNS_MNTHLY + " - this routine already processed this month.");
      return;
    }
    let currentDay = new Date().getDate();
    if (currentDay > 5) {
      console.log(this.COOKIE_UPD_REC_TRNS_MNTHLY + " - this routine was not processed within prescribed duration this month.");
      return;
    }
    const getAllRecurTransResp = await this.appService.getAllRecurringTrans({ user_id: this.appService.getAppUserId });
    if (getAllRecurTransResp.success === true) {
      if (getAllRecurTransResp.response !== '200') {
        console.error("No Recurring Transactions could be retrieved.")
        return;
      }
      let _updTransArr: any = [];
      getAllRecurTransResp.dataArray.forEach((data: any) => {
        if (data.rec_trans_executed !== "0") {
          let _updTrans = {
            rec_trans_id: data.rec_trans_id,
            rec_trans_executed: data.rec_trans_executed
          };
          _updTransArr.push(_updTrans);
        }
      });
      if (_updTransArr.length == 0) {
        console.log("No transactions to update in recurring monthly routine.")
        return;
      }
      this.appService.showLoader();
      const updRecTransResp = await this.appService.updateRecTrans(_updTransArr);
      if (updRecTransResp[0].success === true) {
        console.log("Execution Status updated for current month for all Recurring Transactions.")
      }
      this.appService.hideLoader();
      this.appService.setCookie(this.COOKIE_UPD_REC_TRNS_MNTHLY, 1, 5);
    }
  }
}
