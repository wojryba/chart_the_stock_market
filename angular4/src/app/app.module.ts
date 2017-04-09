import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ChartModule } from 'angular2-highcharts';

import { AppComponent } from './app.component';
import { ChartComponent } from './components/chart/chart.component';

import { ApiService } from './services/api.service';

declare var require: any;

const Highcharts = require('highcharts/highstock');

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartModule.forRoot(Highcharts),
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
