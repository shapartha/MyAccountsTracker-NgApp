import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ErrorComponent } from './error/error.component';
import { AddTransComponent } from './add-trans/add-trans.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { AuthService } from './auth.service';
import { AddAccountComponent } from './add-account/add-account.component';
import { ScheduledTransComponent } from './scheduled-trans/scheduled-trans.component';
import { MfDashboardComponent } from './mf-dashboard/mf-dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate : [AuthService]  },
  { path: 'scheduled-trans', component: ScheduledTransComponent, canActivate : [AuthService] },
  { path: 'mf-trans', component: MfDashboardComponent, canActivate : [AuthService] },
  { path: 'add-trans', component: AddTransComponent, canActivate : [AuthService]  },
  { path: 'add-account', component: AddAccountComponent, canActivate : [AuthService]  },
  { path: 'add-category', component: AddCategoryComponent, canActivate : [AuthService] },
  { path: 'logout', component: LogoutComponent, canActivate : [AuthService] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
