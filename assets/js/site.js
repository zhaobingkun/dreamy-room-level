
(function(){
  const year = document.querySelector('[data-year]');
  if(year){ year.textContent = new Date().getFullYear(); }
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('.nav-links');
  if(navToggle && navLinks){ navToggle.addEventListener('click', ()=> navLinks.classList.toggle('open')); }
  const isLevelPage = /\\/level\\/\\d+\\/?$/.test(window.location.pathname);
  if (isLevelPage) {
    document.body.classList.add('level-page');
  }
  // Ensure contact link exists in nav across pages
  if (navLinks && !navLinks.querySelector('a[href="/contact.html"]')) {
    const link = document.createElement('a');
    link.href = '/contact.html';
    link.textContent = 'Contact';
    navLinks.appendChild(link);
  }
  const friendLinks = [
    { label: '🐦 Twitter', url: 'https://twitter.com' },
    { label: '▶ YouTube', url: 'https://youtube.com' },
    { label: '✨ showmysites', url: 'https://showmysites.com' },
    { label: 'tikflash', url: 'https://tikflash.com' },
    { label: 'playcolorblockjam', url: 'https://playcolorblockjam.com' },
    { label: 'geckoout', url: 'https://geckoout.com' },
    { label: 'dropthecat', url: 'https://dropthecat.com' },
    { label: 'Reddit', url: 'https://www.reddit.com' },
    { label: 'dropawaylevel', url: 'https://dropawaylevel.com' },
    { label: 'aistorygenerator', url: 'https://aistorygenerator.com' },
    { label: 'lettergenie', url: 'https://lettergenie.com' },
    { label: 'you2mp4', url: 'https://you2mp4.com' },
    { label: 'monumentvalley 3', url: 'https://monumentvalley3.com' },
    { label: 'All in AI Tools', url: 'https://allinaitools.com' },
    { label: 'hexa away', url: 'https://hexaaway.com' },
    { label: 'Okei AI Tools', url: 'https://okeiaitools.com' },
    { label: 'evernote', url: 'https://evernote.com' },
    { label: 'Startup Fame', url: 'https://startupfame.com' },
    { label: 'ShowMySites Badge', url: 'https://showmysites.com/badge' },
    { label: 'DeepLaunch.io', url: 'https://deeplaunch.io' }
  ];

  function injectFooterLinks() {
    const grid = document.querySelector('.footer-grid');
    if (!grid || grid.querySelector('[data-friend-links]')) return;
    const col = document.createElement('div');
    col.setAttribute('data-friend-links','');
    const list = friendLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`).join('<br>');
    col.innerHTML = `<strong>Friend Links</strong><p>${list}</p>`;
    grid.appendChild(col);
  }

  function injectAnalytics() {
    if (document.querySelector('[data-analytics-gtag]')) return;
    const wrap = document.createElement('div');
    wrap.style.display = 'none';
    wrap.setAttribute('data-analytics-gtag', 'true');
    const scriptAsync = document.createElement('script');
    scriptAsync.async = true;
    scriptAsync.src = 'https://www.googletagmanager.com/gtag/js?id=G-31PECBEES4';
    const scriptInline = document.createElement('script');
    scriptInline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-31PECBEES4');
    `;
    wrap.appendChild(scriptAsync);
    wrap.appendChild(scriptInline);
    document.body.appendChild(wrap);
  }

  function addJsonLd(obj){
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }

  function injectStructuredData() {
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DreamyRoomLevel.org",
      "url": "https://dreamyroomlevel.org/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dreamyroomlevel.org/level/{search_term_string}/",
        "query-input": "required name=search_term_string"
      }
    });

    const levelMatch = window.location.pathname.match(/level\/(\d+)/);
    if (levelMatch && window.DREAMY_PLAYLIST) {
      const lvl = parseInt(levelMatch[1], 10);
      const entry = window.DREAMY_PLAYLIST.find(e => lvl >= e.levelStart && lvl <= e.levelEnd);
      if (entry && entry.videoId) {
        const thumb = `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`;
        addJsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamyroomlevel.org/" },
            { "@type": "ListItem", "position": 2, "name": "Levels", "item": "https://dreamyroomlevel.org/levels.html" },
            { "@type": "ListItem", "position": 3, "name": `Level ${lvl}`, "item": `https://dreamyroomlevel.org/level/${lvl}/` }
          ]
        });
        addJsonLd({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": entry.title || `Dreamy Room Level ${lvl} Walkthrough`,
          "description": entry.subtitle || `Walkthrough for Dreamy Room level ${lvl}.`,
          "thumbnailUrl": [thumb],
          "contentUrl": entry.href || `https://www.youtube.com/watch?v=${entry.videoId}`,
          "embedUrl": `https://www.youtube.com/embed/${entry.videoId}`,
          "publisher": { "@type": "Organization", "name": "DreamyRoomLevel.org" }
        });
      }
    }
  }

  // Replace YouTube iframes with poster + click-to-play to avoid black player
  const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270" fill="none"><rect width="480" height="270" rx="16" fill="%23f4efff" stroke="%23d8cfff" stroke-width="4"/><path d="M205 95l80 40-80 40V95z" fill="%237c5dff"/></svg>';

  function setupVideoPosters() {
    document.querySelectorAll('.video-frame iframe').forEach((iframe) => {
      const src = iframe.getAttribute('src') || '';
      const match = src.match(/embed\/([\\w-]+)/);
      if (!match || !match[1]) return;
      const videoId = match[1];
      const container = iframe.parentElement;
      if (!container) return;
      const posterUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const poster = document.createElement('div');
      poster.className = 'video-poster';
      poster.innerHTML = `<img src=\"${posterUrl}\" alt=\"Video preview\"><div class=\"play-btn\"><span>Play</span></div>`;
      container.innerHTML = '';
      container.appendChild(poster);
      poster.addEventListener('click', () => {
        const player = document.createElement('iframe');
        const url = src.includes('?') ? `${src}&autoplay=1` : `${src}?autoplay=1`;
        player.setAttribute('src', url);
        player.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        player.setAttribute('allowfullscreen', 'true');
        player.setAttribute('loading', 'lazy');
        player.style.width = '100%';
        player.style.height = '100%';
        container.innerHTML = '';
        container.appendChild(player);
      });
    });
  }

  function setupLevelNavThumbnails() {
    const nav = document.querySelector('.level-nav');
    if (!nav || !window.DREAMY_PLAYLIST) return;

    const playlist = window.DREAMY_PLAYLIST;
    const path = window.location.pathname || '';
    let currentLevel = parseInt((path.match(/level\\/(\\d+)/) || [])[1], 10);
    if (Number.isNaN(currentLevel)) {
      const badgeText = (document.querySelector('.badge') || {}).textContent || '';
      currentLevel = parseInt((badgeText.match(/(\\d+)/) || [])[1], 10);
    }
    if (!currentLevel || Number.isNaN(currentLevel)) return;

    const levelMap = new Map(playlist.flatMap(item => {
      const entries = [];
      for(let i=item.levelStart; i<=item.levelEnd; i++){ entries.push([i, item]); }
      return entries;
    }));
    const maxLevel = Math.max(...playlist.map(item => item.levelEnd));

    const thumbUrl = (levelNum) => {
      const data = levelMap.get(levelNum);
      const youtubeThumb = data && data.videoId ? `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg` : '';
      return { local: `/assets/images/thumbnails/Dreamy-Room-Level-${levelNum}.webp`, fallback: youtubeThumb };
    };

    const createCard = (type, levelNum, label, href) => {
      const el = document.createElement('a');
      el.className = `nav-card ${type}`;
      if (href) el.href = href;
      const img = document.createElement('img');
      img.alt = `Level ${levelNum} thumbnail`;
      img.loading = 'lazy';
      const urls = thumbUrl(levelNum);
      img.src = urls.local;
      let triedFallback = false;
      const handleError = () => {
        if (!triedFallback && urls.fallback && img.src !== urls.fallback) {
          triedFallback = true;
          img.src = urls.fallback;
          return;
        }
        if (img.src !== PLACEHOLDER_IMG) {
          img.src = PLACEHOLDER_IMG;
        }
      };
      img.onerror = handleError;
      const span = document.createElement('span');
      span.className = 'label';
      span.textContent = label;
      el.appendChild(img);
      el.appendChild(span);
      return el;
    };

    const prevLevel = currentLevel > 1 ? currentLevel - 1 : null;
    const nextLevel = currentLevel < maxLevel ? currentLevel + 1 : null;

    const grid = document.createElement('div');
    grid.className = 'level-nav-grid';
    const header = document.createElement('div');
    header.className = 'level-nav-header';
    const title = document.createElement('h3');
    title.textContent = 'Related Levels';
    const allLink = document.createElement('a');
    allLink.href = '/levels.html';
    allLink.className = 'level-nav-all';
    allLink.textContent = 'All Levels →';
    header.appendChild(title);
    header.appendChild(allLink);

    if (prevLevel) {
      grid.appendChild(createCard('prev', prevLevel, `← Level ${prevLevel}`, `/level/${prevLevel}/`));
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'nav-card disabled';
      placeholder.innerHTML = '<div class="spacer-thumb"></div><span class="label">Start</span>';
      grid.appendChild(placeholder);
    }

    if (nextLevel) {
      grid.appendChild(createCard('next', nextLevel, `Level ${nextLevel} →`, `/level/${nextLevel}/`));
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'nav-card disabled';
      placeholder.innerHTML = '<div class="spacer-thumb"></div><span class="label">End</span>';
      grid.appendChild(placeholder);
    }

    nav.innerHTML = '';
    nav.appendChild(header);
    nav.appendChild(grid);
  }

  function init() {
    setupVideoPosters();
    setupLevelNavThumbnails();
    injectFooterLinks();
    injectStructuredData();
    injectAnalytics();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
