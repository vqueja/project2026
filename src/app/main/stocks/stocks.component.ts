import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StockService } from '../../services/stock.service';
import { Stock } from '../../models/stock.model';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.css'
})
export class StocksComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  // Signals for state management
  private allStocks = signal<Stock[]>([]);
  searchTerm = signal<string>('');
  sortBy = signal<string>('symbol');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Editing State
  editingStockTicker = signal<string | null>(null);
  editPriceValue = signal<number | null>(null);

  // Computed signals for derived state
  filteredStocks = computed(() => {
    const stocks = this.allStocks();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) {
      return this.sortStocks(stocks);
    }

    const filtered = stocks.filter(stock => {
      const ticker = stock.ticker.toLowerCase();
      const name = stock.company_name.toLowerCase();
      return ticker.includes(term) || name.includes(term);
    });

    return this.sortStocks(filtered);
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

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.stockService.getStocks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data) || data.length === 0) {
            this.error.set('No stocks data available');
            this.isLoading.set(false);
            return;
          }

          this.allStocks.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching stocks:', err);
          this.error.set(err.message || 'Failed to load stocks. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy);
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
    this.loadStocks();
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
    const newPrice = this.editPriceValue();
    if (newPrice === null || newPrice < 0) return;

    // Optimistically update the UI or show loading?
    // Let's call the service
    this.stockService.updateStockPrice(ticker, newPrice)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Update local state
          if (!response) {
            console.error('No response received');
            return;
          }
          this.allStocks.update(stocks =>
            stocks.map(s =>
              s.ticker === ticker
                ? { ...s, current_price: newPrice }
                : s
            )
          );
          this.cancelEditing();
        },
        error: (err) => {
          console.error('Error updating price:', err);
          alert('Failed to update price. Please try again.');
        }
      });
  }

}
