import { Routes } from "@angular/router";
import { Stocks } from "./home/stocks/stocks";
import { Home } from "./home/home";
import { Reits } from "./home/reits/reits";

const routeConfig: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'stocks',
        component: Stocks
    },
    {
        path: 'reits',
        component: Reits
    }
];

export default routeConfig;