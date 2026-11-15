(function () {
  "use strict";

  // ==================== 配置 ====================
  const CONFIG = {
    json: "news_branch/news.json",
    // 默认用 ?id=，兼容所有静态服务器。
    // 如果你配置了 /news_branch/<id> 的 rewrite，把下面换成：
    // detailUrl: function (id) { return "news_branch/" + encodeURIComponent(id); },
    detailUrl: function (id) {
      return "news_branch/news_branch.html?id=" + encodeURIComponent(id);
    },
  };

  // 分类 → tag 样式类，与 main_css.css 里 .tag.hot / .tag.notice 对应
  const CATEGORY_CLASS = {
    班级风采: "hot",
    通知公告: "notice",
    学习分享: "",
  };

  const pinnedWrap = document.getElementById("pinnedWrap");
  const listEl = document.getElementById("newsList");
  const emptyEl = document.getElementById("newsEmpty");

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

  function parseDate(dateStr) {
    const p = String(dateStr || "").split("-");
    return { month: p[1] || "", day: p[2] || "" };
  }

  function tagClass(cat) {
    return Object.prototype.hasOwnProperty.call(CATEGORY_CLASS, cat)
      ? CATEGORY_CLASS[cat]
      : "";
  }

  function renderPinned(item) {
    if (!item) {
      pinnedWrap.innerHTML = "";
      return;
    }
    const url = CONFIG.detailUrl(item.id);
    pinnedWrap.innerHTML =
      "<h2>置顶要闻</h2>" +
      '<a class="feature" href="' +
      esc(url) +
      '" target="_blank" rel="noopener noreferrer">' +
      "<h3>" +
      esc(item.title) +
      "</h3>" +
      "<p>" +
      esc(item.excerpt || "") +
      "</p>" +
      '<div class="meta">' +
      "<span>" +
      esc(item.date || "") +
      "</span>" +
      "<span>·</span>" +
      "<span>" +
      esc(item.category || "") +
      "</span>" +
      "</div>" +
      "</a>";
  }

  function renderList(list) {
    if (!list.length) {
      emptyEl.style.display = "block";
      emptyEl.textContent = "暂时没有更多新闻。";
      listEl.innerHTML = "";
      return;
    }
    emptyEl.style.display = "none";

    listEl.innerHTML = list
      .map(function (item) {
        const url = CONFIG.detailUrl(item.id);
        const d = parseDate(item.date);
        const cls = tagClass(item.category);
        return (
          '<a class="news-item" href="' +
          esc(url) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<div class="date-box">' +
          '<span class="day">' +
          esc(d.day) +
          "</span>" +
          '<span class="month">' +
          esc(d.month) +
          "月</span>" +
          "</div>" +
          '<div class="news-body">' +
          "<h3>" +
          esc(item.title) +
          "</h3>" +
          "<p>" +
          esc(item.excerpt || "") +
          "</p>" +
          '<div class="meta">' +
          '<span class="tag ' +
          esc(cls) +
          '">' +
          esc(item.category || "新闻") +
          "</span>" +
          "<span>" +
          esc(item.date || "") +
          "</span>" +
          "</div>" +
          "</div>" +
          "</a>"
        );
      })
      .join("");
  }

  async function main() {
    try {
      const res = await fetch(CONFIG.json, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || [];
      const pinnedId = data.pinned;

      const pinnedItem =
        pinnedId != null
          ? list.find(function (it) {
              return String(it.id) === String(pinnedId);
            })
          : null;
      const rest = list.filter(function (it) {
        return pinnedId == null || String(it.id) !== String(pinnedId);
      });

      renderPinned(pinnedItem);
      renderList(rest);
    } catch (err) {
      pinnedWrap.innerHTML = "";
      listEl.innerHTML = "";
      emptyEl.style.display = "block";
      emptyEl.textContent =
        "读取新闻清单失败：" +
        err.message +
        "。请通过本地服务器访问，或确认 news_branch/news.json 存在。";
    }
  }

  main();
})();
