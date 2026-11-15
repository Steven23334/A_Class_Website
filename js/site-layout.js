/**
 * 全站公共布局脚本
 * ------------------------------------------------------------
 * 打开本文件即可统一修改：导航项、各页面页头文案、页脚声明。
 * 页面只需在 <body> 上声明 data-page="home|news|gallery|license|about"，
 * 其余 header / nav / footer 由本脚本自动渲染，无需再写。
 * ------------------------------------------------------------
 */
(function () {
  "use strict";

  // ==================== 公共配置（改这里即可全站生效） ====================

  // 导航项：path 为相对站点根目录的路径
  const NAV_ITEMS = [
    { key: "home", label: "首页", path: "index.html" },
    { key: "news", label: "新闻动态", path: "news.html" },
    { key: "gallery", label: "班级相册", path: "gallery/gallery.html" },
    { key: "calendar", label: "活动安排", path: "calendar.html" },
    {
      key: "information",
      label: "资料下载",
      path: "information/information.html",
    },
    { key: "about", label: "关于我们", path: "about_us.html" },
  ];

  // 各页面页头文案
  const HEADERS = {
    home: {
      title: "班级资料中转站",
      subtitle: "让我们更好地了解萧山尚德 801 班",
    },
    news: { title: "班级新闻中心", subtitle: "最新动态 · 通知公告 · 班级风采" },
    gallery: { title: "班级相册", subtitle: "活动留影 · 图片与视频" },
    calendar: { title: "活动安排", subtitle: "班级日程 · 重要时间节点" },
    information: { title: "资料下载", subtitle: "复习提纲 · 试卷 · 课件" },
    videos: { title: "每日视频", subtitle: "班级视频角落" },
    about: { title: "关于我们", subtitle: "站点信息 · 维护成员 · 联系方式" },
    vip: { title: "特供内容", subtitle: "特供 · 访问 · 隐藏" },
  };

  // 页脚链接：内部链接用 path（自动加 base），外部链接用 href
  const FOOTER_LINKS = [
    {
      path: "LICENSE/LICENSE.html",
      label: "Copyright (c) 2026 Steven23334,MIT",
    },
    {
      href: "https://github.com/Steven23334",
      label: "站长 GitHub 主页",
      external: true,
    },
    {
      href: "https://space.bilibili.com/3493293102991497",
      label: "浙ICP备114514号-Steven23334（测试）",
      external: true,
    },
  ];

  const FOOTER_NOTE = "801班班级资料中转站（试行版）";

  // 位于子目录的页面 key，用于自动计算 ../ 前缀
  const SUB_DIR_PAGES = ["gallery", "information"];

  // ==================== 自动识别与渲染 ====================

  const pageKey = document.body.dataset.page || "";
  // 优先使用 body 上显式的 data-base，否则根据页面 key 推断
  const base =
    document.body.dataset.base ||
    (SUB_DIR_PAGES.includes(pageKey) ? "../" : "./");

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

  function renderHeader() {
    const cfg = HEADERS[pageKey] || HEADERS.home;
    return (
      "<header>" +
      "<h1>" +
      esc(cfg.title) +
      "</h1>" +
      "<p>" +
      esc(cfg.subtitle) +
      "</p>" +
      "</header>"
    );
  }

  function renderNav() {
    const links = NAV_ITEMS.map(function (item) {
      const active = item.key === pageKey ? ' class="active"' : "";
      return (
        '<a href="' +
        base +
        item.path +
        '"' +
        active +
        ">" +
        esc(item.label) +
        "</a>"
      );
    }).join("");
    return "<nav>" + links + "</nav>";
  }

  function renderFooter() {
    const links = FOOTER_LINKS.map(function (item) {
      if (item.external) {
        return (
          '<a href="' +
          item.href +
          '" target="_blank" rel="noopener noreferrer">' +
          "<p>" +
          esc(item.label) +
          "</p>" +
          "</a>"
        );
      }
      return (
        '<a href="' +
        base +
        item.path +
        '" target="_blank" rel="noopener noreferrer">' +
        "<p>" +
        esc(item.label) +
        "</p>" +
        "</a>"
      );
    }).join("");

    return (
      "<footer>" +
      '<div class="footer-links">' +
      links +
      "<p>" +
      esc(FOOTER_NOTE) +
      "</p>" +
      "</div>" +
      "</footer>"
    );
  }

  function mount() {
    // header + nav 插到 body 最前面
    document.body.insertAdjacentHTML(
      "afterbegin",
      renderHeader() + renderNav(),
    );
    // footer 追加到 body 末尾
    document.body.insertAdjacentHTML("beforeend", renderFooter());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
