export class Transaction {
    public id?: string;
    public description?: string;
    public amount?: string;
    public date?: string;
    public transType?: string;
    public receiptImgId?: string;
    public createdDate?: string;
    public updatedDate?: string;
    public acc_id?: string;
    public acc_name?: string;
    public acc_balance?: string;
    public cat_id?: string;
    public cat_name?: string;
    public user_id?: string;
    public mfNav?: string;
    public is_equity?: string;
    public is_mf?: string;
    public is_delivery_order?: string;
    constructor() {

    }
}

export class SaveTransaction {
    public desc?: string;
    public type?: string;
    public amount?: string;
    public date?: string;
    public acc_id?: string;
    public user_id?: string;
    public rec_date?: string;
    public image_path?: string;
    public scheme_code?: string;
    public mf_nav?: string;

    constructor() {}
}