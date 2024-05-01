import { Component } from '@angular/core';
import { Router } from '@angular/router';

export interface RatingCategory {
  name: string;
  score: number;
  percentage: number;
  level: string;
} 

@Component({
    selector: 'details',
    standalone: true,
    imports: [],
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.less']
})
export class DetailsComponent {
  inputValue: string;

  public categories: RatingCategory[] = [
    { name: 'Factuality', score: 0.5, percentage: 50, level: 'Moderate' },
    { name: 'Objectivity', score: 0.5, percentage: 50, level: 'Moderate' },
    // ... other categories
  ];

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    this.inputValue = navigationState?.inputValue || ''; // Access passed data
  }
}