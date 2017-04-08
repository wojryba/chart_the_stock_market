import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy  {
  options: Object;
  chart: any;
  symbol: any;
  hidden = true;
  stocks: Array<object> = [];
  connection: any;

  constructor(private api: ApiService) {
    this.options = {
        title : { text : 'STOCKS' },
        series: []
    };
  }

  ngOnInit() {
    // for form
    this.symbol = {
      symbol: ''
    };

    // get current stocks
    this.getStocks();

    // socket observable
    this.connection = this.api.getStocks().subscribe( data => {
      this.addOrRemoveStock(data);
   })
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }


  removeStock(val, j) {
    // send socket massage
    this.api.removeStocks(val, j);
  }

  addOrRemoveStock(data) {
    if (data.type === "new-stock") {
      // add the stock to chart
      const stockData = {
        name: data.data.dataset['dataset_code'],
        data: data.data.dataset.data,
      };
      this.chart.addSeries(stockData);

      // add the stock to pakge
      const stock = {
        symbol: data.data.dataset['dataset_code'],
        name: data.data.dataset.name
      };
      this.stocks.push(stock);
    }

    if (data.type === 'delete-stock') {
      // remove stock from chart
      let i = this.chart.series;
      i = i.map( v => { return v.name; }).indexOf(data.val);
      this.chart.series[i].remove();

      // remove stock form disply
      this.stocks.splice(data.j, 1);
    }

  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  onSubmit(value) {
    this.api.fetchStock(value).subscribe(
      response => {
        const data = JSON.parse(response['_body']);
        if (data.quandl_error) {
          // show massage about wrong stock symbol
          this.hidden = false;
        } else {
          // hide massage about wrong stock symbol
          this.hidden = true;

          // make socket call to add the stock;
          this.api.sendStocks(data);
        }
      },
      error => console.log(error),
      () => console.log('complete')
    );
  }

  getStocks() {
    this.api.getInitialStocks().subscribe(
      response => console.log(response),
      error => console.log(error),
      () => console.log('complete')
    );
  }

  saveStocks(chart, stocks) {
    this.api.saveStocks(chart, stocks).subscribe(
      response => console.log(response),
      error => console.log(error),
      () => console.log('complete')
    );
  }

}
