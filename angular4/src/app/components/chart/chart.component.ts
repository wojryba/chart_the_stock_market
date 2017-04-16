import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ApiService } from '../../services/api.service';

declare var require: any;

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
  stocks: any = [];
  connection: any;
  alreadyAdded = false;


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

    // socket observable
    this.connection = this.api.getStocks().subscribe( data => {
      this.addOrRemoveStock(data);
   });
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }


  removeStock(val, j) {
    // send socket massage
    this.api.removeStocks(val, j);

    this.api.deleteStock(val).subscribe(
      response => console.log(response)
    );
  }

  addOrRemoveStock(data) {
    if (data.type === 'new-stock') {
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
    // get initial stocks from backend
    this.api.getInitialStocks().subscribe(
      response => {
        if(response['_body'] == '') {
          const stockData = {
            name: '',
            data: '',
          };
          this.chart.addSeries(stockData);
        } else {
          const f = JSON.parse(response['_body']);
          // map the recived data and insert into chart and view
          f.data.map( val => {
            const stockData = {
              name: val.dataset['dataset_code'],
              data: val.dataset.data,
            };
            this.chart.addSeries(stockData);

            const stock = {
              symbol: val.dataset['dataset_code'],
              name: val.dataset.name
            };
            this.stocks.push(stock);
          });
        }
      }
    );


  }

  onSubmit(value) {
    this.api.fetchStock(value).subscribe(
      response => {
        if (response['_body'] === 'Already added') {
          console.log('Already added');
        } else {
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
        }
      },
      error => {
        if (error['_body'] === 'Already added') {
          this.alreadyAdded = true;
          setTimeout(() => this.alreadyAdded = false, 2000);
        }
      },
      () => console.log('complete')
    );
  }

}
