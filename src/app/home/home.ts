import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Header } from '@layout/header/header';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet, Header],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})
export class Home {
}