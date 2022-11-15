import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent, DialogDeleteContent, DialogUpdateContent, DialogRedeemContent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { DialogImageViewContent, TransactionsComponent } from './transactions/transactions.component';
import { AddTransComponent } from './add-trans/add-trans.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFileUploadModule } from 'angular-material-fileupload';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddCategoryComponent } from './add-category/add-category.component';
import { AppInterceptor } from './app.interceptor';
import { AuthService } from './auth.service';
import { AddAccountComponent } from './add-account/add-account.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogScheduleTrans, ScheduledTransComponent, UpdateDialogScheduleTrans} from './scheduled-trans/scheduled-trans.component';
import { MfDashboardComponent } from './mf-dashboard/mf-dashboard.component';
import { DeleteDialogRecurringTrans, RecurringTransComponent, UpdateDialogRecurringTrans } from './recurring-trans/recurring-trans.component';
import { HomeScheduledSectionComponent } from './home-scheduled-section/home-scheduled-section.component';
import { HomeRecurringSectionComponent } from './home-recurring-section/home-recurring-section.component';
import { EqDashboardComponent } from './eq-dashboard/eq-dashboard.component';
import { MapMfComponent } from './map-mf/map-mf.component';
import { MapEqComponent } from './map-eq/map-eq.component';
import { DeleteDialogStocks, ManageEqComponent } from './manage-eq/manage-eq.component';
import { DeleteDialogMutualFunds, ManageMfComponent } from './manage-mf/manage-mf.component';
import { AutoRecordTransComponent, DialogGenericConfirmation } from './auto-record-trans/auto-record-trans.component';
import { AddMailFilterMappingComponent } from './add-mail-filter-mapping/add-mail-filter-mapping.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent, DialogDeleteContent, DialogUpdateContent, DialogRedeemContent,
    ErrorComponent,
    LoginComponent,
    LogoutComponent,
    TransactionsComponent, DialogImageViewContent,
    AddTransComponent, DialogGenericConfirmation,
    AddCategoryComponent, HomeRecurringSectionComponent, DeleteDialogStocks, DeleteDialogMutualFunds,
    AddAccountComponent, UpdateDialogRecurringTrans, DeleteDialogRecurringTrans,
    ScheduledTransComponent, DeleteDialogScheduleTrans, UpdateDialogScheduleTrans, MfDashboardComponent, RecurringTransComponent, HomeScheduledSectionComponent, HomeRecurringSectionComponent, EqDashboardComponent, MapMfComponent, MapEqComponent, ManageEqComponent, ManageMfComponent, AutoRecordTransComponent, AddMailFilterMappingComponent, SearchResultsComponent
  ],
  imports: [
    BrowserModule,    HttpClientModule,    FormsModule,    AppRoutingModule,    BrowserAnimationsModule,
    MatDatepickerModule,    MatFormFieldModule,    MatNativeDateModule,    MatInputModule,    MatSlideToggleModule,
    MatRadioModule,    MatSelectModule,    MatButtonModule,    MatSnackBarModule,    MatFileUploadModule,    MatToolbarModule,
    NoopAnimationsModule,    MatMenuModule,    MatDialogModule, MatTooltipModule, MatExpansionModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    AuthService, NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
