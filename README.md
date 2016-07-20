

# Lyft OAuth Demo App

The simple chat app to test the passport-lyft OAuth 2 module for Node.js I wrote.

![screenshot](public/images/screenshot.png)

Login with your Lyft credential and just chat. When you use `/lyft`command, it returns you Lyft info- e.g. `/lyft drivers` to get a static map with nearby Lyft drivers (but not Line or Plus, because I simply didn't implement for now), or `/lyft eta` for the estimated time it will take for the nearest driver to reach the user.



## Running this App on Local Your Server

Clone the repo, then install all dependencies:

```bash
$ cd chat-lyft
$ npm install
```
Now you should get all dependencies in **node_modules**.

Then, creating a **config.js** with your Lyft API keys, and locate it in the **/server** :

```javascript
module.exports = {
  auth: {
    lyft: {
      client_id: '4KV2E2...',
      client_secret: 'hnfALYzEq...',
    },
  }
};
```

Finally, run the app:

```bash
$ node server/index.js
```

On your browser, go to http://localhost:3000/

