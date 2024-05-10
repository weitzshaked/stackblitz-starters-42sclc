import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RatingCategory {
  name: string;
  score: number;
  percentage: number;
  level: string;
} 

export interface Article {
  id: number;
  title: string;
  platform: string;
  article_text: string;
  num_entities: number;
  num_quotes: number;
  sentiment_polarity: number;
  sentiment_subjectivity: number;
  num_speculations: number;
  article_length: number;
  avg_sentence_length: number;
  num_adjectives: number;
  num_numerical_data: number;
  readability: number;
  headline_relevance: number;
  topic_score: number;
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
  trustworthy_rate: number;
}

const article: Article = {
  id: 1,
  title: "RFK Jr. rarely mentions abortion — and sends mixed signals when he does",
  platform: "WashingtonPost",
  article_text: "... (full article text here) ...", // Replace with actual text
  num_entities: 133,
  num_quotes: 69,
  sentiment_polarity: 0.11429,
  sentiment_subjectivity: 0.407875,
  num_speculations: 7,
  article_length: 12848,
  avg_sentence_length: 145.0227,
  num_adjectives: 164,
  num_numerical_data: 37,
  readability: 56.59,
  headline_relevance: 0,
  topic_score: 1,
  scaled_num_entities: 0.188571,
  scaled_num_quotes: 0.394286,
  scaled_sentiment_polarity: 0.546628,
  scaled_sentiment_subjectivity: 0.42311,
  scaled_num_speculations: 0.21875,
  scaled_article_length: 0.197156,
  scaled_avg_sentence_length: 0.165821,
  scaled_num_adjectives: 0.202736,
  scaled_num_numerical_data: 0.126712,
  scaled_readability: 0.722529,
  scaled_headline_relevance: 0,
  trustworthy_rate: 0.430922
};

@Component({
    selector: 'index-details',
    standalone: true,
    imports: [CommonModule, LetDirective],
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexDetailsComponent implements OnInit {
  private _indexDetails$ = new BehaviorSubject<Article>(article).asObservable();// new Observable<Article>();

  public indexDetails$ = this._indexDetails$;

  public categories: RatingCategory[] = [
    { name: 'Factuality', score: 0.5, percentage: 50, level: 'Moderate' },
    { name: 'Objectivity', score: 0.5, percentage: 50, level: 'Moderate' },
    { name: 'Bias', score: 0.5, percentage: 50, level: 'Low' },
    { name: 'Depth', score: 0.5, percentage: 50, level: 'High' },
  ];

  constructor(private router: Router) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as {
      inputValue: string;
    };
    const articleLink = navigationState?.inputValue || ''; // Access passed data
  }

  ngOnInit(): void {
  }
}