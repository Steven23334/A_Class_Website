/**
 * 活动日历
 * 数据来自 events.json，格式见项目说明。
 * 想加活动：只改 events.json，无需动本文件。
 */
(function () {
  "use strict";

  // ==================== 分类配色（想加新分类改这里） ====================
  const CATEGORY_COLORS = {
    班会: "#165dff",
    考试: "#e8730c",
    活动: "#1a9c4b",
    假期: "#d4380d",
    通知: "#fffb00",
  };
  const DEFAULT_COLOR = "#8a94a6";

  const WEEKDAY_NAMES = ["一", "二", "三", "四", "五", "六", "日"];

  const grid = document.getElementById("calGrid");
  const titleEl = document.getElementById("calTitle");
  const dateLabel = document.getElementById("eventDate");
  const eventList = document.getElementById("eventList");
  const tip = document.getElementById("calTip");

  let events = [];
  let byDate = new Map();
  let selectedKey = "";
  let viewYear = 0;
  let viewMonth = 0;

  const today = new Date();
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  selectedKey = fmtDate(today);

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function fmtDate(d) {
    return (
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
    );
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function colorOf(cat) {
    return CATEGORY_COLORS[cat] || DEFAULT_COLOR;
  }

  // ==================== 加载数据 ====================
  function loadEvents() {
    return fetch("events.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        const list = Array.isArray(data) ? data : data.events || [];
        return list
          .filter(function (e) {
            return e && e.date;
          })
          .map(function (e) {
            return {
              date: String(e.date).slice(0, 10),
              time: e.time || "",
              title: e.title || "未命名活动",
              location: e.location || "",
              category: e.category || "",
              desc: e.desc || "",
            };
          });
      });
  }

  function buildIndex() {
    byDate = new Map();
    events.forEach(function (e) {
      if (!byDate.has(e.date)) byDate.set(e.date, []);
      byDate.get(e.date).push(e);
    });
    byDate.forEach(function (arr) {
      arr.sort(function (a, b) {
        return String(a.time).localeCompare(String(b.time));
      });
    });
  }

  // ==================== 渲染日历 ====================
  function renderCalendar() {
    titleEl.textContent = viewYear + " 年 " + (viewMonth + 1) + " 月";
    grid.innerHTML = "";

    const first = new Date(viewYear, viewMonth, 1);
    // 周一为 0，周日为 6
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);

    for (let i = 0; i < 42; i++) {
      const d = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i,
      );
      const key = fmtDate(d);
      const inMonth = d.getMonth() === viewMonth;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      if (!inMonth) btn.classList.add("other-month");
      if (key === fmtDate(today)) btn.classList.add("today");
      if (key === selectedKey) btn.classList.add("selected");
      btn.setAttribute("aria-label", key);

      const num = document.createElement("span");
      num.textContent = d.getDate();
      btn.appendChild(num);

      const dayEvents = byDate.get(key) || [];
      if (dayEvents.length) {
        const dots = document.createElement("span");
        dots.className = "dots";
        const cats = [];
        dayEvents.forEach(function (e) {
          const c = e.category || "";
          if (cats.indexOf(c) === -1) cats.push(c);
        });
        cats.slice(0, 3).forEach(function (c) {
          const dot = document.createElement("span");
          dot.style.background = colorOf(c);
          dots.appendChild(dot);
        });
        btn.appendChild(dots);
      }

      btn.addEventListener("click", function () {
        selectedKey = key;
        if (!inMonth) {
          viewYear = d.getFullYear();
          viewMonth = d.getMonth();
        }
        renderCalendar();
        renderEvents();
      });

      grid.appendChild(btn);
    }
  }

  // ==================== 渲染当日活动 ====================
  function renderEvents() {
    const list = byDate.get(selectedKey) || [];
    const d = new Date(selectedKey + "T00:00:00");
    const w = WEEKDAY_NAMES[(d.getDay() + 6) % 7];
    dateLabel.textContent = selectedKey + " 周" + w;

    if (!list.length) {
      eventList.innerHTML = '<p class="event-empty">当天没有安排。</p>';
      return;
    }

    eventList.innerHTML = list
      .map(function (e) {
        const meta = [];
        if (e.location) {
          meta.push("<span>📍 " + esc(e.location) + "</span>");
        }
        if (e.category) {
          meta.push(
            '<span style="color:' +
              colorOf(e.category) +
              '">● ' +
              esc(e.category) +
              "</span>",
          );
        }

        return (
          '<div class="event-item">' +
          (e.time ? '<div class="ev-time">' + esc(e.time) + "</div>" : "") +
          '<div class="ev-title">' +
          esc(e.title) +
          "</div>" +
          (meta.length
            ? '<div class="ev-meta">' + meta.join("") + "</div>"
            : "") +
          (e.desc ? '<div class="ev-desc">' + esc(e.desc) + "</div>" : "") +
          "</div>"
        );
      })
      .join("");
  }

  function shiftMonth(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    renderCalendar();
  }

  // ==================== 绑定按钮 ====================
  document.getElementById("calPrev").addEventListener("click", function () {
    shiftMonth(-1);
  });
  document.getElementById("calNext").addEventListener("click", function () {
    shiftMonth(1);
  });
  document.getElementById("calToday").addEventListener("click", function () {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedKey = fmtDate(today);
    renderCalendar();
    renderEvents();
  });

  // ==================== 启动 ====================
  loadEvents()
    .then(function (list) {
      events = list;
      buildIndex();
      renderCalendar();
      renderEvents();
    })
    .catch(function (err) {
      renderCalendar();
      renderEvents();
      if (tip) {
        tip.textContent =
          "读取 events.json 失败：" +
          err.message +
          "。请通过本地服务器打开页面（例如 python -m http.server），并确认 events.json 与 calendar.html 在同一目录。";
        tip.style.color = "#c0392b";
      }
    });
})();
