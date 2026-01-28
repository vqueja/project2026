export interface Stock {
    _id: string;
    ticker: string;
    company_name: string;
    current_price: number;
    dividend_yield: string;  // e.g., "11.1%"
    sector: string;
}
