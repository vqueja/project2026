import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock.model';
import { environment } from '../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private baseUrl = environment.apiUrl + '/api/stocks';

    constructor(private http: HttpClient) { }

    getStocks(): Observable<Stock[]> {
        return this.http.get<Stock[]>(this.baseUrl);
    }

    updateStockPrice(ticker: string, newPrice: number): Observable<Stock> {
        return this.http.patch<Stock>(`${this.baseUrl}/${ticker}`, { newPrice });
    }
}
