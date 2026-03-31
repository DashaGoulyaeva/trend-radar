const DEFAULT_API = "http://127.0.0.1:8000";
const INSTALL_CMD = "python -m pip install -r backend/requirements.txt";

function getApiBase() {
  return localStorage.getItem("rt_api") || DEFAULT_API;
}

function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav a").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
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

function normalizeItem(item, fallbackWindow) {
  const evidence = Array.isArray(item.evidence) ? item.evidence : [];
  const first = evidence[0] || {};
  return {
    id: item.id,
    title: item.title || "Без названия",
    score: Number.isFinite(item.score) ? item.score : item.predictive_score,
    verdict: item.verdict || "unknown",
    why: item.why_live || item.whyLive || "",
    scene: item.scene || "",
    risk: item.risk || "—",
    angles: Array.isArray(item.angles) ? item.angles : [],
    window: item.window || fallbackWindow || "today",
    confidence: item.confidence ?? item.confidence_score ?? "—",
    capturedAt: item.captured_at || first.captured_at || "—",
    updatedAt: item.updated_at || "—",
    locale: item.locale || "—",
    source: first.source_key || "—",
    url: first.url || "",
  };
}

function renderTrendList(target, items, fallbackWindow) {
  target.innerHTML = "";
  items.forEach((raw) => {
    const item = normalizeItem(raw, fallbackWindow);
    const card = document.createElement("article");
    card.className = "trend";
    card.addEventListener("click", () => {
      window.location.href = `trend.html?id=${encodeURIComponent(item.id)}`;
    });

    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    const source = document.createElement("span");
    source.textContent = `Источник: ${item.source}`;
    meta.appendChild(source);

    const link = document.createElement("span");
    if (item.url) {
      link.innerHTML = `Ссылка: <a href="${item.url}" target="_blank">${item.url}</a>`;
    } else {
      link.textContent = "Ссылка: —";
    }
    meta.appendChild(link);

    const captured = document.createElement("span");
    captured.textContent = `captured_at: ${item.capturedAt}`;
    meta.appendChild(captured);

    const updated = document.createElement("span");
    updated.textContent = `updated_at: ${item.updatedAt}`;
    meta.appendChild(updated);

    const locale = document.createElement("span");
    locale.textContent = `locale: ${item.locale}`;
    meta.appendChild(locale);

    const why = document.createElement("p");
    why.textContent = item.why || "Ожидаем интерпретацию от Ollama.";

    const badges = document.createElement("div");
    badges.className = "badges";

    const verdict = document.createElement("span");
    verdict.className = "badge";
    verdict.textContent = item.verdict;

    const risk = document.createElement("span");
    risk.className = "badge";
    risk.textContent = `risk: ${item.risk}`;

    const confidence = document.createElement("span");
    confidence.className = "badge";
    confidence.textContent = `confidence: ${item.confidence}`;

    const windowBadge = document.createElement("span");
    windowBadge.className = "badge";
    windowBadge.textContent = `window: ${item.window}`;

    badges.appendChild(verdict);
    badges.appendChild(risk);
    badges.appendChild(confidence);
    badges.appendChild(windowBadge);

    if (item.window === "week") {
      const forecast = document.createElement("span");
      forecast.className = "badge forecast";
      forecast.textContent = "прогноз";
      badges.appendChild(forecast);
    }

    left.appendChild(title);
    left.appendChild(meta);
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
  const installBtn = document.getElementById("installBtn");

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
    renderTrendList(list, items, windowValue);
  } catch (error) {
    setState("error");
    errorText.textContent = `Ошибка: ${error.message}. Проверь backend.`;
    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        const ok = await copyToClipboard(INSTALL_CMD);
        installBtn.textContent = ok ? "Команда скопирована" : "Скопируй вручную";
      });
    }
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
    const item = normalizeItem(match, "today");
    detail.innerHTML = `
      <div class="panel">
        <h2>${item.title}</h2>
        <p class="subtle">${item.why || "Без интерпретации."}</p>
        <div class="meta">
          <span>Источник: ${item.source}</span>
          <span>captured_at: ${item.capturedAt}</span>
          <span>updated_at: ${item.updatedAt}</span>
          <span>locale: ${item.locale}</span>
        </div>
        <div class="badges">
          <span class="badge">${item.verdict}</span>
          <span class="badge">risk: ${item.risk}</span>
          <span class="badge">confidence: ${item.confidence}</span>
          <span class="badge">window: ${item.window}</span>
          ${item.window === "week" ? '<span class="badge forecast">прогноз</span>' : ""}
        </div>
        <div class="subtle" style="margin-top: 12px;">Ссылка: ${item.url ? `<a href="${item.url}" target="_blank">${item.url}</a>` : "—"}</div>
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
  const checkBtn = document.getElementById("checkApi");
  input.value = getApiBase();

  document.getElementById("saveApi").addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      status.textContent = "API не может быть пустым.";
      status.className = "status error";
      return;
    }
    localStorage.setItem("rt_api", value);
    status.textContent = "Сохранено. Обнови страницы.";
    status.className = "status ok";
  });

  checkBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/trends`);
      if (!response.ok) {
        throw new Error("bad response");
      }
      status.textContent = "API доступен";
      status.className = "status ok";
    } catch {
      status.textContent = "API недоступен";
      status.className = "status error";
    }
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
        const item = normalizeItem(raw, "today");
        const block = document.createElement("div");
        block.className = "panel";
        block.innerHTML = `
          <h3>${item.title}</h3>
          <div class="grid two" style="margin-top: 12px;">
            <label>Вердикт<br /><input class="input" value="${item.verdict}" data-field="verdict" /></label>
            <label>Скоринг<br /><input class="input" value="${item.score || ""}" data-field="score" /></label>
          </div>
          <label style="display:block;margin-top:12px;">Заметка<br /><input class="input" value="" data-field="admin_note" /></label>
          <div class="status" data-status>Статус: ожидает</div>
          <div style="margin-top:16px;">
            <button class="button" data-action="save">Сохранить</button>
          </div>
        `;
        const statusEl = block.querySelector("[data-status]");
        block.querySelector("[data-action='save']").addEventListener("click", async () => {
          const verdict = block.querySelector("[data-field='verdict']").value;
          const score = Number(block.querySelector("[data-field='score']").value);
          const adminNote = block.querySelector("[data-field='admin_note']").value;
          statusEl.textContent = "Статус: сохранение…";
          statusEl.className = "status";
          try {
            await fetch(`${apiBase}/api/trends/${item.id}/admin`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ verdict, score, admin_note: adminNote }),
            });
            statusEl.textContent = "Статус: сохранено";
            statusEl.className = "status ok";
          } catch {
            statusEl.textContent = "Статус: ошибка";
            statusEl.className = "status error";
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
