import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-percentage-bar',
  standalone: true,
  templateUrl: './percentage-bar.component.html',
  styleUrls: ['./percentage-bar.component.less'],
})
export class PercentageBarComponent {
  @Input() leftPercentage: number = 0;
  @Input() rightPercentage: number = 0;
  @Input() leftLabel: string = '';
  @Input() rightLabel: string = '';
  @Input() leftColor = 'blue';
  @Input() rightColor = 'magenta';
}