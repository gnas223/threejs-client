import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Model from "./components/World";
import Funko from "./components/Funko";
import { v4 as uuidV4 } from "uuid";
import { io } from "socket.io-client";
const socket = io("http://localhost:8080");
function App() {
  const idUser = useRef(uuidV4());
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([Math.PI / 2, 0, 9.5]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit("addUser", { idUser: idUser.current, position: [0, 0, 0] });
  }, []);
  useEffect(() => {
    socket.emit("userMove", { idUser: idUser.current, position });
    socket.on("users", (data) => {
      setUsers(data);
    });
  }, [position]);
  const handleKeyDown = (e) => {
    switch (e.code) {
      case "KeyW":
        setPosition([position[0], position[1], position[2] - 0.1]);
        break;
      case "KeyS":
        setPosition([position[0], position[1], position[2] + 0.1]);
        break;
      case "KeyD":
        setRotation([rotation[0], rotation[1], rotation[2] - 0.05]);
        break;
      case "KeyA":
        setRotation([rotation[0], rotation[1], rotation[2] + 0.05]);
        break;
      default:
        break;
    }
  };
  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onKeyDown={(e) => handleKeyDown(e)}
      tabIndex="0"
    >
      <Canvas>
        <Suspense>
          <PerspectiveCamera makeDefault position={[1, 2, 5]} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Model position={[0, 0, 0]} />
          {users.map((user) => (
            <Funko position={user.position} key={user.idUser} />
          ))}
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
