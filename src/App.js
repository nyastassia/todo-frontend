import React, { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/tasks.json")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("タスクのロードに失敗しました:", err));
  }, []);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    fetch("http://localhost:3000/tasks.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: { title: newTaskTitle, done: false } }),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
      })
      .catch((err) => console.error("タスクの追加に失敗しました:", err));
  };
  const handleDeleteTask = (id) => {
    fetch(`http://localhost:3000/tasks/${id}.json`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setTasks(tasks.filter((task) => task.id !== id));
        } else {
          console.error("削除に失敗しました");
        }
      })
      .catch((err) => console.error("削除エラー:", err));
  };
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TO DOリスト</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="新しいタスクを入力"
        />
        <button onClick={handleAddTask}>追加</button>
      </div>

      <ul>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id}>
              ✅ {task.title}
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{ marginLeft: "1rem", color: "red" }}
              >
                削除
              </button>
            </li>
          ))
        ) : (
          <li>タスクがありません</li>
        )}
      </ul>
    </div>
  );
}

export default App;