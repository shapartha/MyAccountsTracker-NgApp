import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AppService } from "./app.service";

@Injectable()
export class AuthService implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let _userId = this.appService.getAppUserId;
        if (isNaN(_userId)) {
            this._router.navigate(['login']);
            return false;
        } else {
            return true;
        }
    }
    
    constructor(private _router: Router, private appService: AppService) {}
}