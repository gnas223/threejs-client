import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Model from "./components/World";
import Funko from "./components/Funko";
import { v4 as uuidV4 } from "uuid";
import { io } from "socket.io-client";
import "./messenger.css"
const socket = io("http://localhost:8080");
function App() {
  const idUser = useRef(uuidV4());
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([Math.PI / 2, 0, 9.5]);
  const [users, setUsers] = useState([]);
  const [roomId,setRoomId] = useState("0")
  const [messages,setMessages] = useState([])
  const [newMessage,setNewMessage] = useState("")

  useEffect(() => {
    socket.on("getMessage" , data => {
      console.log("message ",messages)
      setMessages([...messages,data.text])
  })
  }, [messages]);
  useEffect(() => {
    if (roomId !== "0") {
    socket.emit("userMove", { idUser: idUser.current, position },roomId);
    socket.on("users", (data) => {
      if (data !== undefined) {
       setUsers(data);
      }
    });
  }
  }, [position]);

  const handleSubmit = async(e)=>{
    e.preventDefault()

    socket.emit("sendMessage",{
        idUser: idUser.current,
        text: newMessage,
        room : roomId
    })
   // setMessages([...messages,newMessage])

}

  const handleKeyDown = (e) => {
    switch (e.code) {
      case "KeyW":
        setPosition([position[0], position[1], position[2] - 0.1]);
        break;
      case "KeyS":
        setPosition([position[0], position[1], position[2] + 0.1]);
        break;
      case "KeyD":
        setRotation([rotation[0]+0.5, rotation[1], rotation[2]]);
        break;
      case "KeyA":
        setRotation([rotation[0]-0.5, rotation[1], rotation[2]]);
        break;
      default:
        break;
    }
  };

  const handleRoomId = (rId) => {

    console.log("rId ", rId)
    socket.emit("addUser", { idUser: idUser.current, position: [0, 0, 0] },rId);
    socket.on("users", (data) => {
      setUsers(data);
    });
    setRoomId(rId)
  }

  const viewButton = ()=>{
    return (
      <>
         <button onClick={()=>{handleRoomId("1")}}>room 1</button>
          <button onClick={()=>{handleRoomId("2")}}>room 2</button>
          
      </>
    )
  }

  const viewRoom = () =>{
    return (
      <>
      <div className="chatBox">
                <div className="chatBoxWrapper">
                    <div className="chatBoxTop" >   
                        {messages.map( (m,index) => { return (           
                            <p key={index}>{m}</p>
                        )})}
                    </div>
                    <div className="chatBoxBottom">
                        <textarea className="chatMessageInput" placeholder= "writing something ..."
                            onChange={(e)=>{
                                setNewMessage(e.target.value)
                            }}
                            value={newMessage}
                        ></textarea>
                        <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
                    </div>
                </div>
            </div>
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
    </>
    )
  }
  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onKeyDown={(e) => handleKeyDown(e)}
      tabIndex="0"
    >
    { roomId == "0" && viewButton() }
        {roomId === "1" && viewRoom()}
        {roomId === "2" && viewRoom()}
      
    </div>
  );
}

export default App;
