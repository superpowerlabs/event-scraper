import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
if (module.hot) {
  module.hot.accept();
}
ReactDOM.render(
  <Fragment>
    <App />
  </Fragment>,
  document.getElementById("root")
);
