(function () {
  "use strict";

  // ==================== 配置 ====================
  const CONFIG = {
    json: "news.json",
    mdBase: "", // md 路径前缀，留空表示相对本页
    titleSuffix: " - 萧山尚德801班",
    missingTip: "没有找到对应的新闻，可能是序号不对或该新闻已删除。",
  };

  const contentEl = document.getElementById("newsContent");

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

  // 同时支持 ?id=1、#1、/news_branch/1（需服务器 rewrite）
  function getIdFromUrl() {
    const params = new URLSearchParams(location.search);
    if (params.has("id")) {
      const v = params.get("id");
      if (v) return v;
    }
    if (location.hash) {
      const h = location.hash.replace(/^#/, "");
      if (h) return h;
    }
    const parts = location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (/^\d+$/.test(last)) return last;
    return null;
  }

  function renderError(msg) {
    contentEl.innerHTML = '<p class="error">' + esc(msg) + "</p>";
  }

  function renderNotFound() {
    contentEl.innerHTML =
      "<h1>找不到这篇新闻</h1>" +
      '<p class="error">' +
      esc(CONFIG.missingTip) +
      "</p>" +
      '<p><a class="link-plain" href="../news.html">← 返回新闻列表</a></p>';
  }

  function renderMarkdown(mdText, meta) {
    if (typeof marked === "undefined") {
      renderError("Markdown 渲染库未加载（marked.min.js），请检查路径。");
      return;
    }
    contentEl.innerHTML = marked.parse(mdText);

    contentEl.querySelectorAll("a").forEach(function (link) {
      if (link.hostname && link.hostname !== location.hostname) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });

    if (meta && meta.title) {
      document.title = meta.title + CONFIG.titleSuffix;
    }
  }

  async function loadJson() {
    const res = await fetch(CONFIG.json, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + res.statusText);
    return res.json();
  }

  async function loadMd(path) {
    const res = await fetch(CONFIG.mdBase + path, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + res.statusText);
    return res.text();
  }

  async function main() {
    const id = getIdFromUrl();
    if (!id) {
      renderNotFound();
      return;
    }

    try {
      const data = await loadJson();
      const list = Array.isArray(data) ? data : data.items || [];
      const item = list.find(function (it) {
        return String(it.id) === String(id);
      });

      if (!item) {
        renderNotFound();
        return;
      }
      if (!item.md) {
        renderError("这条新闻没有配置 md 文件。");
        return;
      }

      const mdText = await loadMd(item.md);
      renderMarkdown(mdText, item);
    } catch (err) {
      renderError(
        "加载失败：" +
          err.message +
          "。请确认 news.json 和 md 文件存在，且通过本地服务器访问。",
      );
    }
  }

  main();
})();
