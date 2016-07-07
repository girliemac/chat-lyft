

# Lyft OAuth Demo App

The simple chat app to test the passport-lyft OAuth 2 module for Node.js I wrote.

![screenshot](public/images/screenshot.png)

Login with your Lyft credential and just chat. When you use `/lyft`command, it returns you a static map with nearby Lyft (not Line or Plus, because I simply didn't implement for now) drivers.



## Running this App on Local Your Server

Clone the repo, then install all dependencies:

```bash
$ cd chat-lyft
$ npm install
```
Now you should get all dependencies in **node_modules**.

But one of the module (*passport-lyft* for Lyft OAuth)is not yet available in npm, so [grab the lib from my repo](https://github.com/girliemac/passport-lyft), put the **lib** folder in your **node_modules** and rename it to *passport-lyft*.

Then just run node:

```bash
$ node server/index.js
```

On your browser, go to http://localhost:3000/

