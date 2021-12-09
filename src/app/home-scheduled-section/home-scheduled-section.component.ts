import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-home-scheduled-section',
  templateUrl: './home-scheduled-section.component.html',
  styleUrls: ['./home-scheduled-section.component.scss']
})
export class HomeScheduledSectionComponent implements OnInit, OnChanges {

  pending_scheduled_trans: any[] = [];
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
    const getTodaySchTrsResp = await this.appService.getScheduledTransToday({ user_id: this.appService.getAppUserId });
    if (getTodaySchTrsResp.success === true) {
      if (getTodaySchTrsResp.response === '200') {
        this.pending_scheduled_trans = getTodaySchTrsResp.dataArray;
      } else {
        this.pending_scheduled_trans = [];
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
