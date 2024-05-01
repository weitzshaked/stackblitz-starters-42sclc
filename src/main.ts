import { Component, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';

import { HomeComponent } from './components/home/home.component'
import { DetailsComponent } from './components/details/details.component';

import 'zone.js';
import { APP_BASE_HREF } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './main.component.html',
  imports: [HomeComponent],
})
export class App {
  name = 'Angular';
}

const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route (main page)
  { path: 'details', component: DetailsComponent }
];

bootstrapApplication(App);