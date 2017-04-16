const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const path = require('path');
require('dotenv').config();

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const router = express.Router();

router.post('/stock', (req, res) => {
  const url = `https://www.quandl.com/api/v3/datasets/WIKI/${req.body.symbol.symbol}.json?column_index=1&order=asc&start_date=2016-04-08&collapse=daily&api_key=${process.env.APIKEY}`;

  request(url, (error, response, body) => {
    let stockData = JSON.parse(body);
    if (error) {
      return res.send(error);
    } else if (stockData['quandl_error']) {
      return res.send(stockData);
    }

    // change string date/time to JS timestamp
    stockData.dataset.data.map( val => {
      val[0] = new Date(val[0]).getTime();
    })

    let f = JSON.parse(localStorage.getItem('initialStocks'));
    if (!f){
      f = {
        data: [stockData]
      }
      return res.send(stockData);
    } else {
      let d = f.data.filter(val => {
        return val.dataset['dataset_code'] === stockData.dataset['dataset_code']
      })
      if (d.length == 0) {
        f.data.push(stockData);
        localStorage.setItem('initialStocks', JSON.stringify(f));
        return res.send(stockData);
      } else {
        return res.send("Already added")
      }
    }
  })
})

router.get('/get', (req, res) => {
  console.log('GET ROUTE');
  let f = JSON.parse(localStorage.getItem('initialStocks'));
  if (!f) {
    f = {};
  }
  res.send(f);
})

router.post('/remove', (req, res) => {
  console.log('REMOVE ROUTE');
  let id = req.body.val;
  let f = JSON.parse(localStorage.getItem('initialStocks'));
  if (!f) {
    f = {};
  };
  function remove(val) {
    if(val.dataset['dataset_code'] != id){
      return val
    };
  }
  f.data = f.data.filter(remove);
  localStorage.setItem('initialStocks', JSON.stringify(f));
  res.send("done");
})

module.exports = router;
