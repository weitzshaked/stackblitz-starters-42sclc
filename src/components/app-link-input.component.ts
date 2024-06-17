import { Component } from '@angular/core';

@Component({
  selector: 'app-link-input',
  template: `
    <div class="input-container">
      <input type="text" class="link-input" placeholder="Paste a link or an article you want to assess">
      <button class="submit-button">
        <span class="arrow-right"></span>
      </button>
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      align-items: center;
      border: 1px solid transparent;
      border-image: linear-gradient(to right, purple, pink) 1;
      border-radius: 8px;
    }
    .link-input {
      flex-grow: 1;
      border: none;
      outline: none;
      padding: 8px 16px;
      font-size: 16px;
      color: #666;
      background-color: transparent;
      border-radius: 8px 0 0 8px;
    }
    .submit-button {
      padding: 8px 16px;
      border: none;
      background-color: transparent;
      cursor: pointer;
      border-radius: 0 8px 8px 0;
    }
    .arrow-right {
      display: inline-block;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 5px solid #333;
    }
  `],
  standalone: true,
})
export class LinkInputComponent {
  // Component logic goes here
}
