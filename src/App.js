import React, { useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/tasks.json`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("タスクのロードに失敗しました:", err));
  }, []);

  const handleUpdateTask = (id, payload) => {
    return fetch(`${BASE_URL}/tasks/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: payload }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        return res.json();
      })
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        return updated;
      });
  };
  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    fetch(`${BASE_URL}/tasks.json`, {
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
    fetch(`${BASE_URL}/tasks/${id}.json`, {
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
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = (task) => {
    const title = editingTitle.trim();
    if (!title) return;
    handleUpdateTask(task.id, { title })
      .then(() => cancelEdit())
      .catch((err) => console.error("更新に失敗しました:", err));
  };

  const toggleDone = (task) => {
    handleUpdateTask(task.id, { done: !task.done }).catch((err) =>
      console.error("更新に失敗しました:", err)
    );
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

      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const isEditing = editingId === task.id;

            return (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                {/* Done checkbox */}
                <input
                  type="checkbox"
                  checked={!!task.done}
                  onChange={() => toggleDone(task)}
                  title="完了にする / 取り消す"
                />

                {/* View or edit mode */}
                {isEditing ? (
                  <>
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveEdit(task);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      placeholder="タイトルを入力"
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(task)}>保存</button>
                    <button onClick={cancelEdit}>キャンセル</button>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        flex: 1,
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    >
                      ✅ {index + 1}. {task.title}
                    </span>
                    <button onClick={() => startEdit(task)}>編集</button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ color: "red" }}
                    >
                      削除
                    </button>
                  </>
                )}
              </li>
            );
          })
        ) : (
          <li>タスクがありません</li>
        )}
      </ul>
    </div>
  );
}

export default App;