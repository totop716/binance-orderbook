import React, { useState } from 'react';
import { TextField, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import './App.css';

function App() {
  const [ orderPair, setOrderPair ] = useState('');
  const [ price, setPrice ] = useState(0);
  const [ buyOrders, setBuyOrders ] = useState([]);
  const [ sellOrders, setSellOrders ] = useState([]);
  const submitOrderPair = () => {
    if (orderPair !== '') {
      setBuyOrders([]);
      setSellOrders([]);
      const pair = orderPair.replace('/', '');
      const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@depth`);
      socket.addEventListener('message', (event: any) => {
        console.log('ccc', event.data);
        const orderData = JSON.parse(event.data);
        fetch(`https://api.binance.com/api/v3/avgPrice?symbol=${pair.toUpperCase()}`)
          .then(res => res.json())
          .then(data => {
            setPrice(data.price);
            const buyOrdersArr = buyOrders.concat(orderData['a']).slice(0, 20);
            const sellOrdersArr = sellOrders.concat(orderData['b']).slice(0, 20);
            setBuyOrders(buyOrdersArr);
            setSellOrders(sellOrdersArr);
          });
      });
      socket.addEventListener('close', (event: any) => {
        console.log('bbb', event);
      })
    }
  }
  return (
    <div className="App">
      <div className="wrapper">
        <div className="pairInputWrapper">
          <TextField value={orderPair} onChange={(event) => {
            setOrderPair(event.target.value);
          }} />
          <Button variant='contained' onClick={submitOrderPair}>Submit</Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              sellOrders.map((order) => (
                <TableRow>
                  <TableCell>{ order[0] }</TableCell>
                  <TableCell>{ order[1] }</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <h1>{ price.toLocaleString() }</h1>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              buyOrders.map((order) => (
                <TableRow>
                  <TableCell>{ order[0] }</TableCell>
                  <TableCell>{ order[1] }</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default App;
