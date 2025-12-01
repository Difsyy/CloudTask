const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const countEl = document.getElementById("count");
const refreshBtn = document.getElementById("refreshBtn");

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

function render(items) {
  todoList.innerHTML = "";
  countEl.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

  for (const t of items) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    left.className = "left";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.done ? "DONE" : "TODO";

    const text = document.createElement("span");
    text.className = "text" + (t.done ? " done" : "");
    text.textContent = t.text;

    left.appendChild(badge);
    left.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = t.done ? "Undo" : "Done";
    toggleBtn.onclick = async () => {
      await api(`/api/todos/${t.id}/toggle`, { method: "PATCH" });
      await load();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";
    delBtn.onclick = async () => {
      await api(`/api/todos/${t.id}`, { method: "DELETE" });
      await load();
    };

    actions.appendChild(toggleBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    todoList.appendChild(li);
  }
}

async function load() {
  const items = await api("/api/todos");
  render(items);
}

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  await api("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text })
  });

  todoInput.value = "";
  await load();
});

refreshBtn.addEventListener("click", load);

load().catch((err) => {
  todoList.innerHTML = `<li class="item"><span>❌ ${err.message}</span></li>`;
});
