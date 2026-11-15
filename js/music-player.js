/* ==================== 班级站底部音乐播放器 ==================== */
(function () {
  'use strict';

  /* ---------- 曲目：把 src 换成你自己的音频文件即可 ---------- */
  var tracks = [
    {
      title: 'DESTRUCTION 3,2,1',
      artist: 'Supa7onyz',
      src: 'audio/DESTRUCTION_3,2,1.mp3',
      cover: 'audio/cover/DESTRUCTION_3,2,1_Phigros.jpg',
    },
    {
      title: 'Desultory Signals',
      artist: 'technoplanet',
      src: 'audio/Desultory_Signals.mp3',
      cover: 'audio/cover/Desultory_Signals.jpg',
    },
    {
      title: 'Distorted Fate',
      artist: '削除',
      src: 'audio/Distorted_Fate.mp3',
      cover: 'audio/cover/Distorted_Fate.jpg',
    },
  ];

  /* 默认封面（SVG 音符），track 没有 cover 时使用 */
  var DEFAULT_COVER =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" rx="10" fill="#eef4ff"/>' +
        '<path d="M40 18v16l-11 3V23l7-2v-3z" fill="#165dff"/>' +
        '<circle cx="25" cy="41" r="4.5" fill="#165dff"/>' +
        '<circle cx="36" cy="38" r="4.5" fill="#165dff"/>' +
      '</svg>'
    );

  /* ---------- 图标 ---------- */
  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM20 6v12l-9-6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6v12l9-6z"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z"/></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4zM16.5 8.5l1.5 1.5-3 3 3 3-1.5 1.5-3-3-3 3-1.5-1.5 3-3-3-3 1.5-1.5 3 3z"/></svg>',
  };

  /* ---------- 元素引用 ---------- */
  var audio = document.getElementById('audio');
  var player = document.getElementById('player');
  var cover = document.getElementById('playerCover');
  var titleEl = document.getElementById('playerTitle');
  var artistEl = document.getElementById('playerArtist');
  var playBtn = document.getElementById('playBtn');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var listBtn = document.getElementById('listBtn');
  var playlist = document.getElementById('playlist');
  var playlistTracks = document.getElementById('playlistTracks');
  var playlistClose = document.getElementById('playlistClose');
  var seek = document.getElementById('seek');
  var elapsedEl = document.getElementById('elapsed');
  var durationEl = document.getElementById('duration');
  var volumeBtn = document.getElementById('volumeBtn');
  var volumeRange = document.getElementById('volumeRange');

  if (!audio || !player) return;

  var current = 0;

  /* ---------- 工具 ---------- */
  function fmt(v) {
    if (!Number.isFinite(v)) return '0:00';
    var m = Math.floor(v / 60);
    var s = Math.floor(v % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function paintRange(input) {
    var pct = (Number(input.value) / Number(input.max)) * 100;
    input.style.background =
      'linear-gradient(to right, #165dff ' + pct + '%, #d8e2f2 ' + pct + '%)';
  }

  /* ---------- 播放列表 UI ---------- */
  tracks.forEach(function (t, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'playlist-track';
    btn.innerHTML =
      '<span class="track-number">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<img src="' + esc(t.cover || DEFAULT_COVER) + '" alt="" width="36" height="36" />' +
      '<span class="track-details">' +
        '<strong>' + esc(t.title) + '</strong>' +
        '<small>' + esc(t.artist) + '</small>' +
      '</span>' +
      '<span class="track-eq" aria-hidden="true">♪</span>';
    btn.addEventListener('click', function () {
      loadTrack(i, true);
      closePlaylist();
    });
    playlistTracks.appendChild(btn);
  });

  function highlightCurrent() {
    var items = playlistTracks.querySelectorAll('.playlist-track');
    items.forEach(function (el, i) {
      el.classList.toggle('active', i === current);
    });
  }

  function openPlaylist() {
    playlist.hidden = false;
    listBtn.setAttribute('aria-expanded', 'true');
  }
  function closePlaylist() {
    playlist.hidden = true;
    listBtn.setAttribute('aria-expanded', 'false');
  }

  /* ---------- 加载 / 切歌 ---------- */
  function loadTrack(i, play) {
    current = (i + tracks.length) % tracks.length;
    var t = tracks[current];

    audio.src = t.src;
    cover.src = t.cover || DEFAULT_COVER;
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;

    seek.value = 0;
    paintRange(seek);
    elapsedEl.textContent = '0:00';
    durationEl.textContent = '0:00';

    highlightCurrent();
    updateMediaSession();

    if (play) {
      audio.play().catch(function () {
        /* 浏览器拦截自动播放时静默失败，等用户点播放键 */
      });
    }
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !('MediaMetadata' in window)) return;
    var t = tracks[current];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist,
        album: '班级资料中转站',
        artwork: [{ src: t.cover || DEFAULT_COVER, sizes: '512x512', type: 'image/svg+xml' }],
      });
    } catch (e) {}
  }

  /* ---------- 播放控制 ---------- */
  function togglePlaying() {
    if (!audio.src) {
      loadTrack(current, true);
      return;
    }
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
  }

  function syncPlayIcon() {
    var playing = !audio.paused;
    playBtn.innerHTML = playing ? ICON.pause : ICON.play;
    playBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
    playBtn.title = playing ? '暂停' : '播放';
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }

  /* ---------- 音量 ---------- */
  var saved = 0.6;
  try {
    var s = Number(localStorage.getItem('bgm-volume'));
    if (Number.isFinite(s)) saved = Math.min(1, Math.max(0, s));
  } catch (e) {}
  audio.volume = saved;
  volumeRange.value = String(saved);

  function syncVolume() {
    var muted = audio.muted || audio.volume === 0;
    volumeBtn.innerHTML = muted ? ICON.mute : ICON.volume;
    volumeBtn.setAttribute('aria-label', muted ? '取消静音' : '静音');
    volumeBtn.title = muted ? '取消静音' : '静音';
    paintRange(volumeRange);
  }

  /* ---------- 事件绑定 ---------- */
  prevBtn.innerHTML = ICON.prev;
  nextBtn.innerHTML = ICON.next;
  listBtn.innerHTML = ICON.list;
  playBtn.innerHTML = ICON.play;

  playBtn.addEventListener('click', togglePlaying);
  prevBtn.addEventListener('click', function () { loadTrack(current - 1, true); });
  nextBtn.addEventListener('click', function () { loadTrack(current + 1, true); });

  listBtn.addEventListener('click', function () {
    if (playlist.hidden) openPlaylist();
    else closePlaylist();
  });
  playlistClose.addEventListener('click', closePlaylist);

  document.addEventListener('click', function (e) {
    if (!playlist.hidden && !player.contains(e.target)) closePlaylist();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !playlist.hidden) closePlaylist();
  });

  seek.addEventListener('input', function () {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (Number(seek.value) / Number(seek.max)) * audio.duration;
    }
    paintRange(seek);
  });

  volumeRange.addEventListener('input', function () {
    audio.volume = Number(volumeRange.value);
    audio.muted = false;
    syncVolume();
    try { localStorage.setItem('bgm-volume', String(audio.volume)); } catch (e) {}
  });

  volumeBtn.addEventListener('click', function () {
    audio.muted = !audio.muted;
    syncVolume();
  });

  audio.addEventListener('play', syncPlayIcon);
  audio.addEventListener('pause', syncPlayIcon);
  audio.addEventListener('ended', function () { loadTrack(current + 1, true); });

  audio.addEventListener('timeupdate', function () {
    if (Number.isFinite(audio.duration) && !seek.matches(':active')) {
      seek.value = String((audio.currentTime / audio.duration) * Number(seek.max));
    }
    elapsedEl.textContent = fmt(audio.currentTime);
    paintRange(seek);
  });

  audio.addEventListener('durationchange', function () {
    durationEl.textContent = fmt(audio.duration);
  });

  audio.addEventListener('error', function () {
    titleEl.textContent = '音频加载失败';
    artistEl.textContent = '请检查网络或替换音频地址';
  });

  /* ---------- Media Session ---------- */
  if ('mediaSession' in navigator) {
    var actions = {
      play: function () { audio.play().catch(function () {}); },
      pause: function () { audio.pause(); },
      previoustrack: function () { loadTrack(current - 1, true); },
      nexttrack: function () { loadTrack(current + 1, true); },
      seekto: function (d) {
        if (Number.isFinite(audio.duration) && d && Number.isFinite(d.seekTime)) {
          audio.currentTime = Math.min(audio.duration, Math.max(0, d.seekTime));
        }
      },
    };
    Object.keys(actions).forEach(function (name) {
      try { navigator.mediaSession.setActionHandler(name, actions[name]); } catch (e) {}
    });
  }

  /* ---------- 初始化 ---------- */
  loadTrack(0, false);
  syncVolume();
  syncPlayIcon();
  paintRange(seek);
})();