import jQuery from "jquery";
import glMatrix from "gl-matrix";
import ROBrowser from "./api.js";

window.jQuery = jQuery;
window.$ = jQuery;
window.glMatrix = glMatrix;

document.addEventListener("DOMContentLoaded", () => {
  const browserOptions = {
    target: document.getElementById("robrowser"),
    remoteClient: "http://localhost:3338/",
    type: ROBrowser.TYPE.FRAME,
    development: true,
    servers: [
      {
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
        autoLogin: ["administrador2", "administrador2"],
      },
    ],
    skipServerList: false,
    skipIntro: false,
  };

  const roBrowser = new ROBrowser(browserOptions);
  roBrowser.start();

  // Teste se o jQuery está funcionando
  jQuery(document).ready(function () {
    console.log("jQuery is working!");
  });
});
