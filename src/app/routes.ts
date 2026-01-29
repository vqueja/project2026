import { Routes } from "@angular/router";
import { StocksComponent } from "./home/stocks/stocks.component";
import { Home } from "./home/home";

const routeConfig: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'stocks',
        component: StocksComponent
    }
];

export default routeConfig;