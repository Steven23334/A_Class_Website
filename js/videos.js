/**
 * 每日视频页
 * ------------------------------------------------------------
 * 换视频只改下面的 VIDEOS 数组，每一项：
 *   title  —— 可选，仅作为 iframe 的无障碍标题，不在页面上显示
 *   url    —— B 站视频页 / 播放器嵌入链接 / 其他外部链接
 *   start  —— 可选，秒数，从指定时间开始
 * ------------------------------------------------------------
 * 说明：
 *   B 站嵌入播放器（player.bilibili.com）为跨域 iframe，官方未开放
 *   从外部网页控制音量的接口，因此本页不再提供自定义音量条。
 *   音量与静音请使用播放器内部控件，或点击播放器后按 M 键切换静音。
 * ------------------------------------------------------------
 */
(function () {
  "use strict";

  // ==================== 视频配置 ====================
  var VIDEOS = [
    {
      title: "每日视频（发疯）",
      url: "https://www.bilibili.com/video/BV1Wdur6EESW",
    },
    {
      title: "每日视频（探讨）",
      url: "https://www.bilibili.com/video/BV13ibFenEYN",
    },
    // 无标题示例：
    // { url: "https://www.bilibili.com/video/BVxxxxxxxx" },
  ];

  // ==================== 链接解析 ====================
  function resolveVideo(raw, start) {
    var fallback = { type: "link", href: raw || "#", host: "外部链接" };
    if (!raw) return fallback;

    try {
      var url = new URL(raw, location.href);

      // A：player.bilibili.com 嵌入链接
      if (url.hostname === "player.bilibili.com") {
        url.searchParams.set("autoplay", "0");
        url.searchParams.set("muted", "0");
        if (start) url.searchParams.set("t", String(start));
        return { type: "iframe", src: url.toString() };
      }

      // B：B 站视频页 / 移动版视频页
      if (
        url.hostname === "www.bilibili.com" ||
        url.hostname === "m.bilibili.com"
      ) {
        var m = url.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/);
        if (m) {
          var embed = new URL("https://player.bilibili.com/player.html");
          embed.searchParams.set("bvid", m[1]);
          embed.searchParams.set("autoplay", "0");
          embed.searchParams.set("muted", "0");
          if (start) embed.searchParams.set("t", String(start));
          return { type: "iframe", src: embed.toString() };
        }
      }

      // C：其他域名 → 降级
      return {
        type: "link",
        href: url.toString(),
        host: url.hostname || "外部链接",
      };
    } catch (e) {
      console.warn("视频链接解析失败：", e);
      return fallback;
    }
  }

  // ==================== 渲染 ====================
  function createIframe(src, title) {
    var iframe = document.createElement("iframe");
    iframe.className = "bili-player";
    iframe.src = src;
    iframe.scrolling = "no";
    iframe.frameBorder = "no";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "no-referrer";
    iframe.loading = "lazy";
    iframe.title = title || "每日视频";
    return iframe;
  }

  function createFallbackLink(resolved) {
    var link = document.createElement("a");
    link.className = "video-fallback-link";
    link.href = resolved.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "打开外部链接 · " + (resolved.host || "外部站点");
    return link;
  }

  function render() {
    var listEl = document.getElementById("videoList");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!VIDEOS.length) {
      var empty = document.createElement("div");
      empty.textContent = "暂无视频";
      listEl.appendChild(empty);
      return;
    }

    VIDEOS.forEach(function (video) {
      var wrap = document.createElement("div");
      wrap.className = "video-wrap";

      var resolved = resolveVideo(video.url, video.start);
      if (resolved.type === "iframe") {
        wrap.appendChild(createIframe(resolved.src, video.title));
      } else {
        wrap.appendChild(createFallbackLink(resolved));
      }

      listEl.appendChild(wrap);
    });
  }

  // ==================== 初始化 ====================
  function init() {
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();