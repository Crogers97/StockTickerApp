import { useEffect, useState } from 'react'
import protobuf from 'protobufjs'
const { Buffer } = require('buffer/')

const emojis = {
  '': '',
  'up': '🔺',
  'down': '🔻',
}


function formatPrice(price) {
  return `£${price.toFixed(2)}`;
}

function App() {
  
  const [stock, setStock] = useState(null);
  const [direction, setDirection] = useState('');

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
        setStock((current) => {
          if (current) {
            const nextDirection = current.price < next.price ? 'up' : current.price > next.price ? 'down' : '';
            if (nextDirection) {
              setDirection(nextDirection);
            }
          }
          return next;
        });
      };
    });
  }, []);






  return (
    <div className='stock' >
      {stock && <h2>{stock.id}{formatPrice(stock.price)} {emojis[direction]}</h2>}

    </div>
  );
}

export default App;
