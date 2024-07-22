// Exemplo Completo com Importação Global
// import $ from 'jquery';
// window.jQuery = $;
// window.$ = $;

// // Seu código aqui...
// $(document).ready(function(){
//     console.log("jQuery is working!");
// });


import ROBrowser from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app-container');
  const message = document.createElement('div');
  message.innerText = 'Hello, roBrowser!';
  message.style.color = 'white';
  appContainer.appendChild(message);

  const browserOptions = {
    target: document.getElementById("robrowser"),
    remoteClient: "http://localhost:3338/",
    type: ROBrowser.TYPE.FRAME,
    development: true,
    servers: [{
      display: "Demo Server",
      desc: "roBrowser's demo server",
      address: "serve",
      addressStatus: true,
      port: 6900,
      version: 30,
      langtype: 9,
      packetver: 20120410,
      packetKeys: true,
      socketProxy: "ws://127.0.0.1:5999/",
      autoLogin: ['administrador2', 'administrador2'],
    }],
    skipServerList: false,
    skipIntro: false,
  };

  const roBrowser = new ROBrowser(browserOptions);
  roBrowser.start();
});