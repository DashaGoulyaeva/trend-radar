const DEFAULT_API = "http://127.0.0.1:8000";

function getApiBase() {
  return localStorage.getItem("tr_api") || DEFAULT_API;
}

function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav a").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}

async function fetchTrends(windowValue) {
  const apiBase = getApiBase();
  const url = `${apiBase}/api/trends?window=${encodeURIComponent(windowValue)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

function normalizeItem(item) {
  return {
    id: item.id,
    title: item.title || "Без названия",
    score: Number.isFinite(item.score) ? item.score : item.predictive_score,
    verdict: item.verdict || "unknown",
    why: item.why_live || item.whyLive || "",
    scene: item.scene || "",
    risk: item.risk || "",
    angles: Array.isArray(item.angles) ? item.angles : [],
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
  };
}

function renderTrendList(target, items) {
  target.innerHTML = "";
  items.forEach((raw) => {
    const item = normalizeItem(raw);
    const card = document.createElement("article");
    card.className = "trend";

    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const why = document.createElement("p");
    why.textContent = item.why || "Ожидаем интерпретацию от Ollama.";

    const badges = document.createElement("div");
    badges.className = "badges";

    const verdict = document.createElement("span");
    verdict.className = "badge";
    verdict.textContent = item.verdict;

    const scene = document.createElement("span");
    scene.className = "badge";
    scene.textContent = item.scene || "Сцена не указана";

    badges.appendChild(verdict);
    badges.appendChild(scene);

    left.appendChild(title);
    left.appendChild(why);
    left.appendChild(badges);

    if (item.angles.length) {
      const angles = document.createElement("div");
      angles.className = "badges";
      item.angles.slice(0, 4).forEach((angle) => {
        const chip = document.createElement("span");
        chip.className = "badge";
        chip.textContent = angle;
        angles.appendChild(chip);
      });
      left.appendChild(angles);
    }

    const right = document.createElement("div");
    right.className = "score";
    right.textContent = Number.isFinite(item.score) ? item.score : "—";

    card.appendChild(left);
    card.appendChild(right);
    target.appendChild(card);
  });
}

async function loadTrendsPage(windowValue) {
  const list = document.getElementById("trendList");
  const stateLoading = document.getElementById("stateLoading");
  const stateEmpty = document.getElementById("stateEmpty");
  const stateError = document.getElementById("stateError");
  const errorText = document.getElementById("errorText");

  const setState = (state) => {
    stateLoading.classList.toggle("active", state === "loading");
    stateEmpty.classList.toggle("active", state === "empty");
    stateError.classList.toggle("active", state === "error");
  };

  setState("loading");
  list.innerHTML = "";
  try {
    const items = await fetchTrends(windowValue);
    if (!items.length) {
      setState("empty");
      return;
    }
    setState("ready");
    renderTrendList(list, items);
  } catch (error) {
    setState("error");
    errorText.textContent = `Ошибка: ${error.message}. Проверь backend.`;
  }
}

async function loadTrendDetail() {
  const detail = document.getElementById("trendDetail");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    detail.innerHTML = "<p class=\"subtle\">Передай параметр id в URL.</p>";
    return;
  }

  try {
    const items = await fetchTrends("today");
    const match = items.find((item) => item.id === id) || items[0];
    if (!match) {
      detail.innerHTML = "<p class=\"subtle\">Тренд не найден.</p>";
      return;
    }
    const item = normalizeItem(match);
    detail.innerHTML = `
      <div class="panel">
        <h2>${item.title}</h2>
        <p class="subtle">${item.why || "Без интерпретации."}</p>
        <div class="badges">
          <span class="badge">${item.verdict}</span>
          <span class="badge">${item.scene || "Сцена не указана"}</span>
          <span class="badge">Риск: ${item.risk || "—"}</span>
        </div>
      </div>
    `;
  } catch (error) {
    detail.innerHTML = `<p class="subtle">Ошибка загрузки: ${error.message}</p>`;
  }
}

async function loadSourcesPage() {
  const tableBody = document.getElementById("sourcesBody");
  const state = document.getElementById("sourcesState");
  try {
    const items = await fetchTrends("today");
    const counts = {};
    items.forEach((item) => {
      const evidence = Array.isArray(item.evidence) ? item.evidence : [];
      evidence.forEach((ev) => {
        const key = ev.source_key || "unknown";
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!rows.length) {
      state.textContent = "Пока нет данных по источникам.";
      return;
    }
    state.textContent = "";
    tableBody.innerHTML = rows
      .map(([key, count]) => `<tr><td>${key}</td><td>${count}</td><td>ok</td></tr>`)
      .join("");
  } catch (error) {
    state.textContent = `Ошибка загрузки: ${error.message}`;
  }
}

function setupSettings() {
  const input = document.getElementById("apiInput");
  const status = document.getElementById("apiStatus");
  input.value = getApiBase();
  document.getElementById("saveApi").addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      status.textContent = "API не может быть пустым.";
      return;
    }
    localStorage.setItem("tr_api", value);
    status.textContent = "Сохранено. Обнови страницы.";
  });
}

function setupAdminPage() {
  const list = document.getElementById("adminList");
  const state = document.getElementById("adminState");
  const apiBase = getApiBase();

  fetchTrends("today")
    .then((items) => {
      if (!items.length) {
        state.textContent = "Нет данных для модерации.";
        return;
      }
      state.textContent = "";
      list.innerHTML = "";
      items.forEach((raw) => {
        const item = normalizeItem(raw);
        const block = document.createElement("div");
        block.className = "panel";
        block.innerHTML = `
          <h3>${item.title}</h3>
          <div class="grid two" style="margin-top: 12px;">
            <label>Вердикт<br /><input class="input" value="${item.verdict}" data-field="verdict" /></label>
            <label>Скоринг<br /><input class="input" value="${item.score || ""}" data-field="score" /></label>
          </div>
          <label style="display:block;margin-top:12px;">Заметка<br /><input class="input" value="" data-field="admin_note" /></label>
          <div style="margin-top:16px;">
            <button class="button" data-action="save">Сохранить</button>
          </div>
        `;
        block.querySelector("[data-action='save']").addEventListener("click", async () => {
          const verdict = block.querySelector("[data-field='verdict']").value;
          const score = Number(block.querySelector("[data-field='score']").value);
          const adminNote = block.querySelector("[data-field='admin_note']").value;
          try {
            await fetch(`${apiBase}/api/trends/${item.id}/admin`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ verdict, score, admin_note: adminNote }),
            });
            block.querySelector("[data-action='save']").textContent = "Сохранено";
          } catch {
            block.querySelector("[data-action='save']").textContent = "Ошибка";
          }
        });
        list.appendChild(block);
      });
    })
    .catch((error) => {
      state.textContent = `Ошибка: ${error.message}`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();

  const page = document.body.dataset.page;
  if (page === "today") {
    loadTrendsPage("today");
  }
  if (page === "week") {
    loadTrendsPage("week");
  }
  if (page === "trend") {
    loadTrendDetail();
  }
  if (page === "sources") {
    loadSourcesPage();
  }
  if (page === "settings") {
    setupSettings();
  }
  if (page === "admin") {
    setupAdminPage();
  }
});

