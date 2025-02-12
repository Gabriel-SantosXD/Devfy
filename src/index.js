import React from "react";
import ReactDOM from "react-dom/client";
import "./reset.css";
import "./App.css";
import "./Mobile.css";
import "./font.css";
import "./Mediacontrol.css";
import Home from "./Home"; 
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Home /> 
  </React.StrictMode>
);
serviceWorkerRegistration.register();