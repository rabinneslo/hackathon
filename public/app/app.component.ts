import {Component, OnInit } from '@angular/core';
import {MapService} from './services/index';
import {MapChart} from './directives/map';
import {AutoComplete} from './components/autoComplete';
import {Observable} from 'rxjs/Observable';
import 'rxjs/rx';

@Component({
  directives:[MapChart, AutoComplete],
  selector: 'hackathon',
  templateUrl: 'app/app.html',
  providers:[MapService]
})
export class AppComponent { 
   private data : any;
   private clusters : Array<any> = [
     {value : 'cito', display : 'School advies'},
     {value : 'kmean', display: 'K-mean clustering'},
     {value : 'inspectie', display: 'Kwaliteit scholen'}];
   private measures : Array<any> = [
     {value : 'leerlingen', display : 'Aantal leerlingen'},
     {value : 'rijksbijdrage', display: 'Rijksbijdrage per leerling'},
     {value : 'afstand', display: 'Afstand tot school'},
     {value : 'aantal', display: 'Aantal scholen'},
   ];
   private cluster : string = this.clusters[0].value;
   private measure : string = this.measures[0].value;
   private view : string = 'map';
   private views : Array<string> = ['map', 'histogram'];
   private bezetting : number = 90;
   constructor(private mapService:MapService){

   }
   ngOnInit(){
     this.data = Observable.combineLatest(
       this.mapService.getCities(),
       this.mapService.getSchools(),
       (cities,schools)=>{
         return {cities: cities, schools: schools};
       }
     )
   }

   updateBezetting(value){
     this.bezetting = 100 - value;
   }
}