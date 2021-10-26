export class Category {
    public name: string;
    public id: string;
    public amount: string;
    public user_id: number;

    constructor() {
        this.name = '';
        this.id = '';
        this.amount = '';
        this.user_id = 0;
    }
}