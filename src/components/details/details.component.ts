import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
  title: "RFK Jr. rarely mentions abortion — and sends mixed signals when he does",
  platform: "WashingtonPost",
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
    imports: [CommonModule, LetDirective],
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexDetailsComponent implements OnInit {
  private _indexDetails$ = new BehaviorSubject<Article>(article).asObservable();// new Observable<Article>();
  private _catagories$ = new BehaviorSubject<RatingCategory[]>([]);

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
      { name: 'Structure', score: article.structure, percentage: 50, level: 'High'},
      { name: 'Headline relevance', score: article.headline, percentage: 50, level: 'Low' },
      { name: 'Credability', score: article.credibility, percentage: 50, level: 'High' },
      { name: 'Language', score: article.language, percentage: 50, level: 'High'},
      { name: 'Bias', score: article.bias, percentage: 50, level: 'Low' },
    ]);
  }
}