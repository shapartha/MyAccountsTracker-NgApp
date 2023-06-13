export class AppConstant {
    static RUPEE_SYMBOL: string = "₹";
    static APP_VERSION: string = "8.10.130623";
    static BILLPAY_ACCID: string = "768213039";
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
            { name : "Add Transaction", path: "add-trans" },
            { name : "Add Account", path: "add-account" },
            { name : "Add Category", path: "add-category" },
            { name : "divider"},
            { name : "Admin Activities", path: "admin-home" },
            { name : "Add Mail Filter Mapping", path: "add-mail-filter-mapping" },
            { name : "divider"},
            { name : "Map Mutual Fund", path: "map-mf" },
            { name : "Map Stocks", path: "map-eq" },
            { name : "divider"},
            { name : "Logout", path: "logout" }
        ];
    }
}