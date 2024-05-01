import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'details',
    standalone: true,
    imports: [],
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.less']
})
export class DetailsComponent {
  inputValue: string;

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    this.inputValue = navigationState?.inputValue || ''; // Access passed data
  }
}