// RootRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    // immediately replace "/" with "/home" without mounting HomePage under "/"
    navigate("/home", { replace: true });
  }, [navigate]);
  return null; // renders nothing
}
