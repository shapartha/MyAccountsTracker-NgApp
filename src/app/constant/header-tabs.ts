export class HeaderTabs {
    public header: any[];

    constructor() {
        this.header = [
            { name: 'Home', path: 'home' },
            { name: 'Scheduled Transactions', path: 'scheduled-trans' },
            { name: 'Recurring Transactions', path: 'recurring-trans' }
        ];
    }
};

export class MfTransHeaderTabs {
    public header: any[];

    constructor() {
        this.header = [
            { name: 'Dashboard', path: 'mf-dashboard' },
            { name: 'Transactions', path: 'transactions' }
        ];
    }
};