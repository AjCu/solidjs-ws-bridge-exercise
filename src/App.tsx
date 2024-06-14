import type { Component } from "solid-js";
import { hc } from "hono/client";
import logo from "./logo.svg";
import styles from "./App.module.css";

const client = hc("http://localhost:3000");
const ws = client.ws.$ws(0);

ws.addEventListener("open", () => {
  setInterval(() => {
    ws.send(new Date().toString());
  }, 1000);
});

const sendCarsToTheBridge = (direction: string) => {
  const randomTimeOnTheBridge = Math.floor(Math.random() * 1000);
  const parsedData = JSON.stringify({ direction, randomTimeOnTheBridge });
  ws.send(parsedData);
};

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <div class={"flex-container"}>
          <button onClick={() => sendCarsToTheBridge("left")}>
            Enviar vehiculos por la izquierda
          </button>
          <button onClick={() => sendCarsToTheBridge("right")}>
            Enviar vehiculos por la derecha
          </button>
        </div>
      </header>
    </div>
  );
};

export default App;
