import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./screens/Landing";
import PlayerLobby from "./screens/PlayerLobby";
import MainDisplay from "./screens/MainDisplay";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainDisplay />}>
            <Route index element={<Landing socket={socket} />} />
            <Route
              path="/lobby/:gameCode"
              element={<PlayerLobby socket={socket} />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
