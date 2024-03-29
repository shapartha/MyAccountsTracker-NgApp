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
import { RecurringTransComponent } from './recurring-trans/recurring-trans.component';
import { MapMfComponent } from './map-mf/map-mf.component';
import { MapEqComponent } from './map-eq/map-eq.component';
import { ManageEqComponent } from './manage-eq/manage-eq.component';
import { ManageMfComponent } from './manage-mf/manage-mf.component';
import { AutoRecordTransComponent } from './auto-record-trans/auto-record-trans.component';
import { AddMailFilterMappingComponent } from './add-mail-filter-mapping/add-mail-filter-mapping.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate : [AuthService]  },
  { path: 'scheduled-trans', component: ScheduledTransComponent, canActivate : [AuthService] },
  { path: 'recurring-trans', component: RecurringTransComponent, canActivate : [AuthService] },
  { path: 'mf-trans', component: MfDashboardComponent, canActivate : [AuthService] },
  { path: 'add-trans', component: AddTransComponent, canActivate : [AuthService]  },
  { path: 'add-account', component: AddAccountComponent, canActivate : [AuthService]  },
  { path: 'add-category', component: AddCategoryComponent, canActivate : [AuthService] },
  { path: 'map-mf', component: MapMfComponent, canActivate : [AuthService]  },
  { path: 'map-eq', component: MapEqComponent, canActivate : [AuthService]  },
  { path: 'search-results', component: SearchResultsComponent, canActivate : [AuthService]  },
  { path: 'search-redirect', component: SearchResultsComponent, canActivate : [AuthService]  },
  { path: 'add-mail-filter-mapping', component: AddMailFilterMappingComponent, canActivate : [AuthService]  },
  { path: 'manage-eq', component: ManageEqComponent, canActivate : [AuthService]  },
  { path: 'manage-mf', component: ManageMfComponent, canActivate : [AuthService]  },
  { path: 'auto-trans', component: AutoRecordTransComponent, canActivate : [AuthService]  },
  { path: 'admin-home', component: AdminHomeComponent, canActivate : [AuthService]  },
  { path: 'logout', component: LogoutComponent, canActivate : [AuthService] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: ErrorComponent, data: { err : "Page not found" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
