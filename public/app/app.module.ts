import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule, JsonpModule} from '@angular/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent}  from './app.component';
import {AutoComplete} from './components/autoComplete';
import {MapChart} from './directives/map';

@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  ReactiveFormsModule,
                  HttpModule,
                  JsonpModule ],
  declarations: [ AppComponent, MapChart, AutoComplete ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { 
    
}