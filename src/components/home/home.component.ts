import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  inputValue: string = '';

  constructor(private router: Router) {}

  public onInputChange(newValue: string){
    console.log(newValue);
    //todo call BE API with link

    this.navigateToDetails();
  }

  public navigateToDetails() {
    // Navigate to details page, optionally passing data
    this.router.navigate(['/details'], { state: { inputValue: this.inputValue } });
  }
}