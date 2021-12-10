import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-home-recurring-section',
  templateUrl: './home-recurring-section.component.html',
  styleUrls: ['./home-recurring-section.component.scss']
})
export class HomeRecurringSectionComponent implements OnInit, OnChanges {

  pending_rec_trans: any[] = [];
  @Output() onContextMenuEvent = new EventEmitter();
  @Input() refreshTrans: boolean = false;
  @Output() refreshTransChange = new EventEmitter();

  constructor(public appService: AppService) { }

  ngOnInit(): void {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.refreshTrans && changes.refreshTrans.currentValue === true) {
      this.initData();
      this.refreshTrans = false;
      this.refreshTransChange.emit();
    }
  }

  async initData() {
    this.appService.showLoader();
    const getTodayRecTrsResp = await this.appService.getRecurringTransToday({ user_id: this.appService.getAppUserId });
    if (getTodayRecTrsResp.success === true) {
      if (getTodayRecTrsResp.response === '200') {
        this.pending_rec_trans = getTodayRecTrsResp.dataArray;
      } else {
        this.pending_rec_trans = [];
      }
    }
    this.appService.hideLoader();
  }

  onContextMenu(event: MouseEvent, item: any, type: string) {
    let _emitObj = {
      evt: event,
      itm: item,
      typ: type
    }
    this.onContextMenuEvent.emit(_emitObj);
  }

}
