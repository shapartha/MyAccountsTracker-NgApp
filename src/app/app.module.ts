import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { TransactionsComponent } from './transactions/transactions.component';
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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddCategoryComponent } from './add-category/add-category.component';
import { AppInterceptor } from './app.interceptor';
import { AuthService } from './auth.service';
import { AddAccountComponent } from './add-account/add-account.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ErrorComponent,
    LoginComponent,
    LogoutComponent,
    TransactionsComponent,
    AddTransComponent,
    AddCategoryComponent,
    AddAccountComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFileUploadModule,
    MatToolbarModule,
    NoopAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
