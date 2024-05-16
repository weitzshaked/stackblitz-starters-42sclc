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

    // https://observablehq.com/@d3/streamgraph/2?intent=fork
    fetch('./images/data.json').then(r => r.json()).then((data: any[]) => {
      data = data.map(d => ({
        ...d,
        date: new Date(d.date).getTime()
      }));
      // Specify the chart’s dimensions.
      const marginTop = 10;
      const marginRight = 10;
      const marginBottom = 20;
      const marginLeft = 40;
      const width = chartContainer.offsetWidth - marginRight - marginLeft;
      const height = chartContainer.offsetHeight - marginTop - marginBottom;


      // Determine the series that need to be stacked.
      const series = d3.stack()
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut)
        .keys(d3.union(data.map(d => d.industry))) // distinct series keys, in input order
        .value(([, D]: any, key) => {
          return D.get(key)?.unemployed || 0;
        }) // get value for each series key and stack
        ((d3.index(data, d => d.date, d => d.industry)) as any); // group by stack then series key

      // Prepare the scales for positional and color encodings.
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date) as any)
        .range([marginLeft, width - marginRight]);

      const y = d3.scaleLinear()
        .domain(d3.extent(series.flat(2)) as any)
        .rangeRound([height - marginBottom, marginTop]);

      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeTableau10);

      // Construct an area shape.
      const area: any = d3.area()
        .x((d: any) => {
          return x(d.data[0]);
        })
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

      // Create the SVG container.
      // const svg = d3.create("svg")
      const svg = d3.select('.right-column').append('svg')
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

      // Add the y-axis, remove the domain line, add grid lines and a label.
      svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 80).tickFormat((d) => Math.abs(d as any).toLocaleString("en-US")))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Unemployed persons"));

      // Append the x-axis and remove the domain line.
      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.select(".domain").remove());

      // Append a path for each series.
      svg.append("g")
        .selectAll()
        .data(series)
        .join("path")
        .attr("fill", d => color(d.key) as string)
        .attr("d", area)
        .append("title")
        .text(d => d.key);
    });


    // https://d3-graph-gallery.com/graph/streamgraph_template.html
    // set the dimensions and margins of the graph
    // const margin = { top: 20, right: 30, bottom: 0, left: 10 },
    //   width = chartContainer.offsetWidth - margin.left - margin.right,
    //   height = chartContainer.offsetHeight - margin.top - margin.bottom;

    // // append the svg object to the body of the page
    // const svg = d3.select('.right-column')
    //   .append('svg')
    //   .attr('width', width + margin.left + margin.right)
    //   .attr('height', height + margin.top + margin.bottom)
    //   .append('g')
    //   .attr('transform',
    //     'translate(' + margin.left + ',' + margin.top + ')');

    // d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv').then((data: any) => {
    //   // List of groups = header of the csv files
    //   const keys = data.columns.slice(1)
    //   console.log('+++', this.calculateScore());
    //   // Add X axis
    //   const x = d3.scaleLinear()
    //     .domain(d3.extent(data, function (d: any) { return d.year; }) as Iterable<any>)
    //     .range([0, width]);
    //   svg.append('g')
    //     .attr('transform', 'translate(0,' + height * 0.8 + ')')
    //     .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([1900, 1925, 1975, 2000]))
    //     .select('.domain').remove()
    //   // Customization
    //   svg.selectAll('.tick line').attr('stroke', '#b8b8b8')

    //   // Add X axis label:
    //   svg.append('text')
    //     .attr('text-anchor', 'end')
    //     .attr('x', width)
    //     .attr('y', height - 30)
    //     .text('Time (year)');

    //   // Add Y axis
    //   const y = d3.scaleLinear()
    //     .domain([-100000, 100000])
    //     .range([height, 0]);

    //   // color palette
    //   const color = d3.scaleOrdinal()
    //     .domain(keys)
    //     .range(d3.schemeDark2);

    //   //stack the data?
    //   const stackedData = d3.stack()
    //     .offset(d3.stackOffsetSilhouette)
    //     .keys(keys)
    //     (data)

    //   // Area generator
    //   const area: any = d3.area()
    //     .x(function (d: any) { return x(d.data.year); })
    //     .y0(function (d) { return y(d[0]); })
    //     .y1(function (d) { return y(d[1]); })

    //   // Show the areas
    //   svg
    //     .selectAll('mylayers')
    //     .data(stackedData)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'myArea')
    //     .style('fill', (d) => color(d.key) as string)
    //     .attr('d', area)
    // });
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

  // https://github.com/littleJamieZ/The-Aletheia-Index/blob/main/score.py
  private calculateScore(features: any = {
    scaled_num_entities: 0.6292134831460674,
    scaled_num_quotes: 0.4642857142857143,
    scaled_sentiment_polarity: 0.5176096934890906,
    scaled_sentiment_subjectivity: 1.0,
    scaled_num_speculations: 0.16666666666666666,
    scaled_article_length: 0.5933622365076993,
    scaled_avg_sentence_length: 0.6655516175903258,
    scaled_num_adjectives: 0.22413793103448276,
    scaled_num_numerical_data: 0.20512820512820512,
    scaled_readability: 0.3647890758351621,
    scaled_headline_relevance: 0.0,
    topic_score: 0.0
  }) {
    const weights = {
      factuality: 0.1,
      objectivity: 0.1,
      comprehensiveness: 0.1,
      depth: 0.05,
      language: 0.15,
      structure: 0.15,
      headline: 0.15,
      credibility: 0.1,
      bias: 0.1
    }

    // Map each feature to its category and calculate the weighted score
    // Update the features with their scaled names as per the CSV
    const weightedScores = {
      factuality: (features.scaled_num_entities + features.scaled_num_quotes - features.scaled_num_speculations) * weights.factuality,
      objectivity: (1 - features.scaled_sentiment_subjectivity) * weights.objectivity,
      comprehensiveness: features.topic_score * weights.comprehensiveness,  // Assuming scaled_topic_score exists
      depth: (features.scaled_avg_sentence_length + features.scaled_article_length) * weights.depth,
      language: features.scaled_num_adjectives * weights.language,
      structure: features.scaled_readability * weights.structure,
      headline: features.scaled_headline_relevance * weights.headline,
      credibility: (features.scaled_num_numerical_data + features.scaled_num_speculations) * weights.credibility,
      bias: (1 - features.scaled_sentiment_polarity) * weights.bias
    }

    // Sum the weighted scores for the final score
    const finalScore = Object.values(weightedScores).reduce((a, b) => a + b, 0);

    // Normalize the final score to be out of 1
    const normalizedFinalScore = finalScore / Object.values(weights).reduce((a, b) => a + b, 0);

    return weightedScores;
  }
}