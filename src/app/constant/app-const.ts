export class AppConstant {
    static RUPEE_SYMBOL: string = "₹";
    static MONTH: any = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"
    };
}
export class AppMenuItems {
    public menuItem?: any[];

    constructor() {
        this.menuItem = [
            { name : "Logout", path: "/logout" }
        ];
    }
}