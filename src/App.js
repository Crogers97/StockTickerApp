import { useEffect, useState } from 'react'
import protobuf from 'protobufjs'
const { Buffer } = require('buffer/')


function formatPrice(price){
  return `£${price.toFixed(2)}`;
}

function App() {

  const[stock, setStock] = useState(null)

  useEffect(() => {
    // connects to yahoo api
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    const root = protobuf.load('./YPricingData.proto', (error, root) => {
      if (error) {
        return console.log(error);
      }


      const Yaticker = root.lookupType("yaticker");

      ws.onopen = function open() {
        console.log('connected');
        ws.send(JSON.stringify({
          subscribe: ['GME']
        }));
      };

      ws.onclose = function close() {
        console.log('disconnected');
      };

      ws.onmessage = function incoming(message) {
        // message.data
        const next = Yaticker.decode(new Buffer(message.data, 'base64'));
        setStock(next)
      };
    });


  }, []);

  return (
    <div >
      <h1>Stocks</h1>
      {stock && <h2>{formatPrice(stock.price)}</h2>}
      
    </div>
  );
}

export default App;
