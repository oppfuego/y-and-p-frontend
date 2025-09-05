export type PriceItem = {
    duration: string;
    price: string;
};

export type Pricing = {
    incall?: PriceItem[];
    outcall?: PriceItem[];
};