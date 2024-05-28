import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { LetDirective } from '@ngrx/component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as d3 from 'd3';

import { PercentageBarComponent } from '../percentage-bar/percentage-bar.component';
import { _isNumberValue } from '@angular/cdk/coercion';

export interface Instance {
  id: string;
  title: string;
  platform: string;
  article_text: string;
  scaled_num_entities: number;
  scaled_num_quotes: number;
  scaled_sentiment_polarity: number;
  scaled_sentiment_subjectivity: number;
  scaled_num_speculations: number;
  scaled_article_length: number;
  scaled_avg_sentence_length: number;
  scaled_num_adjectives: number;
  scaled_num_numerical_data: number;
  scaled_readability: number;
  scaled_headline_relevance: number;
  topic_score: number;
}

export interface ApiResponse {
  instances: Instance[];
}

export interface RatingCategory {
  name: string;
  score: number;
  rating: string;
}

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

  private _indexDetails$ = new Subject<Instance>();// new Observable<Instance>();
  private _catagories$ = new BehaviorSubject<RatingCategory[]>([]);
  private _finalScore$ = new BehaviorSubject<number>(0);
  private _jsonData: any;

  public indexDetails$ = this._indexDetails$.asObservable();
  public categories$ = this._catagories$.asObservable();
  public finalScore$ = this._finalScore$.asObservable();

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    const articleLink = navigationState?.inputValue || ''; // Access passed data
  }

  ngOnInit(): void {
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
          this._jsonData = JSON.parse(evt.target.result) as ApiResponse;
          // Now you can use the parsed JSON data
          console.log(this._jsonData);
          const article = this._jsonData.instances[0] as Instance;
          const weightedScores = this.calculateScore(article);
          console.log(weightedScores);
          this._catagories$.next([
            { name: 'Factuality', score: weightedScores.factuality, rating: this.getRating(weightedScores.factuality * 10) },
            { name: 'Objectivity', score: weightedScores.objectivity, rating: this.getRating(weightedScores.objectivity * 10) },
            { name: 'Comprehensiveness', score: weightedScores.comprehensiveness, rating: this.getRating(weightedScores.comprehensiveness * 10) },
            { name: 'Depth', score: weightedScores.depth, rating: this.getRating(weightedScores.depth * 10) },
            { name: 'Structure', score: weightedScores.structure, rating: this.getRating(weightedScores.structure * 10) },
            { name: 'Headline relevance', score: weightedScores.headline, rating: this.getRating(weightedScores.headline * 10) },
            { name: 'Credability', score: weightedScores.credibility, rating: this.getRating(weightedScores.credibility * 10) },
            { name: 'Language', score: weightedScores.language, rating: this.getRating(weightedScores.language * 10) },
            { name: 'Bias', score: weightedScores.bias, rating: this.getRating(weightedScores.bias * 10)},
          ]);
          this._indexDetails$.next(article);
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
  private calculateScore(features: Instance) {
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
      factuality: (this.truncate(features.scaled_num_entities) + this.truncate(features.scaled_num_quotes) - this.truncate(features.scaled_num_speculations)) * weights.factuality,
      objectivity: (1 - this.truncate(features.scaled_sentiment_subjectivity)) * weights.objectivity,
      comprehensiveness: this.truncate(features.topic_score) * weights.comprehensiveness,  // Assuming scaled_topic_score exists
      depth: (this.truncate(features.scaled_avg_sentence_length) + this.truncate(features.scaled_article_length)) * weights.depth,
      language: this.truncate(features.scaled_num_adjectives) * weights.language,
      structure: this.truncate(features.scaled_readability) * weights.structure,
      headline: this.truncate(features.scaled_headline_relevance) * weights.headline,
      credibility: (this.truncate(features.scaled_num_numerical_data) + this.truncate(features.scaled_num_speculations)) * weights.credibility,
      bias: (1 - this.truncate(features.scaled_sentiment_polarity)) * weights.bias
    }

    // Sum the weighted scores for the final score
    const finalScore = Object.values(weightedScores).reduce((a, b) => a + b, 0);

    // Normalize the final score to be out of 1
    const normalizedFinalScore = finalScore / Object.values(weights).reduce((a, b) => a + b, 0);
    this._finalScore$.next(normalizedFinalScore * 100);

    return weightedScores;
  }

  public truncate(value: number): number {
    return parseFloat((Math.floor(value * 100) / 100).toFixed(2));
  }

  public getRating(score: number) {
    const percentage = score * 100;
    if (percentage >= 0 && percentage <= 40) {
      return "Low";
    } else if (percentage > 40 && percentage <= 50) {
      return "Moderate";
    } else if (percentage > 50 && percentage <= 100) {
      return "High";
    } else {
      return "Invalid"; // Handle invalid percentages
    }
  }

  public getRatingClass(rating: string, inverse = false){
    const ratingClass = rating.toLocaleLowerCase();
    if (ratingClass !== 'moderate' && inverse) {
      return ratingClass === 'low' ? 'high' : 'low';
    }

    return ratingClass;
  }
}