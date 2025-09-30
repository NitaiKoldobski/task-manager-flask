import React, { useEffect, useState } from "react";

function Dashboard({ loggedInUser, setLoggedInUser }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all"); // ✅ פילטר ברירת מחדל

  // מביא משימות
  useEffect(() => {
    if (loggedInUser) {
      fetch(`http://127.0.0.1:5001/tasks?username=${loggedInUser}`)
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [loggedInUser]);

  // הוספת משימה
  const addTask = () => {
    if (!title) return;
    fetch(`http://127.0.0.1:5001/tasks?username=${loggedInUser}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: "",
        due_date: dueDate ? new Date(dueDate).toISOString().split("T")[0] : null,
      }),
    })
      .then((res) => res.json())
      .then((newTask) => setTasks([...tasks, newTask]));
    setTitle("");
    setDueDate("");
  };

  // Toggle משימה
  const toggleTask = (id) => {
    fetch(
      `http://127.0.0.1:5001/tasks/${id}/toggle?username=${loggedInUser}`,
      { method: "PATCH" }
    )
      .then((res) => res.json())
      .then((updated) => {
        setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      });
  };

  // מחיקת משימה
  const deleteTask = (id) => {
    fetch(`http://127.0.0.1:5001/tasks/${id}?username=${loggedInUser}`, {
      method: "DELETE",
    }).then(() => setTasks(tasks.filter((t) => t.id !== id)));
  };

  // אחוז התקדמות
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  // סינון משימות
  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-10">
      {/* כותרת + יציאה */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          📋 Task Manager ({loggedInUser})
        </h1>
        <button
          onClick={() => setLoggedInUser(null)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <p className="mb-2">Progress: {progress}%</p>
        <div className="w-full h-3 bg-gray-700 rounded-full">
          <div
            className="h-3 bg-green-500 rounded-full transition-all fade-in-up"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tabs סינון */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "active"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "completed"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Completed
        </button>
      </div>

      {/* הוספת משימה */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6 flex gap-4">
        <input
          type="text"
          value={title}
          placeholder="New task title"
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Add
        </button>
      </div>

      {/* רשימת משימות */}
      <ul className="space-y-4">
        {filteredTasks.map((t) => (
          <li
            key={t.id}
            className="bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center transition hover:bg-gray-700 fade-in-up"
            >
            <div>
              <h2
                className={`font-semibold ${
                  t.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {t.title}
              </h2>
              {t.due_date && (
                <p className="text-sm text-gray-400">Due: {t.due_date}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleTask(t.id)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {t.completed ? "Undo" : "Done"}
              </button>
              <button
                onClick={() => deleteTask(t.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
