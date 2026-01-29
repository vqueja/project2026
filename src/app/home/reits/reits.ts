import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReitService } from '@app/services/reit.service';
import { Reit, QuarterlyDividends, ReitApiResponse } from '@app/models/reit.model';
import { RouterLink } from '@angular/router';
import { Header } from '@layout/header/header';
import { catchError, of, Subject, startWith, tap, switchMap } from 'rxjs';
import { HTTP_ERROR_MESSAGES } from '@app/core/constants/http-errors';

@Component({
  selector: 'app-reits',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink, Header, CurrencyPipe],
  templateUrl: './reits.html',
  styleUrl: './reits.css'
})
export class Reits {
  private reitsService = inject(ReitService);

  allReits = computed(() => {
    const data = this.reitsResponse() as ReitApiResponse;
    return data?.[0]?.ph_reits || [];
  });
  searchTerm = signal<string>('');
  sortBy = signal<string>('symbol');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  private refresh$ = new Subject<void>();

  private reitsResponse = toSignal(
    this.refresh$.pipe(
      startWith(void 0),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap(() => this.reitsService.getReits().pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleHttpError(err);
          return of([] as ReitApiResponse);
        })
      )),
      tap((data: ReitApiResponse) => {
        console.log('REITs API Raw Data:', data);
        const reits = data?.[0]?.ph_reits;
        if (!reits || reits.length === 0) {
          if (!this.error()) {
            this.error.set('No REITs data available');
          }
        }
        this.isLoading.set(false);
      })
    ),
    { initialValue: [] as ReitApiResponse }
  );

  filteredReits = computed(() => {
    const reits = this.allReits();
    const term = this.searchTerm().toLowerCase().trim();

    let result = reits;
    if (term) {
      result = reits.filter((reit: Reit) =>
        reit.ticker.toLowerCase().includes(term) ||
        reit.company.toLowerCase().includes(term)
      );
    }

    return this.sortReits(result);
  });

  totalReits = computed(() => this.allReits().length);
  displayedReits = computed(() => this.filteredReits().length);


  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy);
  }

  private handleHttpError(err: HttpErrorResponse) {
    const message = HTTP_ERROR_MESSAGES[err.status] || 'An unexpected error occurred.';
    this.error.set(message);
  }

  private sortReits(reits: Reit[]): Reit[] {
    const sorted = [...reits];
    const sortByValue = this.sortBy();

    sorted.sort((a, b) => {
      switch (sortByValue) {
        case 'symbol':
          return a.ticker.localeCompare(b.ticker);
        case 'name':
          return a.company.localeCompare(b.company);
        case 'dividend':
          return this.getLatestAnnualDividend(b) - this.getLatestAnnualDividend(a);
        default:
          return 0;
      }
    });

    return sorted;
  }

  getLatestAnnualDividend(reit: Reit): number {
    const history = this.getLatestHistory(reit);
    if (!history) return 0;
    return (history.Q1 || 0) + (history.Q2 || 0) + (history.Q3 || 0) + (history.Q4 || 0);
  }

  getLatestYear(reit: Reit): string {
    const years = Object.keys(reit.dividend_history || {}).sort().reverse();
    return years.length > 0 ? years[0] : 'N/A';
  }

  getLatestHistory(reit: Reit): QuarterlyDividends | null {
    const year = this.getLatestYear(reit);
    return year !== 'N/A' ? reit.dividend_history[year] : null;
  }

  retry(): void {
    this.refresh$.next();
  }
}
