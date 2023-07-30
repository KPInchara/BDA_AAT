import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Signin from './pages/Signin/Signin'
import Signup from "./pages/Signup/Signup"
import Analysis from './pages/Analysis/Analysis';
function App() {
    return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
          <Route path="/signin" element={<Signin/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/analysis" element={<Analysis/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
