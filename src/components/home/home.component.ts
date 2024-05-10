import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  inputValue: string = '';

  constructor(private router: Router) {}
  private newLink: string = '';

  public onInputChange(event: any){
    if(event && event.target.value) {
      console.log(event.target.value);
      this.newLink = event.target.value;
    }
  }

  public navigateToDetails() {
    //todo call BE API with link
    // Navigate to details page, optionally passing data
    this.router.navigate(['details'], { state: { inputValue: this.newLink } });
  }
}