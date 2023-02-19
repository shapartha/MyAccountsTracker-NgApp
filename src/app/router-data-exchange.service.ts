import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterDataExchangeService {
  private data = new BehaviorSubject<any>({});
  data$ = this.data.asObservable();
  
  constructor() { }

  passData(data: any) {
    this.data.next(data);
  }
}
