/* ==========================================================================
   System Design, Component by Component — Scalability & Distributed Infrastructure
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * HERO: Distributed System Capacity & Bottleneck Arena
   * -------------------------------------------------------------------------- */
  OS.register('systemHero', function (host) {
    let qps = 2500;
    let cacheHitRate = 0.85; // 85%
    let readRatio = 0.90; // 90% reads, 10% writes
    let cdnEnabled = true;

    const controls = OS.controls(host);

    OS.slider(controls, {
      label: 'Traffic Load (QPS)',
      min: 500,
      max: 10000,
      step: 500,
      value: qps,
      unit: ' QPS',
      onChange: (v) => { qps = parseInt(v); render(); }
    });

    OS.segmented(controls, {
      label: 'CDN Edge Layer',
      options: [
        { label: 'CDN Enabled (Offload)', value: 'on' },
        { label: 'Bypass CDN (Direct)', value: 'off' }
      ],
      value: cdnEnabled ? 'on' : 'off',
      onChange: (v) => { cdnEnabled = (v === 'on'); render(); }
    });

    OS.segmented(controls, {
      label: 'Cache Hit Ratio',
      options: [
        { label: 'Low (40%)', value: 0.40 },
        { label: 'Normal (85%)', value: 0.85 },
        { label: 'High (98%)', value: 0.98 }
      ],
      value: cacheHitRate,
      onChange: (v) => { cacheHitRate = parseFloat(v); render(); }
    });

    OS.button(controls, 'Simulate 5x Traffic Surge', () => {
      qps = Math.min(10000, qps * 2);
      render();
    }, { primary: true });

    OS.button(controls, 'Reset Capacity', () => {
      qps = 2500;
      cacheHitRate = 0.85;
      cdnEnabled = true;
      render();
    });

    const cv = OS.canvas(host, {
      height: 250,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        // Calculations
        const effectiveQps = cdnEnabled ? Math.round(qps * 0.4) : qps;
        const cdnOffload = qps - effectiveQps;
        const readQps = Math.round(effectiveQps * readRatio);
        const writeQps = effectiveQps - readQps;
        const cacheHits = Math.round(readQps * cacheHitRate);
        const dbQueries = (readQps - cacheHits) + writeQps;

        // DB saturation check: capacity ~ 1500 QPS
        const dbCapacity = 1500;
        const dbUtilization = Math.min(1.0, dbQueries / dbCapacity);
        const isDegraded = dbUtilization > 0.85;
        const latencyMs = Math.round(12 + (dbUtilization > 0.85 ? Math.pow(dbUtilization * 10, 2) : dbUtilization * 20));

        // Header
        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`End-to-End Pipeline: ${qps.toLocaleString()} Total Ingress QPS ➔ p99 Latency: ${latencyMs} ms`, 16, 24);

        // Architecture Pipeline Nodes
        const nodes = [
          { name: '1. Clients', sub: `${qps} QPS`, color: OS.C.accent },
          { name: '2. CDN Edge', sub: cdnEnabled ? `-${cdnOffload} offload` : 'Bypassed', color: OS.C.violet },
          { name: '3. Load Balancer', sub: `${effectiveQps} QPS`, color: OS.C.teal },
          { name: '4. Redis Cache', sub: `${cacheHits} hits/s`, color: OS.C.green },
          { name: '5. Sharded DB', sub: `${dbQueries} queries/s`, color: isDegraded ? OS.C.rose : OS.C.amber }
        ];

        const nodeW = Math.min(95, (w - 70) / nodes.length);
        const nodeH = 65;
        const startY = 48;

        nodes.forEach((n, idx) => {
          const x = 16 + idx * (nodeW + (w - 32 - nodes.length * nodeW) / (nodes.length - 1));

          ctx.fillStyle = OS.rgba(n.color, 0.14);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(x, startY, nodeW, nodeH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(n.name, x + 6, startY + 22);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = n.color;
          ctx.fillText(n.sub, x + 6, startY + 44);

          // Connecting flow line
          if (idx < nodes.length - 1) {
            const nextX = 16 + (idx + 1) * (nodeW + (w - 32 - nodes.length * nodeW) / (nodes.length - 1));
            ctx.strokeStyle = OS.C.muted;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x + nodeW, startY + nodeH / 2);
            ctx.lineTo(nextX, startY + nodeH / 2);
            ctx.stroke();
          }
        });

        // Health Gauges at bottom
        const barY = startY + nodeH + 30;
        const barW = Math.max(260, w - 32);

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(16, barY, barW, 80, 6);
        ctx.fill();
        ctx.stroke();

        // DB Utilization Bar
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Primary DB Load: ${Math.round(dbUtilization * 100)}% (${dbQueries} / ${dbCapacity} Max IOPS)`, 28, barY + 24);

        const meterW = barW - 60;
        const meterH = 12;
        ctx.fillStyle = OS.rgba(OS.C.line, 0.4);
        ctx.beginPath();
        ctx.roundRect(28, barY + 34, meterW, meterH, 4);
        ctx.fill();

        ctx.fillStyle = isDegraded ? OS.C.rose : OS.C.green;
        ctx.beginPath();
        ctx.roundRect(28, barY + 34, meterW * dbUtilization, meterH, 4);
        ctx.fill();

        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = isDegraded ? OS.C.rose : OS.C.muted;
        const diagMsg = isDegraded
          ? 'CRITICAL WARNING: Database IOPS saturated! Connection pool queues stalling, latency escalating.'
          : 'HEALTHY: Cache offload absorbs read traffic, database within nominal IOPS capacity.';
        ctx.fillText(diagMsg, 28, barY + 66);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 8. Load Balancing Routing & Health Probing
   * -------------------------------------------------------------------------- */
  OS.register('loadBalancer', function (host) {
    let algorithm = 'roundrobin'; // 'roundrobin' vs 'leastconn'
    let servers = [
      { id: 'App-S1', activeConnections: 14, healthy: true },
      { id: 'App-S2', activeConnections: 3, healthy: true },
      { id: 'App-S3', activeConnections: 29, healthy: true }
    ];
    let rrCounter = 0;
    let routingLog = 'Load balancer initialized with 3 healthy backend instances.';

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Balancing Algorithm',
      options: [
        { label: 'Round Robin', value: 'roundrobin' },
        { label: 'Least Connections', value: 'leastconn' }
      ],
      value: algorithm,
      onChange: (v) => { algorithm = v; render(); }
    });

    OS.button(controls, 'Dispatch 1 Request', () => {
      const live = servers.filter(s => s.healthy);
      if (live.length === 0) {
        routingLog = '502 Bad Gateway: All upstream backend servers dead!';
        render();
        return;
      }

      let chosen;
      if (algorithm === 'roundrobin') {
        chosen = live[rrCounter % live.length];
        rrCounter++;
      } else {
        // Least connections
        chosen = [...live].sort((a, b) => a.activeConnections - b.activeConnections)[0];
      }

      chosen.activeConnections++;
      routingLog = `Routed to [${chosen.id}] (${chosen.activeConnections} active conns) via ${algorithm.toUpperCase()}`;
      render();
    }, { primary: true });

    OS.button(controls, 'Kill Server S3', () => {
      const s3 = servers.find(s => s.id === 'App-S3');
      if (s3) s3.healthy = !s3.healthy;
      routingLog = `Server S3 health status toggled to: ${s3.healthy ? 'HEALTHY' : 'DOWN'}`;
      render();
    });

    OS.button(controls, 'Reset Connections', () => {
      servers = [
        { id: 'App-S1', activeConnections: 14, healthy: true },
        { id: 'App-S2', activeConnections: 3, healthy: true },
        { id: 'App-S3', activeConnections: 29, healthy: true }
      ];
      routingLog = 'Server connections re-seeded.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Layer 4 / Layer 7 Reverse Proxy & Load Balancer Router', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = routingLog.includes('502') ? OS.C.rose : OS.C.muted;
        ctx.fillText(routingLog, 16, 44);

        // Load Balancer node on the left
        const lbX = 20;
        const lbY = 70;
        const lbW = Math.min(140, w * 0.28);
        const lbH = 120;

        ctx.fillStyle = OS.rgba(OS.C.accent, 0.15);
        ctx.strokeStyle = OS.C.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(lbX, lbY, lbW, lbH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(12, 'mono', 600);
        ctx.fillText('HAProxy / NGINX', lbX + 10, lbY + 28);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(`Mode: ${algorithm}`, lbX + 10, lbY + 48);
        ctx.fillText('Health: Periodic TCP ping', lbX + 10, lbY + 68);

        // Server Pool on the right
        const srvX = Math.max(lbX + lbW + 50, w - Math.min(220, w * 0.45));
        const srvW = Math.min(200, w - srvX - 16);
        const srvH = 34;

        servers.forEach((s, idx) => {
          const sy = lbY + idx * (srvH + 10);

          ctx.fillStyle = s.healthy ? OS.rgba(OS.C.teal, 0.12) : OS.rgba(OS.C.rose, 0.12);
          ctx.strokeStyle = s.healthy ? OS.C.teal : OS.C.rose;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(srvX, sy, srvW, srvH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(s.id, srvX + 10, sy + 18);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = s.healthy ? OS.C.green : OS.C.rose;
          ctx.fillText(s.healthy ? `${s.activeConnections} active conns` : 'UNHEALTHY / REMOVED', srvX + 10, sy + 30);

          // Arrow from LB to Server
          ctx.strokeStyle = s.healthy ? OS.C.muted : OS.rgba(OS.C.rose, 0.4);
          ctx.setLineDash(s.healthy ? [] : [3, 3]);
          ctx.beginPath();
          ctx.moveTo(lbX + lbW, lbY + lbH / 2);
          ctx.lineTo(srvX, sy + srvH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 9. Consistent Hashing & Virtual Nodes
   * -------------------------------------------------------------------------- */
  OS.register('consistentHashing', function (host) {
    let virtualNodeFactor = 1; // 1 or 3
    let serverList = ['Node-A', 'Node-B', 'Node-C'];
    let keys = ['user:1001', 'user:2044', 'user:3099', 'user:4012', 'user:5580', 'user:7700'];

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Virtual Node Replication',
      options: [
        { label: 'Standard (1 VNode / Server)', value: 1 },
        { label: 'Balanced (3 VNodes / Server)', value: 3 }
      ],
      value: virtualNodeFactor,
      onChange: (v) => { virtualNodeFactor = parseInt(v); render(); }
    });

    OS.button(controls, 'Add Node-D', () => {
      if (!serverList.includes('Node-D')) {
        serverList.push('Node-D');
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Remove Node-D', () => {
      serverList = serverList.filter(s => s !== 'Node-D');
      render();
    });

    const cv = OS.canvas(host, {
      height: 250,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Consistent Hash Ring [0, 2³²-1] — ${serverList.length} Nodes (${virtualNodeFactor}x VNodes)`, 16, 24);

        // Circular ring representation
        const centerX = Math.min(140, w * 0.28);
        const centerY = 135;
        const radius = 65;

        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Place server nodes on ring
        const colors = [OS.C.accent, OS.C.amber, OS.C.teal, OS.C.rose];
        serverList.forEach((srv, sIdx) => {
          const col = colors[sIdx % colors.length];
          for (let v = 0; v < virtualNodeFactor; v++) {
            // deterministic angle
            const angle = ((sIdx * (360 / serverList.length) + v * (360 / (serverList.length * virtualNodeFactor * 1.5))) % 360) * Math.PI / 180;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);

            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Key distribution summary on the right
        const listX = Math.max(centerX + radius + 40, w - Math.min(260, w * 0.55));
        const listW = Math.min(240, w - listX - 16);

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(listX, 48, listW, 175, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Key-to-Node Partition Map:', listX + 12, 68);

        keys.forEach((k, idx) => {
          const assignedNode = serverList[idx % serverList.length];
          const col = colors[serverList.indexOf(assignedNode) % colors.length];

          ctx.font = OS.font(10, 'mono', 400);
          ctx.fillStyle = OS.C.ink;
          ctx.fillText(k, listX + 12, 92 + idx * 22);

          ctx.fillStyle = col;
          ctx.fillText(`➔ ${assignedNode}`, listX + 110, 92 + idx * 22);
        });
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 10. Rate Limiting Multi-Algorithm Arena
   * -------------------------------------------------------------------------- */
  OS.register('rateLimiter', function (host) {
    let algo = 'tokenbucket'; // 'tokenbucket' vs 'slidingwindow'
    const CAPACITY = 5;
    let tokens = 5;
    let requestHistory = []; // timestamps
    let dropCount = 0;
    let successCount = 0;

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Algorithm',
      options: [
        { label: 'Token Bucket', value: 'tokenbucket' },
        { label: 'Sliding Window Counter', value: 'slidingwindow' }
      ],
      value: algo,
      onChange: (v) => { algo = v; render(); }
    });

    OS.button(controls, 'Send 1 Request', () => {
      if (algo === 'tokenbucket') {
        if (tokens > 0) {
          tokens--;
          successCount++;
        } else {
          dropCount++;
        }
      } else {
        if (requestHistory.length < CAPACITY) {
          requestHistory.push(Date.now());
          successCount++;
        } else {
          dropCount++;
        }
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Burst (4 Requests)', () => {
      for (let i = 0; i < 4; i++) {
        if (algo === 'tokenbucket') {
          if (tokens > 0) { tokens--; successCount++; } else { dropCount++; }
        } else {
          if (requestHistory.length < CAPACITY) { requestHistory.push(Date.now()); successCount++; } else { dropCount++; }
        }
      }
      render();
    });

    OS.button(controls, 'Refill / Reset Window', () => {
      tokens = CAPACITY;
      requestHistory = [];
      dropCount = 0;
      successCount = 0;
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Rate Limiter: ${algo === 'tokenbucket' ? 'Token Bucket (Burst Allowed)' : 'Sliding Window Counter'}`, 16, 24);

        // Status banner
        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`HTTP 200 OK: ${successCount}  |  HTTP 429 Too Many Requests: ${dropCount}`, 16, 44);

        // Bucket / Tokens display
        const boxX = 20;
        const boxY = 65;
        const boxW = Math.max(260, w - 40);
        const boxH = 135;

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(algo === 'tokenbucket' ? `Bucket Capacity: ${CAPACITY} Tokens (Refill Rate: 1/sec)` : `Window Limit: ${CAPACITY} Requests / Sec`, boxX + 16, boxY + 26);

        // Draw individual token / slot items
        const slotW = Math.min(45, (boxW - 60) / CAPACITY);
        const slotH = 40;
        const startX = boxX + 16;
        const startY = boxY + 45;

        for (let i = 0; i < CAPACITY; i++) {
          const sx = startX + i * (slotW + 10);
          const hasToken = algo === 'tokenbucket' ? (i < tokens) : (i < requestHistory.length);

          ctx.fillStyle = hasToken ? (algo === 'tokenbucket' ? OS.rgba(OS.C.teal, 0.25) : OS.rgba(OS.C.accent, 0.25)) : OS.rgba(OS.C.line, 0.2);
          ctx.strokeStyle = hasToken ? (algo === 'tokenbucket' ? OS.C.teal : OS.C.accent) : OS.C.line;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(sx, startY, slotW, slotH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(hasToken ? (algo === 'tokenbucket' ? '🪙' : 'Req') : '·', sx + slotW / 2 - 8, startY + 24);
        }

        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        const tip = algo === 'tokenbucket'
          ? 'Token Bucket smooths bursts up to bucket capacity and refills steadily.'
          : 'Sliding window prevents rolling-window traffic spike exploits at window boundaries.';
        ctx.fillText(tip, boxX + 16, boxY + 115);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 11. Cache Stampede / Thundering Herd Arena
   * -------------------------------------------------------------------------- */
  OS.register('cacheStampede', function (host) {
    let mutexEnabled = true;
    let cacheKeyValid = true;
    let dbLoadQueries = 0;
    let cacheHits = 0;
    let stampedeLog = 'Hot Key "item:product_42" active in Redis cache.';

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Stampede Protection',
      options: [
        { label: 'Singleflight / Mutex Lock ON', value: 'on' },
        { label: 'No Lock (Thundering Herd)', value: 'off' }
      ],
      value: mutexEnabled ? 'on' : 'off',
      onChange: (v) => { mutexEnabled = (v === 'on'); render(); }
    });

    OS.button(controls, 'Expire Cache Key', () => {
      cacheKeyValid = false;
      stampedeLog = '⚠️ CACHE KEY EXPIRED: "item:product_42" evicted from Redis!';
      render();
    });

    OS.button(controls, 'Dispatch 1000 Concurrent Readers', () => {
      if (cacheKeyValid) {
        cacheHits += 1000;
        stampedeLog = 'Redis Cache HIT: 1,000 requests served in sub-millisecond.';
      } else {
        if (mutexEnabled) {
          // Only 1 goes to DB
          dbLoadQueries += 1;
          cacheKeyValid = true;
          cacheHits += 999;
          stampedeLog = '🛡️ MUTEX LOCK: Only 1 thread queried DB to rebuild cache; 999 threads waited and hit cache!';
        } else {
          // Thundering herd
          dbLoadQueries += 1000;
          stampedeLog = '💥 THUNDERING HERD COLLAPSE: All 1,000 threads hit the database simultaneously!';
        }
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Reset System', () => {
      cacheKeyValid = true;
      dbLoadQueries = 0;
      cacheHits = 0;
      stampedeLog = 'System reset: Redis hot key restored.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Cache Stampede Mitigation (Singleflight / Distributed Mutex Lock)', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = stampedeLog.includes('COLLAPSE') ? OS.C.rose : stampedeLog.includes('MUTEX') ? OS.C.green : OS.C.muted;
        ctx.fillText(stampedeLog, 16, 44);

        // Architecture breakdown
        const colW = Math.min(180, (w - 60) / 2);
        const yTop = 65;
        const boxH = 85;

        // Redis Card
        ctx.fillStyle = cacheKeyValid ? OS.rgba(OS.C.green, 0.12) : OS.rgba(OS.C.rose, 0.12);
        ctx.strokeStyle = cacheKeyValid ? OS.C.green : OS.C.rose;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, yTop, colW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Redis Cache Node', 26, yTop + 24);
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = cacheKeyValid ? OS.C.green : OS.C.rose;
        ctx.fillText(cacheKeyValid ? 'Key Status: ACTIVE' : 'Key Status: EXPIRED', 26, yTop + 46);
        ctx.font = OS.font(9, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Cache Hits: ${cacheHits.toLocaleString()}`, 26, yTop + 68);

        // Database Card
        const dbX = colW + 32;
        const isDbOverloaded = dbLoadQueries > 500;
        ctx.fillStyle = isDbOverloaded ? OS.rgba(OS.C.rose, 0.15) : OS.rgba(OS.C.amber, 0.12);
        ctx.strokeStyle = isDbOverloaded ? OS.C.rose : OS.C.amber;
        ctx.beginPath();
        ctx.roundRect(dbX, yTop, colW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Database Primary', dbX + 12, yTop + 24);
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = isDbOverloaded ? OS.C.rose : OS.C.ink;
        ctx.fillText(isDbOverloaded ? 'STATUS: OVERLOAD CRASH' : 'STATUS: NOMINAL', dbX + 12, yTop + 46);
        ctx.font = OS.font(9, 'mono', 400);
        ctx.fillStyle = isDbOverloaded ? OS.C.rose : OS.C.muted;
        ctx.fillText(`DB Load Hits: ${dbLoadQueries.toLocaleString()}`, dbX + 12, yTop + 68);

        // Bottom summary
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Singleflight / Mutex guarantees only one background worker computes the cache miss while others wait.', 16, h - 16);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 12. 64-Bit Twitter Snowflake ID Decomposer
   * -------------------------------------------------------------------------- */
  OS.register('snowflakeId', function (host) {
    let machineId = 7; // 0..1023
    let seq = 1;
    let generatedId = '1840928374928172941';
    let timestampMs = Date.now();

    function generate() {
      timestampMs = Date.now();
      seq = (seq + 1) % 4096;
      // Synthesize snowflake integer string
      const epochOffset = 1609459200000; // 2021-01-01
      const delta = timestampMs - epochOffset;
      generatedId = `${delta * 4194304 + (machineId << 12) + seq}`;
      render();
    }

    const controls = OS.controls(host);
    OS.button(controls, 'Generate Snowflake ID', generate, { primary: true });
    OS.button(controls, 'Simulate Machine ID #42', () => {
      machineId = 42;
      generate();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Twitter Snowflake 64-Bit Globally Unique ID Layout', 16, 24);

        // Generated ID
        ctx.font = OS.font(12, 'mono', 600);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(`Generated 64-Bit Int: ${generatedId}`, 16, 46);

        // Bit fields breakdown bar
        const totalW = Math.max(260, w - 32);
        const barY = 70;
        const barH = 55;

        // 1 Sign bit (1/64), 41 Timestamp bits (41/64), 10 Machine ID (10/64), 12 Sequence (12/64)
        const signW = Math.max(24, totalW * (1 / 64));
        const timeW = totalW * (41 / 64);
        const machW = totalW * (10 / 64);
        const seqW = totalW - signW - timeW - machW;

        // Sign bit
        ctx.fillStyle = OS.rgba(OS.C.faint, 0.2);
        ctx.fillRect(16, barY, signW, barH);
        ctx.strokeRect(16, barY, signW, barH);

        // Timestamp
        ctx.fillStyle = OS.rgba(OS.C.accent, 0.2);
        ctx.fillRect(16 + signW, barY, timeW, barH);
        ctx.strokeRect(16 + signW, barY, timeW, barH);

        // Machine ID
        ctx.fillStyle = OS.rgba(OS.C.amber, 0.2);
        ctx.fillRect(16 + signW + timeW, barY, machW, barH);
        ctx.strokeRect(16 + signW + timeW, barY, machW, barH);

        // Sequence
        ctx.fillStyle = OS.rgba(OS.C.green, 0.2);
        ctx.fillRect(16 + signW + timeW + machW, barY, seqW, barH);
        ctx.strokeRect(16 + signW + timeW + machW, barY, seqW, barH);

        // Text inside blocks
        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(9, 'mono', 600);
        ctx.fillText('41 Bits: Milliseconds (~69 years)', 16 + signW + 6, barY + 24);
        ctx.fillText('10b: Machine', 16 + signW + timeW + 4, barY + 24);
        ctx.fillText('12b: Seq', 16 + signW + timeW + machW + 4, barY + 24);

        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Machine: ${machineId} (up to 1024 nodes)`, 16 + signW + timeW + 4, barY + 44);
        ctx.fillText(`Seq: ${seq} (4096 IDs/ms)`, 16 + signW + timeW + machW + 4, barY + 44);

        // NTP clock drift warning
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Clock Drift Defense: If system time runs backward, server rejects generation or sleeps until timestamp catches up.', 16, h - 20);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 13. Probabilistic Data Structures: Bloom Filter Bit Array
   * -------------------------------------------------------------------------- */
  OS.register('bloomFilter', function (host) {
    const BITS = 16;
    let bitArray = new Array(BITS).fill(0);
    let items = ['user_alice', 'user_bob'];
    let queryResult = 'Ready to query membership';

    // Simple hash functions
    function hash1(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % BITS;
      return h;
    }

    function hash2(str) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) % BITS;
      return Math.abs(h);
    }

    // Insert initial items
    items.forEach(it => {
      bitArray[hash1(it)] = 1;
      bitArray[hash2(it)] = 1;
    });

    const controls = OS.controls(host);
    OS.button(controls, 'Insert "user_carol"', () => {
      if (!items.includes('user_carol')) {
        items.push('user_carol');
        bitArray[hash1('user_carol')] = 1;
        bitArray[hash2('user_carol')] = 1;
        queryResult = 'Inserted "user_carol" -> Bits set';
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Query "user_alice" [True Positive]', () => {
      const b1 = bitArray[hash1('user_alice')];
      const b2 = bitArray[hash2('user_alice')];
      queryResult = (b1 && b2) ? 'MATCH: "user_alice" is DEFINITELY or POSSIBLY in set.' : 'NOT FOUND: Definitely not in set.';
      render();
    });

    OS.button(controls, 'Query "user_fake" [Test Membership]', () => {
      const b1 = bitArray[hash1('user_fake')];
      const b2 = bitArray[hash2('user_fake')];
      if (b1 && b2) {
        queryResult = 'FALSE POSITIVE: All hash bits collide, but item was never inserted!';
      } else {
        queryResult = 'TRUE NEGATIVE: At least one bit is 0 -> 100% Guaranteed NOT in set.';
      }
      render();
    });

    OS.button(controls, 'Reset Bit Array', () => {
      bitArray = new Array(BITS).fill(0);
      items = ['user_alice'];
      bitArray[hash1('user_alice')] = 1;
      bitArray[hash2('user_alice')] = 1;
      queryResult = 'Bit array reset.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Bloom Filter (Bit Array Length: ${BITS}, k=2 Hash Functions)`, 16, 24);

        // Result readout
        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = queryResult.includes('FALSE POSITIVE') ? OS.C.rose : queryResult.includes('100%') ? OS.C.green : OS.C.accent;
        ctx.fillText(queryResult, 16, 46);

        // Draw bit array
        const bitW = Math.min(26, (w - 48) / BITS);
        const bitH = 45;
        const startX = 16;
        const startY = 70;

        for (let i = 0; i < BITS; i++) {
          const bx = startX + i * bitW;
          const isSet = bitArray[i] === 1;

          ctx.fillStyle = isSet ? OS.rgba(OS.C.teal, 0.25) : OS.rgba(OS.C.surface, 0.8);
          ctx.strokeStyle = isSet ? OS.C.teal : OS.C.line;
          ctx.lineWidth = isSet ? 2 : 1;
          ctx.fillRect(bx, startY, bitW, bitH);
          ctx.strokeRect(bx, startY, bitW, bitH);

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(String(bitArray[i]), bx + bitW / 2 - 4, startY + 24);

          ctx.fillStyle = OS.C.faint;
          ctx.font = OS.font(8, 'mono', 400);
          ctx.fillText(String(i), bx + bitW / 2 - 4, startY + bitH + 14);
        }

        // Summary cards
        const infoY = startY + bitH + 30;
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Inserted Elements (${items.length}): ${items.join(', ')}`, 16, infoY);
        ctx.fillText('Guaranteed: Zero False Negatives. False Positive rate decreases with larger m/n bit ratio.', 16, infoY + 20);
      }
    });

    function render() { cv.redraw(); }
  });

})();
