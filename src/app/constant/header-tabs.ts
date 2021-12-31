export class HeaderTabs {
    public header: any[];

    constructor() {
        this.header = [
            { name: 'Home', path: 'home' },
            { name: 'Scheduled Transactions', path: 'scheduled-trans' },
            { name: 'Recurring Transactions', path: 'recurring-trans' },
            { name: 'Manage Mutual Funds', path: 'manage-mf' },
            { name: 'Manage Equity Shares', path: 'manage-eq' },
            { name: 'SMS Condition Mappings', path: 'auto-trans' }
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

export class EqTransHeaderTabs {
    public header: any[];

    constructor() {
        this.header = [
            { name: 'Dashboard', path: 'eq-dashboard' },
            { name: 'Transactions', path: 'transactions' }
        ];
    }
};