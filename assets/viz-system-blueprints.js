/* ==========================================================================
   System Design, Component by Component — Real-World Large-Scale Architectural Blueprints
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 22. Designing a URL Shortener (TinyURL)
   * -------------------------------------------------------------------------- */
  OS.register('tinyUrl', function (host) {
    let longUrl = 'https://engineering.systemdesign.io/articles/distributed-consensus-at-scale';
    let shortCode = '7bX9q2A';
    let redirectType = '301'; // 301 vs 302
    let urlLog = 'Key Generation Service (KGS) holds 100,000 pre-computed 7-character Base62 keys.';

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'HTTP Redirect Header',
      options: [
        { label: '301 Moved Permanently (Browser Cached)', value: '301' },
        { label: '302 Found (Analytics Tracked)', value: '302' }
      ],
      value: redirectType,
      onChange: (v) => { redirectType = v; render(); }
    });

    OS.button(controls, 'Shorten New URL', () => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let res = '';
      for (let i = 0; i < 7; i++) res += chars[Math.floor(Math.random() * chars.length)];
      shortCode = res;
      urlLog = `KGS issued key [${shortCode}] ➔ Stored in Redis Cache + Cassandra (Base62: 62⁷ = 3.5 Trillion URLs).`;
      render();
    }, { primary: true });

    OS.button(controls, 'Simulate Redirect Lookup', () => {
      urlLog = redirectType === '301'
        ? `HTTP 301: Browser cached redirect; subsequent hits bypass TinyURL servers.`
        : `HTTP 302: Request hits TinyURL server; click analytics & referrer logged.`;
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('TinyURL System Pipeline: Base62 Key Generation Service (KGS) + Redirect', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(urlLog, 16, 46);

        // Architecture mapping card
        const cardY = 65;
        const cardW = Math.max(260, w - 32);
        const cardH = 135;

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Short URL: https://tiny.cc/${shortCode}`, 28, cardY + 28);

        ctx.font = OS.font(10, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Long Target: ${longUrl.slice(0, 48)}...`, 28, cardY + 52);

        // Routing boxes
        const bW = Math.min(100, (cardW - 60) / 3);
        const bY = cardY + 68;

        // Box 1: KGS
        ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
        ctx.strokeStyle = OS.C.accent;
        ctx.beginPath();
        ctx.roundRect(28, bY, bW, 45, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(10, 'mono', 600);
        ctx.fillText('KGS Pool', 36, bY + 20);
        ctx.font = OS.font(8, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Pre-Allocated', 36, bY + 34);

        // Box 2: Redis
        const x2 = 28 + bW + 16;
        ctx.fillStyle = OS.rgba(OS.C.teal, 0.12);
        ctx.strokeStyle = OS.C.teal;
        ctx.beginPath();
        ctx.roundRect(x2, bY, bW, 45, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(10, 'mono', 600);
        ctx.fillText('Redis Cache', x2 + 8, bY + 20);
        ctx.font = OS.font(8, 'sans', 400);
        ctx.fillStyle = OS.C.teal;
        ctx.fillText('Sub-ms Lookup', x2 + 8, bY + 34);

        // Box 3: DB
        const x3 = x2 + bW + 16;
        ctx.fillStyle = OS.rgba(OS.C.amber, 0.12);
        ctx.strokeStyle = OS.C.amber;
        ctx.beginPath();
        ctx.roundRect(x3, bY, bW, 45, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(10, 'mono', 600);
        ctx.fillText('Cassandra', x3 + 8, bY + 20);
        ctx.font = OS.font(8, 'sans', 400);
        ctx.fillStyle = OS.C.amber;
        ctx.fillText('Persistent Store', x3 + 8, bY + 34);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 23. Designing a Distributed Web Crawler
   * -------------------------------------------------------------------------- */
  OS.register('webCrawler', function (host) {
    let frontier = ['https://cnn.com/world', 'https://nytimes.com/tech', 'https://bbc.com/news'];
    let crawledCount = 1420;
    let politenessDelayMs = 250;
    let bloomFilterBlocked = 18;
    let crawlLog = 'Crawler Frontier initialized with 3 seed URLs.';

    const controls = OS.controls(host);
    OS.button(controls, 'Crawl Next URL (Polite Fetch)', () => {
      if (frontier.length > 0) {
        const url = frontier.shift();
        crawledCount++;
        frontier.push(`https://domain${Math.floor(Math.random() * 5)}.org/page_${Math.floor(Math.random() * 100)}`);
        crawlLog = `FETCHED: ${url} (Parsed robots.txt & enforced 250ms host politeness).`;
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Inject Duplicate URL (Bloom Filter)', () => {
      bloomFilterBlocked++;
      crawlLog = '🛡️ BLOOM FILTER DISCARD: Duplicate URL detected before queueing!';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Distributed Web Crawler: URL Frontier & Politeness Queue Pipeline', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = crawlLog.includes('BLOOM') ? OS.C.rose : OS.C.muted;
        ctx.fillText(crawlLog, 16, 46);

        // Architecture Pipeline
        const cardW = Math.max(260, w - 32);
        const cardY = 65;

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(16, cardY, cardW, 140, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Crawl Statistics: ${crawledCount} Pages Indexed  |  Duplicates Blocked: ${bloomFilterBlocked}`, 28, cardY + 28);

        // Frontier queue display
        ctx.font = OS.font(10, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText('URL Frontier Priority Queues:', 28, cardY + 54);

        frontier.slice(0, 3).forEach((u, idx) => {
          ctx.fillStyle = OS.C.ink;
          ctx.fillText(`[Queue #${idx + 1}] ➔ ${u}`, 28, cardY + 76 + idx * 20);
        });
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 24. Designing a Real-Time Chat & Notification System
   * -------------------------------------------------------------------------- */
  OS.register('chatWebsocket', function (host) {
    let clients = [
      { id: 'Alice', server: 'WS-Gateway-1', room: 'Room-General' },
      { id: 'Bob', server: 'WS-Gateway-2', room: 'Room-General' },
      { id: 'Charlie', server: 'WS-Gateway-1', room: 'Room-Random' }
    ];
    let chatLog = 'WebSocket Gateways connected to Redis Pub/Sub backplane.';

    const controls = OS.controls(host);
    OS.button(controls, 'Alice Sends Message to Room-General', () => {
      chatLog = 'Alice (Gateway 1) ➔ Publishes to Redis "channel:Room-General" ➔ Gateway 2 broadcasts to Bob!';
      render();
    }, { primary: true });

    OS.button(controls, 'Simulate Client Disconnect (Heartbeat)', () => {
      chatLog = 'Presence Service: Bob missed 3 consecutive 15s heartbeats ➔ Marked OFFLINE in Redis.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Real-Time Chat: Distributed WebSockets + Redis Pub/Sub Backplane', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(chatLog, 16, 46);

        // Draw Gateways & Redis
        const bW = Math.min(130, (w - 60) / 3);
        const bH = 100;
        const startY = 70;

        // Gateway 1
        ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
        ctx.strokeStyle = OS.C.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, startY, bW, bH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('WS-Gateway 1', 26, startY + 24);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Alice, Charlie', 26, startY + 46);

        // Redis Pub/Sub in middle
        const midX = 16 + bW + 14;
        ctx.fillStyle = OS.rgba(OS.C.rose, 0.12);
        ctx.strokeStyle = OS.C.rose;
        ctx.beginPath();
        ctx.roundRect(midX, startY, bW, bH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Redis Pub/Sub', midX + 10, startY + 24);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.rose;
        ctx.fillText('Cross-Node Broker', midX + 10, startY + 46);

        // Gateway 2
        const rightX = midX + bW + 14;
        ctx.fillStyle = OS.rgba(OS.C.teal, 0.12);
        ctx.strokeStyle = OS.C.teal;
        ctx.beginPath();
        ctx.roundRect(rightX, startY, bW, bH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('WS-Gateway 2', rightX + 10, startY + 24);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Bob (Connected)', rightX + 10, startY + 46);

        // Footnote
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Ephemeral state (active connections) lives in memory; persistent chat history stored in Cassandra/HBase.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 25. Designing a Video Streaming Platform (YouTube / Netflix)
   * -------------------------------------------------------------------------- */
  OS.register('videoStreaming', function (host) {
    let currentBitrate = '1080p'; // 1080p, 720p, 480p
    let networkBandwidthMbps = 15;
    let streamLog = 'Streaming 1080p high-definition chunk via HLS/DASH manifest.';

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Client Bandwidth',
      options: [
        { label: 'Fast (15 Mbps)', value: 15 },
        { label: 'Throttled (3 Mbps)', value: 3 },
        { label: 'Poor (1 Mbps)', value: 1 }
      ],
      value: networkBandwidthMbps,
      onChange: (v) => {
        networkBandwidthMbps = parseInt(v);
        if (networkBandwidthMbps >= 10) currentBitrate = '1080p';
        else if (networkBandwidthMbps >= 3) currentBitrate = '720p';
        else currentBitrate = '480p';
        streamLog = `Adaptive Bitrate (ABR) switched playback chunk to ${currentBitrate} based on throughput!`;
        render();
      }
    });

    OS.button(controls, 'Fetch Next 4s Chunk', () => {
      streamLog = `FETCHED chunk_0042.m4s (${currentBitrate}) from Cloudflare CDN Edge Cache (0ms buffer stall).`;
      render();
    }, { primary: true });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Adaptive Bitrate Video Streaming (HLS/DASH): Current Resolution ${currentBitrate}`, 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(streamLog, 16, 46);

        // Draw Bitrate ladder
        const ladder = [
          { res: '1080p (6 Mbps)', color: OS.C.green },
          { res: '720p (2.5 Mbps)', color: OS.C.amber },
          { res: '480p (800 kbps)', color: OS.C.accent }
        ];

        const bW = Math.min(130, (w - 60) / 3);
        const bH = 90;
        const startY = 70;

        ladder.forEach((lad, idx) => {
          const bx = 16 + idx * (bW + 14);
          const isSelected = lad.res.includes(currentBitrate);

          ctx.fillStyle = isSelected ? OS.rgba(lad.color, 0.25) : OS.rgba(OS.C.surface, 0.9);
          ctx.strokeStyle = isSelected ? lad.color : OS.C.line;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(bx, startY, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(lad.res, bx + 10, startY + 28);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = isSelected ? lad.color : OS.C.muted;
          ctx.fillText(isSelected ? 'ACTIVE STREAM' : 'Available Profile', bx + 10, startY + 54);
        });

        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Client player inspects buffer health and download speed, dynamically selecting chunks from manifest.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 26. Designing an Inverted Index & Distributed Search Engine
   * -------------------------------------------------------------------------- */
  OS.register('invertedIndex', function (host) {
    const documents = [
      { id: 'Doc-1', text: 'distributed system design consensus' },
      { id: 'Doc-2', text: 'raft consensus protocol leader election' },
      { id: 'Doc-3', text: 'distributed cache redis replication' }
    ];

    let queryTerm = 'consensus';
    let matchedDocs = ['Doc-1', 'Doc-2'];

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Search Query Term',
      options: [
        { label: '"consensus"', value: 'consensus' },
        { label: '"distributed"', value: 'distributed' },
        { label: '"redis"', value: 'redis' }
      ],
      value: queryTerm,
      onChange: (v) => {
        queryTerm = v;
        matchedDocs = documents.filter(d => d.text.includes(v)).map(d => d.id);
        render();
      }
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Inverted Index Search Engine (Elasticsearch / Lucene Postings List)`, 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(`Query: "${queryTerm}" ➔ Matched Documents: [${matchedDocs.join(', ')}]`, 16, 46);

        // Draw Inverted Index Postings Lists
        const startY = 70;
        const rowH = 34;

        const terms = [
          { term: 'consensus', postings: ['Doc-1', 'Doc-2'] },
          { term: 'distributed', postings: ['Doc-1', 'Doc-3'] },
          { term: 'redis', postings: ['Doc-3'] }
        ];

        terms.forEach((t, idx) => {
          const y = startY + idx * (rowH + 8);
          const isQueried = t.term === queryTerm;

          ctx.fillStyle = isQueried ? OS.rgba(OS.C.accent, 0.2) : OS.rgba(OS.C.surface, 0.9);
          ctx.strokeStyle = isQueried ? OS.C.accent : OS.C.line;
          ctx.lineWidth = isQueried ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(16, y, 110, rowH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(t.term, 26, y + 22);

          // Arrow to Postings List
          ctx.strokeStyle = OS.C.muted;
          ctx.beginPath();
          ctx.moveTo(130, y + rowH / 2);
          ctx.lineTo(150, y + rowH / 2);
          ctx.stroke();

          // Postings nodes
          t.postings.forEach((p, pIdx) => {
            const px = 155 + pIdx * 70;
            ctx.fillStyle = isQueried ? OS.rgba(OS.C.green, 0.2) : OS.rgba(OS.C.surface, 0.8);
            ctx.strokeStyle = isQueried ? OS.C.green : OS.C.line;
            ctx.beginPath();
            ctx.roundRect(px, y + 2, 60, rowH - 4, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = OS.C.ink;
            ctx.font = OS.font(10, 'mono', 600);
            ctx.fillText(p, px + 10, y + 22);
          });
        });

        // Footnote
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Multi-term boolean queries intersect postings lists using skip-pointers in $O(M + N)$ time.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 27. Designing a Real-Time Collaborative Document Editor
   * -------------------------------------------------------------------------- */
  OS.register('collabEditor', function (host) {
    let docText = 'HELLO WORLD';
    let conflictLog = 'Document initialized in state: "HELLO WORLD"';

    const controls = OS.controls(host);
    OS.button(controls, 'Alice: Inserts " GREAT" at index 5', () => {
      docText = 'HELLO GREAT WORLD';
      conflictLog = 'Alice inserted " GREAT" at index 5 (Doc: "HELLO GREAT WORLD")';
      render();
    }, { primary: true });

    OS.button(controls, 'Bob: Concurrently Appends "!" at index 11', () => {
      if (docText.includes('GREAT')) {
        docText = 'HELLO GREAT WORLD!';
        conflictLog = 'CRDT Fractional Indexing adjusted Bob index from 11 ➔ 17 -> Preserved intent!';
      } else {
        docText = 'HELLO WORLD!';
        conflictLog = 'Bob appended "!" at index 11.';
      }
      render();
    });

    OS.button(controls, 'Reset Document', () => {
      docText = 'HELLO WORLD';
      conflictLog = 'Document reset to "HELLO WORLD"';
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Real-Time Collaborative Editing: CRDT Character Sequence Resolution', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = conflictLog.includes('CRDT') ? OS.C.green : OS.C.accent;
        ctx.fillText(conflictLog, 16, 46);

        // Document Canvas View
        const boxX = 20;
        const boxY = 70;
        const boxW = Math.max(260, w - 40);
        const boxH = 90;

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Converged Shared Document State:', boxX + 16, boxY + 28);

        ctx.font = OS.font(16, 'mono', 700);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`"${docText}"`, boxX + 16, boxY + 60);

        // Summary
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Operational Transformation (OT) requires central server; CRDTs allow peer-to-peer eventual convergence.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 28. Designing Distributed Observability: Tracing & Metrics
   * -------------------------------------------------------------------------- */
  OS.register('distributedTracing', function (host) {
    const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    let spans = [
      { name: 'GET /api/v1/orders', service: 'API Gateway', startMs: 0, durationMs: 145, color: OS.C.accent },
      { name: 'Validate JWT Token', service: 'Auth Service', startMs: 10, durationMs: 25, color: OS.C.teal },
      { name: 'Query Order Items', service: 'Order Service', startMs: 40, durationMs: 95, color: OS.C.amber },
      { name: 'SELECT * FROM orders', service: 'Postgres DB', startMs: 65, durationMs: 60, color: OS.C.rose }
    ];

    const controls = OS.controls(host);
    OS.button(controls, 'Inject New Distributed Trace', () => {
      // randomly adjust DB duration
      spans[3].durationMs = Math.floor(Math.random() * 80 + 30);
      spans[2].durationMs = spans[3].durationMs + 35;
      spans[0].durationMs = spans[2].durationMs + 50;
      render();
    }, { primary: true });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Distributed Tracing: OpenTelemetry W3C TraceContext (${spans[0].durationMs}ms Total)`, 16, 24);

        ctx.font = OS.font(10, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`TraceID: ${traceId}`, 16, 44);

        // Waterfall Spans
        const startY = 65;
        const rowH = 32;
        const maxDuration = Math.max(...spans.map(s => s.startMs + s.durationMs));
        const chartW = Math.max(160, w - 210);

        spans.forEach((s, idx) => {
          const y = startY + idx * (rowH + 8);

          // Span Label
          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(s.service, 16, y + 20);

          // Flame Bar
          const barX = 140 + (s.startMs / maxDuration) * chartW;
          const barW = Math.max(25, (s.durationMs / maxDuration) * chartW);

          ctx.fillStyle = OS.rgba(s.color, 0.25);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(barX, y + 4, barW, rowH - 8, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(9, 'mono', 500);
          ctx.fillText(`${s.name} (${s.durationMs}ms)`, barX + 6, y + 20);
        });
      }
    });

    function render() { cv.redraw(); }
  });

})();
