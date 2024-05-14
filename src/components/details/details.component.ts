import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { LetDirective } from '@ngrx/component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as d3 from 'd3';

import { PercentageBarComponent } from '../percentage-bar/percentage-bar.component';

export interface RatingCategory {
  name: string;
  score: number;
  percentage: number;
  level: string;
}

export interface Article {
  title: string;
  platform: string;
  factuality: number;
  objectivity: number;
  comprehensiveness: number;
  depth: number;
  language: number;
  structure: number;
  headline: number;
  credibility: number;
  bias: number;
}

const article: Article = {
  title: 'RFK Jr. rarely mentions abortion — and sends mixed signals when he does',
  platform: 'WashingtonPost',
  factuality: 0.85,
  objectivity: 0.7,
  comprehensiveness: 0.9,
  depth: 0.65,
  language: 0.8,
  structure: 0.95,
  headline: 0.75,
  credibility: 0.8,
  bias: 0.3
};

@Component({
  selector: 'index-details',
  standalone: true,
  imports: [CommonModule, LetDirective, PercentageBarComponent],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexDetailsComponent implements OnInit, AfterViewInit {
  private chartContainer = viewChild<ElementRef<HTMLDivElement>>('chart');

  private _indexDetails$ = new BehaviorSubject<Article>(article).asObservable();// new Observable<Article>();
  private _catagories$ = new BehaviorSubject<RatingCategory[]>([]);
  private _jsonData: any;

  public indexDetails$ = this._indexDetails$;
  public categories$ = this._catagories$.asObservable();

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    const articleLink = navigationState?.inputValue || ''; // Access passed data
  }

  ngOnInit(): void {
    this._catagories$.next([
      { name: 'Factuality', score: article.factuality, percentage: 50, level: 'Moderate' },
      { name: 'Objectivity', score: article.objectivity, percentage: 50, level: 'Moderate' },
      { name: 'Comprehensiveness', score: article.comprehensiveness, percentage: 50, level: 'Moderate' },
      { name: 'Depth', score: article.depth, percentage: 50, level: 'High' },
      { name: 'Structure', score: article.structure, percentage: 50, level: 'High' },
      { name: 'Headline relevance', score: article.headline, percentage: 50, level: 'Low' },
      { name: 'Credability', score: article.credibility, percentage: 50, level: 'High' },
      { name: 'Language', score: article.language, percentage: 50, level: 'High' },
      { name: 'Bias', score: article.bias, percentage: 50, level: 'Low' },
    ]);
  }

  ngAfterViewInit() {
    const chartContainer = this.chartContainer()?.nativeElement;

    if (!chartContainer) {
      return;
    }

    // https://d3-graph-gallery.com/graph/streamgraph_template.html
    // set the dimensions and margins of the graph
    const margin = { top: 20, right: 30, bottom: 0, left: 10 },
      width = chartContainer.offsetWidth - margin.left - margin.right,
      height = chartContainer.offsetHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select('.right-column')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv').then((data: any) => {
      // List of groups = header of the csv files
      const keys = data.columns.slice(1)

      // Add X axis
      const x = d3.scaleLinear()
        .domain(d3.extent(data, function (d: any) { return d.year; }) as Iterable<any>)
        .range([0, width]);
      svg.append('g')
        .attr('transform', 'translate(0,' + height * 0.8 + ')')
        .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([1900, 1925, 1975, 2000]))
        .select('.domain').remove()
      // Customization
      svg.selectAll('.tick line').attr('stroke', '#b8b8b8')

      // Add X axis label:
      svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('y', height - 30)
        .text('Time (year)');

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([-100000, 100000])
        .range([height, 0]);

      // color palette
      const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

      //stack the data?
      const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

      // create a tooltip
      const Tooltip = svg
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('opacity', 0)
        .style('font-size', 17)

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function (d: any) {
        Tooltip.style('opacity', 1)
        d3.selectAll('.myArea').style('opacity', .2)
        // d3.select(this)
        //   .style('stroke', 'black')
        //   .style('opacity', 1)
      }
      const mousemove = function (d: any, i: any) {
        // grp = keys[i]
        // Tooltip.text(grp)
      }
      const mouseleave = function (d: any) {
        Tooltip.style('opacity', 0)
        d3.selectAll('.myArea').style('opacity', 1).style('stroke', 'none')
      }

      // Area generator
      const area: any = d3.area()
        .x(function (d: any) { return x(d.data.year); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })

      // Show the areas
      svg
        .selectAll('mylayers')
        .data(stackedData)
        .enter()
        .append('path')
        .attr('class', 'myArea')
        .style('fill', (d) => color(d.key) as string)
        .attr('d', area)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)

    });
  }

  public onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt: any) => {
        try {
          this._jsonData = JSON.parse(evt.target.result);
          // Now you can use the parsed JSON data
          console.log(this._jsonData);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          // Handle error, e.g., display error message to the user
        }
      };
      reader.onerror = (evt) => {
        console.error('Error reading file:', evt);
        // Handle error, e.g., display error message to the user
      };
    }
  }
}