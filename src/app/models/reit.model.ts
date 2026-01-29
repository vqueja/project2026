export interface QuarterlyDividends {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
}

export interface DividendHistory {
    [year: string]: QuarterlyDividends;
}

export interface Reit {
    ticker: string;
    company: string;
    dividend_history: DividendHistory;
}

export interface ReitSectorContainer {
    _id: string;
    id: string;
    sector: string;
    ph_reits: Reit[];
    dividendHistory: any[]; // Based on your JSON, this is an empty placeholder array
    lastUpdated: string;
    latestAnnualDiv: number;
}

// The root response is an array of these containers
export type ReitApiResponse = ReitSectorContainer[];