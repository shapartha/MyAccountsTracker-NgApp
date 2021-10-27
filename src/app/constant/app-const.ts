export class AppConstant {
    static RUPEE_SYMBOL: string = "₹";
}
export class AppMenuItems {
    public menuItem?: any[];

    constructor() {
        this.menuItem = [
            { name : "Logout", path: "/logout" }
        ];
    }
}