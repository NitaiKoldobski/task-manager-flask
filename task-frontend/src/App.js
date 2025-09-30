import React, { useState } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // התחברות
  const handleLogin = () => {
    fetch("http://127.0.0.1:5001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then(() => {
        setLoggedInUser(username);
        setPassword("");
      })
      .catch(() => alert("שם משתמש או סיסמה לא נכונים"));
  };

  // הרשמה
  const handleRegister = () => {
    fetch("http://127.0.0.1:5001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Register failed");
        return res.json();
      })
      .then(() => alert("נרשמת בהצלחה! עכשיו אפשר להתחבר"))
      .catch(() => alert("שגיאה משתמש קיים"));
  };

  // אם מחובר → מציג Dashboard
  if (loggedInUser) {
    return (
      <Dashboard
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
      />
    );
  }

  // אם לא מחובר → מסך התחברות
  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('/aurora.jpg')" }}
    >
      {/* Welcome back בלוני */}
      <h1 className="absolute top-10 left-10 text-6xl font-baloo text-white drop-shadow-lg fade-in">
        Welcome back
      </h1>

      {/* קופסת התחברות */}
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-96 fade-in">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          🔐 Task Manager
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-white/50 bg-white/30 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-white/50 bg-white/30 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleLogin}
          className="w-full p-3 mb-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="w-full p-3 bg-gray-200/70 text-gray-900 rounded-lg hover:bg-gray-300 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default App;