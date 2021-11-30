export class Account {
    public id?: string;
    public name?: string;
    public category_id?: string;
    public category_name?: string;
    public balance?: string;
    public is_equity?: boolean | string;
    public is_mf?: boolean | string;
    public created_date?: string;
    public updated_date?: string;
    public user_id?: number;

    constructor() {
        
    }
}

export class SaveAccount {
    public account_name?: string;
    public category_id?: string;
    public user_id?: string;
    public balance?: string;
    public is_mf?: string;
    public is_equity?: string;

    constructor() {}
}