import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';


@Injectable()
export class ApiService {
  private url = 'http://localhost:3000/';
  private socket;


  constructor(private http: Http) { }

  fetchStock(symbol) {
    const encoded_data = JSON.stringify( {symbol });
    const headers = new Headers ({ 'Content-Type': 'application/json;charset=utf-8' });
    const options = new RequestOptions({ headers: headers});

    return this.http.post('http://localhost:3000/api/stock', encoded_data, options);
  }

  getStocks() {
    const observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('newStock', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  sendStocks(data) {
    this.socket.emit('add-stock', data);
  }

  removeStocks(val, j) {
    this.socket.emit('remove-stock', val, j);
  }

  getInitialStocks() {
    return this.http.get('http://localhost:3000/api/get');
  }

  deleteStock(val) {
    const encoded_data = JSON.stringify({ val });
    const headers = new Headers ({'Content-Type': 'application/json;charset=utf-8'});
    const options = new RequestOptions ({headers: headers });

    return this.http.post('http://localhost:3000/api/remove', encoded_data, options);
  }


}
