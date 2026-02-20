import Login from "./Login";
import Home from "./Home";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  
  // Show home if on /home route, otherwise show login
  if (location.pathname === "/home") {
    return <Home />;
  }
  
  return <Login />;
};

export default Index;
