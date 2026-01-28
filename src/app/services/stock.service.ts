import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock.model';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private apiUrl = '/api/stocks';

    constructor(private http: HttpClient) { }

    getStocks(): Observable<Stock[]> {
        return this.http.get<Stock[]>(this.apiUrl);
    }

    updateStockPrice(ticker: string, newPrice: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${ticker}`, { newPrice });
    }
}
