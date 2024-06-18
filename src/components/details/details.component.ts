import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { LetDirective } from '@ngrx/component';
import * as d3 from 'd3';
import { BehaviorSubject, Subject } from 'rxjs';

import { PercentageBarComponent } from '../percentage-bar/percentage-bar.component';

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
  imports: [CommonModule, LetDirective, PercentageBarComponent, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexDetailsComponent implements OnInit {
  private chartContainer = viewChild<ElementRef<HTMLDivElement>>('chart');
  @ViewChild('chart') set content(content: ElementRef) {
    if(content) { // initially setter gets called with undefined
        this.createChart(content.nativeElement);
    }
  }
  private articleLink: string = '';

  private _indexDetails$ = new Subject<Instance>();// new Observable<Instance>();
  private _catagories$ = new BehaviorSubject<RatingCategory[]>([]);
  private _finalScore$ = new BehaviorSubject<number>(0);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  
  public isLoading$ = this._isLoading$.asObservable();
  public indexDetails$ = this._indexDetails$.asObservable();
  public categories$ = this._catagories$.asObservable();
  public finalScore$ = this._finalScore$.asObservable();

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    this.articleLink = navigationState?.inputValue || ''; // Access passed data
    // if (this.articleLink) {
    //   this.onInputEnter();
    // }
  }

  public onInputChange(event: any){
    if(event && event.target.value) {
      this.articleLink = event.target.value;
    }
  }

  public onInputEnter() {
    this._isLoading$.next(true);
    // fetch('https://aletheiaindex.azurewebsites.net/scrap', { 
    //   method: 'POST', 
    //   body: JSON.stringify({
    //       url: this.articleLink,//'https://www.usatoday.com/story/money/2024/06/13/tyson-foods-cfo-suspended-arrest/74088703007/',
    //   }), 
    //   headers: { "Content-Type": "application/json" },
    //   }).then(r => r.json()).then((data: any) => {
    //     const article = this.getAllDetails(data);
    //     this._indexDetails$.next(article);
    //   }).finally(() => this._isLoading$.next(false));


    // fetch('./images/input_data.json').then(r => r.json()).then((data: ApiResponse) => {
    //   const article = this.getAllDetails(data.instances[0]);
    //   this._indexDetails$.next(article);
    // }).finally(() => this._isLoading$.next(false));

      fetch('./images/cache.json').then(r => r.json()).then((data) => {
      const article = this.getAllDetails(data[this.articleLink]);
      this._indexDetails$.next(article);
      this.createChart(this.chartContainer()?.nativeElement);
    }).finally(() => this._isLoading$.next(false));
  }

  ngOnInit(): void {
    // create initial data
    // fetch('./images/input_data.json').then(r => r.json()).then((data: any) => {
    //       const article = this.getAllDetails(data);
    //       this._indexDetails$.next(article);
    // });
  }

  // public onFileSelected(event: any): void {
  //   const file: File = event.target.files[0];

  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsText(file, 'UTF-8');
  //     reader.onload = (evt: any) => {
  //       try {
  //         const _jsonData = JSON.parse(evt.target.result) as ApiResponse;
  //         const article = this.getAllDetails(_jsonData);
  //         this._indexDetails$.next(article);
  //       } catch (e) {
  //         console.error('Error parsing JSON:', e);
  //         // Handle error, e.g., display error message to the user
  //       }
  //     };
  //     reader.onerror = (evt) => {
  //       console.error('Error reading file:', evt);
  //       // Handle error, e.g., display error message to the user
  //     };
  //   }
  // }

  private getAllDetails(article: Instance): Instance {
    // Now you can use the parsed JSON data
    // const article = _jsonData.instances[0] as Instance;
    const weightedScores = this.calculateScore(article);
    this._catagories$.next([
      { name: 'Factuality', score: weightedScores.factuality, rating: this.getRating(weightedScores.factuality * 10) },
      { name: 'Objectivity', score: weightedScores.objectivity, rating: this.getRating(weightedScores.objectivity * 10) },
      { name: 'Comprehensiveness', score: weightedScores.comprehensiveness, rating: this.getRating(weightedScores.comprehensiveness * 10) },
      { name: 'Depth', score: weightedScores.depth, rating: this.getRating(weightedScores.depth * 10) },
      { name: 'Structure', score: weightedScores.structure, rating: this.getRating(weightedScores.structure * 10) },
      { name: 'Headline relevance', score: weightedScores.headline, rating: this.getRating(weightedScores.headline * 10) },
      { name: 'Credability', score: weightedScores.credibility, rating: this.getRating(weightedScores.credibility * 10) },
      { name: 'Language', score: weightedScores.language, rating: this.getRating(weightedScores.language * 10) },
      { name: 'Bias', score: weightedScores.bias, rating: this.getRating(weightedScores.bias * 10) },
    ]);
    return article;
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

  private createChart(chartContainer: any): void {
    if (!chartContainer) {
      console.log('no chart container');
      return;
    }

    // map data to
    const data = this._catagories$.getValue().map(d => ({
          ...d,
          score: d.score * 10
        })
    );

    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;
    const width = chartContainer.offsetWidth - marginRight - marginLeft;
    const height = chartContainer.offsetHeight - marginTop - marginBottom;

    d3.select('svg').remove();
    const svg = d3.select('.right-column').append('svg')
    .attr("viewBox", [0, 0, width, height * 1.08])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    x.domain(data.map((d) => d.name));
    y.domain([-1, 1]);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(10, '%'))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Score');

    g.selectAll('.bar.positive')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.name)!)
      .attr('y', (d) => y(Math.max(0, d.score)))
      .attr('width', x.bandwidth())
      .attr('height', (d) => Math.abs(y(d.score) - y(0)))
      .attr('fill', '#001AFF');

    g.selectAll('.bar.negative')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar negative')
      .attr('x', (d) => x(d.name)!)
      .attr('y', (d) => y(0))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(1 - d.score))
      .attr('fill', '#FF00D6');
  }
}