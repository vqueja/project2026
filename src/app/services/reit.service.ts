import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reit, ReitApiResponse } from '../models/reit.model';
import { environment } from '../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class ReitService {
    private baseUrl = environment.apiUrl + '/api/reits';

    constructor(private http: HttpClient) { }

    getReits(): Observable<ReitApiResponse> {
        return this.http.get<ReitApiResponse>(this.baseUrl);
    }

    updateReitDiv(ticker: string, newPrice: number): Observable<Reit> {
        return this.http.patch<Reit>(`${this.baseUrl}/${ticker}`, { newPrice });
    }
}
