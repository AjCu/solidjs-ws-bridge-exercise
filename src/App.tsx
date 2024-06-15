import type { Component } from "solid-js";
import { createSignal, For, onCleanup } from "solid-js";
import { hc } from "hono/client";
import styles from "./App.module.css";
import { CarsArray } from "./models/types";

const client = hc("http://localhost:3000");
const ws = client.ws.$ws(0);

const [carsArray, setCarsArray] = createSignal<CarsArray>([]);

const generateRandomTime = () => {
  return Math.floor(Math.random() * 5) + 3;
};

const generateRandomSendTime = () => {
  return Math.floor(Math.random() * 5) + 1;
};
const generateUUID = () => {
  return Math.random().toString(36).substring(7);
};

const generateRandomDirection = () => {
  const randomDirection = Math.floor(Math.random() * 2);
  if (randomDirection === 0) {
    return "left";
  } else {
    return "right";
  }
};

const createCar = (direction: string) => {
  const randomTimeOnTheBridge = generateRandomTime();
  const carUUID = generateUUID();
  const parsedData = JSON.stringify({
    id: carUUID,
    direction: direction,
    time: randomTimeOnTheBridge,
  });
  return parsedData;
};

const sendTenCarsToTheBridge = () => {
  for (let i = 0; i < 10; i++) {
    const direction = generateRandomDirection();
    const sendTime = generateRandomSendTime();
    setTimeout(() => {
      sendCarToTheBridge(direction);
    }, sendTime * 1000);
  }
};

const sendCarToTheBridge = (direction: string) => {
  const newCar = createCar(direction);
  ws.send(newCar);
  setCarsArray((prev) => [...prev, JSON.parse(newCar)]);
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.id) {
    setCarsArray((prev) => [...prev, data]);
    setCarsArray((prev) => prev.filter((car) => car.id !== data.id));
  }
  if (data.error) {
    console.error(data.error);
  }
};

onCleanup(() => {
  closeConnection();
});

const closeConnection = () => {
  ws.close();
};

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div class={"flex-container"}>
          <button onClick={() => sendCarToTheBridge("left")}>
            Enviar 1 vehiculo por la izquierda
          </button>
          <button onClick={() => sendCarToTheBridge("right")}>
            Enviar 1 vehiculo por la derecha
          </button>
          <button onClick={() => sendTenCarsToTheBridge()}>
            Enviar varios vehiculos random
          </button>
          <button onClick={() => closeConnection()}> Cerrar conexión</button>
        </div>
        <div class={"card-wrapper"}>
          <For each={carsArray()} fallback={<div>No cars in the bridge</div>}>
            {(car) => (
              <div class={"card"}>
                <h4>id:{car.id}</h4>
                <p>{car.direction}</p>
                <p>segundos {car.time}</p>
              </div>
            )}
          </For>
        </div>
      </header>
    </div>
  );
};

export default App;
