import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import '../shared/rxjs-operators';

@Injectable()
export class MapService {
constructor(private http:Http) { }
  // Uses http.get() to load a single JSON file
  getCities() {
    return this.http.get('/json/cities.json').map((res:Response) => res.json());
  }

  getSchools(query:string='*'){
    return this.http.get(`/api/school?term=${query}`).map((res:Response) => res.json());
  }
}