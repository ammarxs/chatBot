import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./componants/home.jsx";
import Login from "./componants/login.jsx"
import Signup from "./componants/signup.jsx";
import NotFound from "./componants/notFound.jsx";
import ProtectedRoute from "./componants/ProtectedRoute.jsx";
import VoiceChat from "./componants/voiceChat.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page now protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voicechat"
          element={
            <ProtectedRoute>
              <VoiceChat />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
       
        <Route path="/signup" element={<Signup />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
