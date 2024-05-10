import { Component } from '@angular/core';
import { Routes, RouterModule, RouterOutlet, provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component'
import { IndexDetailsComponent } from './components/details/details.component';

import 'zone.js';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details', component: IndexDetailsComponent },
]

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './main.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule]
})
export class App {  
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)
  ]
});
