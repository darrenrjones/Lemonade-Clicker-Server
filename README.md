# Lemonade Clicker Server

### Back-End Tech:
- Express
- bcrypt
- nodemon
- passport

### Endpoints:

Register:
POST '/api/auth/register' 
```
  {
    "username": "user",
    "password": "password"
  }
```

Login:
POST '/api/auth/login' 
```
  {
    "username": "user",
    "password": "password"
  }
```

Save: 
PUT '/api/users/:id' 

The front end will send user stats from state like this:
```
{
  currentCash: currentState.mainReducer.currentCash,
  careerCash: currentState.mainReducer.careerCash,
  manualClicks: currentState.mainReducer.manualClicks,
  clickValue: currentState.mainReducer.clickValue,
  assets: currentState.mainReducer.assets,
  upgrades: currentState.mainReducer.upgrades,
  seenMessage: currentState.mainReducer.seenMessage
}
```    






