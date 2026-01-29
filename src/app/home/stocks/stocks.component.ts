import { Component, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { StockService } from '@app/services/stock.service';
import { Stock } from '@app/models/stock.model';
import { RouterLink } from '@angular/router';
import { Header } from '@layout/header/header';
import { catchError, of, Subject, switchMap, tap, startWith, concatMap, EMPTY } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HTTP_STATUS, HTTP_ERROR_MESSAGES } from '@app/core/constants/http-errors';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink, Header, CurrencyPipe],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.css'
})
export class StocksComponent {
  private stockService = inject(StockService);
  private destroyRef = inject(DestroyRef);
  allStocks = signal<Stock[]>([]);
  searchTerm = signal<string>('');
  sortBy = signal<string>('symbol');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  editingStockTicker = signal<string | null>(null);
  editPriceValue = signal<number | null>(null);

  // 1. Trigger for loading/refreshing data
  private refresh$ = new Subject<void>();
  private updatePrice$ = new Subject<{ ticker: string, price: number }>();

  // 2. The Data Stream converted to a Signal
  private stocksResponse = toSignal(
    this.refresh$.pipe(
      startWith(void 0), // Trigger initial load automatically
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap(() => this.stockService.getStocks().pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleHttpError(err);
          return of([] as Stock[]);
        })
      )),
      tap((data) => {
        if (data.length === 0 && !this.error()) {
          this.error.set('No stocks data available');
        }
        this.isLoading.set(false);
      })
    ),
    { initialValue: [] as Stock[] }
  );

  filteredStocks = computed(() => {
    const stocks = this.allStocks();
    const term = this.searchTerm().toLowerCase().trim();

    let result = stocks;
    if (term) {
      result = stocks.filter(stock =>
        stock.ticker.toLowerCase().includes(term) ||
        stock.company_name.toLowerCase().includes(term)
      );
    }

    return this.sortStocks(result);
  });

  totalStocks = computed(() => this.allStocks().length);

  displayedStocks = computed(() => this.filteredStocks().length);

  avgYield = computed(() => {
    const stocks = this.allStocks();
    if (stocks.length === 0) return 0;

    const totalYield = stocks.reduce((sum, stock) => {
      const yieldValue = parseFloat(stock.dividend_yield.replace('%', ''));
      return sum + yieldValue;
    }, 0);

    return totalYield / stocks.length;
  });

  constructor() {
    // Sync the stream response to our writable allStocks signal
    // This allows the toSignal to handle the "fetch" while allowing local "updates"
    effect(() => {
      const data = this.stocksResponse();
      if (data) this.allStocks.set(data);
    }, { allowSignalWrites: true });

    this.updatePrice$.pipe(
      // Use concatMap to ensure every update request is processed
      concatMap(({ ticker, price }) =>
        this.stockService.updateStockPrice(ticker, price).pipe(
          tap(() => {
            this.allStocks.update(stocks =>
              stocks.map(s => s.ticker === ticker ? { ...s, current_price: price } : s)
            );
            this.cancelEditing();
          }),
          catchError((err: HttpErrorResponse) => {
            this.handleHttpError(err);
            return EMPTY;
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy);
  }

  private handleHttpError(err: HttpErrorResponse) {
    // Logic for specific status codes
    if (err.status === HTTP_STATUS.UNAUTHORIZED) {
      this.error.set('Your session expired. Please log in.');
    } else if (err.status === HTTP_STATUS.NOT_FOUND) {
      this.error.set('The stock data source could not be found.');
    } else {
      // Fallback to the generic map we created earlier
      const message = HTTP_ERROR_MESSAGES[err.status] || 'An unexpected error occurred.';
      this.error.set(message);
    }
  }

  private sortStocks(stocks: Stock[]): Stock[] {
    const sorted = [...stocks];
    const sortByValue = this.sortBy();

    sorted.sort((a, b) => {
      switch (sortByValue) {
        case 'symbol':
          return a.ticker.localeCompare(b.ticker);

        case 'name':
          return a.company_name.localeCompare(b.company_name);

        case 'dividendYield':
          const yieldA = parseFloat(a.dividend_yield.replace('%', ''));
          const yieldB = parseFloat(b.dividend_yield.replace('%', ''));
          return yieldB - yieldA; // Descending

        case 'price':
          return b.current_price - a.current_price; // Descending

        default:
          return 0;
      }
    });

    return sorted;
  }

  getStockName(stock: Stock): string {
    return stock.company_name;
  }

  getStockPrice(stock: Stock): number {
    return stock.current_price;
  }

  getStockYield(stock: Stock): number {
    return parseFloat(stock.dividend_yield.replace('%', ''));
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatPercentage(value: number): string {
    return value.toFixed(2);
  }

  retry(): void {
    this.refresh$.next();
  }

  startEditing(stock: Stock): void {
    this.editingStockTicker.set(stock.ticker);
    this.editPriceValue.set(stock.current_price);
  }

  cancelEditing(): void {
    this.editingStockTicker.set(null);
    this.editPriceValue.set(null);
  }

  savePrice(ticker: string): void {
    const price = this.editPriceValue();
    if (price !== null && price >= 0) {
      this.updatePrice$.next({ ticker, price });
    }
  }



}
