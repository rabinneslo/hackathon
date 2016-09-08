import {ElementRef, Output, Component, OnInit, EventEmitter} from '@angular/core';
import {MapService} from '../services/index';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import '../shared/rxjs-operators';

@Component({
    selector: 'autocomplete',
    host: {
        '(document:click)': 'handleClick($event)'
    },
    providers:[MapService],
    template: `
        <div class="searchBoxWrapper">
            <input type="text" placeholder="Zoek scholen..." class="form-control" [formControl]="query"/>
            <a class="btn btn-zoeken">
                <i class="fa fa-search zoeken"></i>
            </a>
        </div>
        <div class="suggestions" *ngIf="results.length > 0">
            <ul class="suggestions-results">
                <li *ngFor="let item of results">
                    <a (click)="select(item)">{{item.naam}} ({{item.adres.plaats}})</a>
                </li>
            </ul>
        </div>	
        `
})
export class AutoComplete {
    @Output() selection = new EventEmitter();
    private results: Array<any> = [];
    public elementRef;
    private query = new FormControl();
    constructor(myElement: ElementRef, private service:MapService) {
        this.elementRef = myElement;
    }
    ngOnInit() {
        this.query
        .valueChanges
        .debounceTime(400)
        .distinctUntilChanged()
        .switchMap(term => this.service.getSchools(term))
        .subscribe(items => {
            this.results = items.hits && items.hits.hits ? items.hits.hits.map(x=>x._source) : [];
        },
        (error)=>{
            console.log(error);
        });
    }
 
    select(item){
        this.selection.emit(item);
        this.results = [];
    }

    handleClick(event){
        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } 
        while (clickedComponent);
        if(!inside){
            this.results = [];
        }
    }
}