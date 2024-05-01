import { Component } from '@angular/core';
import { RouterModule, provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';

import { HomeComponent } from './components/home/home.component'
import { DetailsComponent } from './components/details/details.component';

import 'zone.js';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './main.component.html',
  imports: [RouterModule],
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'details', component: DetailsComponent },
    ])
  ]
});