var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510})

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received!: %s', message)
  })

  setInterval(
    () => ws.send(`Here is the date: ${new Date()}`),
    5000
  )
})
