import ws from 'k6/ws';

export function encodeEvent(event, ...args) {
  return `42${JSON.stringify([event, ...args])}`;
}

export function createSocket(wsUrl, jwt, handlers, jar) {
  const url = `${wsUrl}/socket.io/?EIO=4&transport=websocket`;
  const params = {};
  if (jwt) {
    params.headers = { 'Cookie': `jwt=${jwt}` };
  } else if (jar) {
    params.jar = jar;
  }

  ws.connect(url, params, function (socket) {
    var connected = false;
    var connTimeout = setTimeout(function () {
      if (!connected) {
        socket.close();
      }
    }, 15000);

    function fire(event, ...args) {
      if (handlers[event]) {
        handlers[event](socket, ...args);
      }
    }

    socket.on('open', function () {});

    socket.on('message', function (data) {
      if (typeof data !== 'string') return;
      const engineType = parseInt(data[0], 10);
      const payload = data.slice(1);

      switch (engineType) {
        case 0:
          socket.send('40');
          break;
        case 2:
          socket.send('3');
          break;
        case 4: {
          const sioType = parseInt(payload[0], 10);
          const sioData = payload.slice(1);

          switch (sioType) {
            case 0:
              connected = true;
              clearTimeout(connTimeout);
              fire('onConnect');
              break;
            case 2:
              try {
                const [eventName, ...evArgs] = JSON.parse(sioData);
                fire(eventName, ...evArgs);
                fire('onEvent', eventName, evArgs);
              } catch (e) {
                fire('onError', 'parse_error', e);
              }
              break;
            case 4:
              fire('onError', 'connect_error', sioData);
              break;
          }
          break;
        }
      }
    });

    socket.on('close', function () {
      clearTimeout(connTimeout);
      fire('onDisconnect');
    });

    socket.on('error', function (err) {
      fire('onError', 'socket_error', err.message || String(err));
    });
  });
}
