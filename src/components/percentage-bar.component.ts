import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-percentage-bar',
  standalone: true,
  template: `
    <div class="bar-container">
      <div class="bar"
           [style.width.%]="leftPercentage"
           [style.background-color]="leftColor">
      </div>
      <div class="bar"
           [style.width.%]="rightPercentage"
           [style.background-color]="rightColor">
      </div>
    </div>
    <div class="labels">
      <span>{{ leftLabel }} ({{ leftPercentage }}%)</span>
      <span>{{ rightLabel }} ({{ rightPercentage }}%)</span>
    </div>
  `,
  styles: [`
    .bar-container {
      display: flex;
      width: 100%;
      height: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
    }
    .labels {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
    }
  `]
})
export class PercentageBarComponent {
  @Input() leftPercentage: number = 0;
  @Input() rightPercentage: number = 0;
  @Input() leftLabel: string = '';
  @Input() rightLabel: string = '';
  @Input() leftColor = 'blue';
  @Input() rightColor = 'magenta';
}