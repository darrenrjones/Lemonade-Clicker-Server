const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080
});

//this object acts as a HashTable (https://en.wikipedia.org/wiki/Hash_table)
var activeUsers = {}; //this is reset every time the server restarts


//placeholder error handling
function logError(message) {
    console.log('Invalid message %s', message);

}
function updateCache(userToUpdate,message) {
 if (userToUpdate in activeUsers) {
     //check to make sure our object from the client fits the standard we define below
     if ("data" in message) {
        activeUsers[userToUpdate] = message.data; // we might need to do some mapping here
        //and some logic checks
    }
 }
 //return back the cache so we can pass it down to the client
 return activeUsers[userToUpdate];
}
function updateDB() {
    for (var userId in activeUsers) {
        //here we take the activeUsers[userId] object and us it to update mongo
    }
}
/*
All WebSocket messages issued by the client must be JSON and contain the following data:
{
    type: (STRING) connect_user||tick_event,
    userId: (STRING) the Mongo id
    data: {
        //put the vars here you want to store, these should map onto data you already have in your MongoDB collection
    }
}


*/
wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
	  const msgJSON = JSON.parse(message);
	  if (msgJSON.hasOwnProperty('type')) {
	      switch (msgJSON.type) {
            case "connect_user":
	          //TODO: abstract the  if (msgJSON.hasOwnProperty("userId")) { into a common function with a callback
	              if (msgJSON.hasOwnProperty("userId")) {
	                  /* get the user state from the server, 
	                  store it in cache, 
	                  return cache obj to update client state (last part is optional)
	                  */
                    activeUsers[msgJSON.userId] = getUserFromDb(msgJSON.userId);
	                  ws.send(JSON.stringify(activeUsers[msgJSON.userId]));
	              } else {
	                  logError(message);
	              }
	              break;
	          case "tick_event":
	              /* 
	                  update cache from client, emitted by client every second
	              */
               if (msgJSON.hasOwnProperty("userId")) {
	                  //ensure the user is logged in (really currently in cache)
	                  if (msgJSON.userId in activeUsers) {
	                          //Here we can do one of several things
	                          //If we include JSON to tell the server to do so, we can do tasks like validate a purchase or add new points

	                            //REQUIRED: update the cache (activeUsers) and return the updated object
														updateCache(activeUsers[msgJSON.userId],msgJSON);
														
	                  } else {
	                      const errorObj = {
	                          "message": "Error: User is not logged in",
	                          "userId": msgJSON.userId
	                      };
	                        //send back an error in this case
	                      ws.send(JSON.stringify(errorObj));
	                  }
	             }
								break;
									                //this could be fired by the client in the componentWillUnmount method
	          case "logout":
	              if (msgJSON.hasOwnProperty("userId")) {
	                  //remove user from activeUsers hashtable on exit
	                  delete activeUsers[msgJSON.userId];
	              } else {
	                  logError(message);
                }
	          break;
	      }
	  } else {
	     logError(message);
		}
	});

	ws.send('we are live');
});

setInterval(updateDB,1000);