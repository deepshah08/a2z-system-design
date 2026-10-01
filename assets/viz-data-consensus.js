/* ==========================================================================
   System Design, Component by Component — Data Systems, Consistency & Consensus
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 14. Relational vs NoSQL: CAP & PACELC Trade-offs
   * -------------------------------------------------------------------------- */
  OS.register('pacelcMatrix', function (host) {
    let selectedSystem = 'Cassandra'; // Cassandra (PA/EL), DynamoDB (PA/EL), Spanner (PC/EC), Postgres (PC/EC), MongoDB (PC/EC)

    const systems = [
      { name: 'Cassandra', p: 'PA', e: 'EL', desc: 'If Partition: Availability over Consistency. Else: Low Latency over Consistency.' },
      { name: 'Google Spanner', p: 'PC', e: 'EC', desc: 'If Partition: Consistency over Availability. Else: Consistency over Latency (TrueTime API).' },
      { name: 'Amazon DynamoDB', p: 'PA', e: 'EL', desc: 'Eventual consistency by default for single-digit ms write latency.' },
      { name: 'PostgreSQL Primary', p: 'PC', e: 'EC', desc: 'Strong ACID serializability; stalls on split-brain partition.' }
    ];

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'System Archetype',
      options: systems.map(s => ({ label: s.name, value: s.name })),
      value: selectedSystem,
      onChange: (v) => { selectedSystem = v; render(); }
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
        const sys = systems.find(s => s.name === selectedSystem) || systems[0];

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`PACELC Theorem: ${sys.name} Classification`, 16, 24);

        // Partition branch vs Normal branch
        const cardW = Math.min(180, (w - 60) / 2);
        const cardH = 110;
        const yPos = 50;

        // Box 1: Partition condition (P)
        ctx.fillStyle = OS.rgba(OS.C.rose, 0.12);
        ctx.strokeStyle = OS.C.rose;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, yPos, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(12, 'mono', 600);
        ctx.fillText('If Partition (P)', 28, yPos + 24);
        ctx.font = OS.font(14, 'display', 700);
        ctx.fillStyle = sys.p === 'PA' ? OS.C.green : OS.C.accent;
        ctx.fillText(`Yields: ${sys.p === 'PA' ? 'Availability (A)' : 'Consistency (C)'}`, 28, yPos + 55);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(sys.p === 'PA' ? 'Accepts writes during partition' : 'Rejects writes / Stalls', 28, yPos + 80);

        // Box 2: Else condition (E)
        const x2 = cardW + 32;
        ctx.fillStyle = OS.rgba(OS.C.teal, 0.12);
        ctx.strokeStyle = OS.C.teal;
        ctx.beginPath();
        ctx.roundRect(x2, yPos, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(12, 'mono', 600);
        ctx.fillText('Else Normal (E)', x2 + 12, yPos + 24);
        ctx.font = OS.font(14, 'display', 700);
        ctx.fillStyle = sys.e === 'EL' ? OS.C.amber : OS.C.accent;
        ctx.fillText(`Yields: ${sys.e === 'EL' ? 'Latency (L)' : 'Consistency (C)'}`, x2 + 12, yPos + 55);
        ctx.font = OS.font(9, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(sys.e === 'EL' ? 'Async replication for speed' : 'Sync wait for quorums', x2 + 12, yPos + 80);

        // Description footer
        const footY = yPos + cardH + 25;
        ctx.font = OS.font(11, 'sans', 400);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Architecture Verdict: ${sys.desc}`, 16, footY);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 15. Database Sharding & Partitioning Strategies
   * -------------------------------------------------------------------------- */
  OS.register('databaseSharding', function (host) {
    let shards = [
      { id: 'Shard-0', range: 'User [0 - 33]', records: ['usr_12', 'usr_29'] },
      { id: 'Shard-1', range: 'User [34 - 66]', records: ['usr_45', 'usr_52'] },
      { id: 'Shard-2', range: 'User [67 - 99]', records: ['usr_78', 'usr_91'] }
    ];
    let lastQueryMsg = 'Router ready for shard lookups.';

    function insertUser() {
      const uid = Math.floor(Math.random() * 99 + 1);
      const shardIdx = uid <= 33 ? 0 : uid <= 66 ? 1 : 2;
      shards[shardIdx].records.push(`usr_${uid}`);
      lastQueryMsg = `INSERT usr_${uid} ➔ Routed by Hash/Range to ${shards[shardIdx].id}`;
      render();
    }

    function scatterGather() {
      const total = shards.reduce((acc, s) => acc + s.records.length, 0);
      lastQueryMsg = `SCATTER-GATHER: Queried all 3 shards in parallel ➔ Merged ${total} rows in router!`;
      render();
    }

    const controls = OS.controls(host);
    OS.button(controls, 'Insert User (Direct Shard Route)', insertUser, { primary: true });
    OS.button(controls, 'Cross-Shard Scatter-Gather Query', scatterGather);
    OS.button(controls, 'Reset Shards', () => {
      shards = [
        { id: 'Shard-0', range: 'User [0 - 33]', records: ['usr_12', 'usr_29'] },
        { id: 'Shard-1', range: 'User [34 - 66]', records: ['usr_45', 'usr_52'] },
        { id: 'Shard-2', range: 'User [67 - 99]', records: ['usr_78', 'usr_91'] }
      ];
      lastQueryMsg = 'Shards reset.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Horizontal Database Sharding: Routing Key (hash(user_id) % 3)', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = lastQueryMsg.includes('SCATTER') ? OS.C.amber : OS.C.muted;
        ctx.fillText(lastQueryMsg, 16, 46);

        // Draw 3 Shards
        const sW = Math.min(130, (w - 60) / 3);
        const sH = 120;
        const startY = 65;

        shards.forEach((s, idx) => {
          const sx = 16 + idx * (sW + 14);

          ctx.fillStyle = OS.rgba(OS.C.surface, 0.9);
          ctx.strokeStyle = OS.C.line;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(sx, startY, sW, sH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(s.id, sx + 10, startY + 22);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = OS.C.muted;
          ctx.fillText(s.range, sx + 10, startY + 38);

          ctx.fillStyle = OS.C.accent;
          ctx.font = OS.font(9, 'mono', 400);
          const recSlice = s.records.slice(-3);
          recSlice.forEach((r, rIdx) => {
            ctx.fillText(`• ${r}`, sx + 10, startY + 60 + rIdx * 18);
          });
        });

        // Footnote
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Cross-shard joins are anti-patterns: denormalize data or use application-level merging.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 16. Replication & Quorum Consensus (Dynamo-Style)
   * -------------------------------------------------------------------------- */
  OS.register('quorumConsistency', function (host) {
    const N = 3; // Replicas
    let W = 2; // Write quorum
    let R = 2; // Read quorum
    let replicas = [
      { id: 'Replica-A', val: 'V1', ts: 100 },
      { id: 'Replica-B', val: 'V1', ts: 100 },
      { id: 'Replica-C', val: 'V1', ts: 100 }
    ];
    let quorumStatus = 'Quorum condition: R + W = 4 > N (Strong Consistency)';

    function writeVal() {
      const nextTs = Date.now();
      const nextVal = `V${Math.floor(Math.random() * 80 + 10)}`;
      // Write to W replicas
      for (let i = 0; i < W; i++) {
        replicas[i].val = nextVal;
        replicas[i].ts = nextTs;
      }
      quorumStatus = `WROTE ${nextVal} to ${W} replicas (Write Quorum satisfied).`;
      render();
    }

    function readVal() {
      // Read from R replicas
      const readSample = replicas.slice(0, R);
      const latest = [...readSample].sort((a, b) => b.ts - a.ts)[0];
      const isStrong = (R + W) > N;
      quorumStatus = isStrong
        ? `STRONG READ: R + W > N guarantees reading latest value [${latest.val}].`
        : `STALE READ RISK: R + W <= N allowed reading potentially stale replica!`;
      render();
    }

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Read Quorum (R)',
      options: [{ label: 'R = 1', value: 1 }, { label: 'R = 2', value: 2 }, { label: 'R = 3', value: 3 }],
      value: R,
      onChange: (v) => { R = parseInt(v); render(); }
    });

    OS.segmented(controls, {
      label: 'Write Quorum (W)',
      options: [{ label: 'W = 1', value: 1 }, { label: 'W = 2', value: 2 }, { label: 'W = 3', value: 3 }],
      value: W,
      onChange: (v) => { W = parseInt(v); render(); }
    });

    OS.button(controls, 'Write Value ➔', writeVal, { primary: true });
    OS.button(controls, 'Read Value ➔', readVal);

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
        const isStrong = (R + W) > N;

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Leaderless Quorum: N=${N}, R=${R}, W=${W} ➔ ${isStrong ? 'Strong Consistency (R+W > N)' : 'Eventual / Stale Anomaly (R+W ≤ N)'}`, 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = quorumStatus.includes('STALE') ? OS.C.rose : OS.C.green;
        ctx.fillText(quorumStatus, 16, 46);

        // Draw 3 replicas
        const rW = Math.min(130, (w - 60) / 3);
        const rH = 110;
        const startY = 65;

        replicas.forEach((rep, idx) => {
          const rx = 16 + idx * (rW + 14);

          ctx.fillStyle = OS.rgba(OS.C.teal, 0.12);
          ctx.strokeStyle = OS.C.teal;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(rx, startY, rW, rH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(rep.id, rx + 10, startY + 24);

          ctx.font = OS.font(12, 'mono', 700);
          ctx.fillStyle = OS.C.accent;
          ctx.fillText(`Val: ${rep.val}`, rx + 10, startY + 54);

          ctx.font = OS.font(9, 'mono', 400);
          ctx.fillStyle = OS.C.muted;
          ctx.fillText(`TS: ...${String(rep.ts).slice(-4)}`, rx + 10, startY + 80);
        });

        // Math formula note
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Overlap Principle: Pigeonhole Theorem guarantees at least one node in Read set participated in Write set.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 17. Distributed Consensus: The Raft Protocol
   * -------------------------------------------------------------------------- */
  OS.register('raftConsensus', function (host) {
    let nodes = [
      { id: 'Node-1', role: 'LEADER', term: 2, logCount: 5 },
      { id: 'Node-2', role: 'FOLLOWER', term: 2, logCount: 5 },
      { id: 'Node-3', role: 'FOLLOWER', term: 2, logCount: 5 },
      { id: 'Node-4', role: 'FOLLOWER', term: 2, logCount: 5 },
      { id: 'Node-5', role: 'FOLLOWER', term: 2, logCount: 5 }
    ];
    let raftLog = 'Cluster stable: Node-1 sending periodic AppendEntries heartbeats.';

    const controls = OS.controls(host);
    OS.button(controls, 'Kill Current Leader', () => {
      const leader = nodes.find(n => n.role === 'LEADER');
      if (leader) {
        leader.role = 'DEAD';
        raftLog = `💥 ${leader.id} crashed! Follower election timers ticking down...`;
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Trigger Election Timeout', () => {
      const aliveFollowers = nodes.filter(n => n.role === 'FOLLOWER');
      if (aliveFollowers.length >= 3) {
        // Elect first alive follower
        const candidate = aliveFollowers[0];
        candidate.term++;
        candidate.role = 'LEADER';
        raftLog = `🗳️ ELECTION: ${candidate.id} won majority votes (Term ${candidate.term}) -> Promoted to LEADER!`;
      } else {
        raftLog = 'QUORUM LOSS: Cannot elect leader without majority (> N/2) alive nodes!';
      }
      render();
    });

    OS.button(controls, 'Replicate Log Entry', () => {
      const leader = nodes.find(n => n.role === 'LEADER');
      if (leader) {
        leader.logCount++;
        nodes.filter(n => n.role === 'FOLLOWER').forEach(f => f.logCount = leader.logCount);
        raftLog = `Log entry #${leader.logCount} committed by consensus majority.`;
      } else {
        raftLog = 'Cannot write: No active leader in cluster.';
      }
      render();
    });

    OS.button(controls, 'Revive All Nodes', () => {
      nodes.forEach((n, idx) => {
        n.role = idx === 0 ? 'LEADER' : 'FOLLOWER';
        n.term = 2;
        n.logCount = 5;
      });
      raftLog = 'All 5 Raft cluster nodes revived.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Raft Consensus: 5-Node State Machine Replication', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = raftLog.includes('ELECTION') ? OS.C.amber : raftLog.includes('crashed') ? OS.C.rose : OS.C.muted;
        ctx.fillText(raftLog, 16, 46);

        // Nodes
        const nW = Math.min(80, (w - 70) / 5);
        const nH = 95;
        const startY = 70;

        nodes.forEach((n, idx) => {
          const nx = 16 + idx * (nW + 10);
          const isLeader = n.role === 'LEADER';
          const isDead = n.role === 'DEAD';

          ctx.fillStyle = isLeader ? OS.rgba(OS.C.green, 0.2) : isDead ? OS.rgba(OS.C.rose, 0.2) : OS.rgba(OS.C.surface, 0.9);
          ctx.strokeStyle = isLeader ? OS.C.green : isDead ? OS.C.rose : OS.C.line;
          ctx.lineWidth = isLeader ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(nx, startY, nW, nH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(n.id, nx + 8, startY + 22);

          ctx.font = OS.font(9, 'sans', 700);
          ctx.fillStyle = isLeader ? OS.C.green : isDead ? OS.C.rose : OS.C.muted;
          ctx.fillText(n.role, nx + 8, startY + 44);

          ctx.font = OS.font(8, 'mono', 400);
          ctx.fillStyle = OS.C.faint;
          ctx.fillText(`Term: ${n.term}`, nx + 8, startY + 64);
          ctx.fillText(`Log: ${n.logCount}`, nx + 8, startY + 80);
        });

        // Summary
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Safety Rule: Election requires strictly > N/2 votes (minimum 3 votes in a 5-node cluster).', 16, h - 16);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 18. Distributed Transactions: 2PC vs Saga Pattern
   * -------------------------------------------------------------------------- */
  OS.register('twoPhaseCommit', function (host) {
    let mode = 'saga'; // '2pc' vs 'saga'
    let step = 0; // 0=init, 1=step1, 2=step2, 3=failed, 4=compensated
    let txnLog = 'Transaction initialized: [Order -> Payment -> Inventory].';

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Transaction Pattern',
      options: [
        { label: 'Saga (Compensating Actions)', value: 'saga' },
        { label: 'Two-Phase Commit (2PC Locks)', value: '2pc' }
      ],
      value: mode,
      onChange: (v) => { mode = v; step = 0; txnLog = `Switched to ${v.toUpperCase()}.`; render(); }
    });

    OS.button(controls, 'Step Forward ➔', () => {
      if (mode === 'saga') {
        if (step === 0) { step = 1; txnLog = 'Step 1: OrderService created Order (PENDING).'; }
        else if (step === 1) { step = 2; txnLog = 'Step 2: PaymentService failed: Insufficient Funds!'; }
        else if (step === 2) { step = 3; txnLog = '🛡️ COMPENSATING ACTION: OrderService marks Order CANCELLED.'; }
      } else {
        if (step === 0) { step = 1; txnLog = '2PC Phase 1 (Prepare): Coordinator acquires locks on all participants.'; }
        else if (step === 1) { step = 2; txnLog = '2PC Phase 2 (Commit): Coordinator commits global transaction.'; }
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Reset Transaction', () => {
      step = 0;
      txnLog = 'Transaction reset.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Distributed Transactions: ${mode === 'saga' ? 'Saga Orchestrator' : 'Two-Phase Commit (2PC)'}`, 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = txnLog.includes('CANCELLED') ? OS.C.rose : OS.C.accent;
        ctx.fillText(txnLog, 16, 46);

        // Draw participants
        const participants = ['Order Service', 'Payment Gateway', 'Inventory Service'];
        const pW = Math.min(130, (w - 60) / 3);
        const pH = 90;
        const startY = 70;

        participants.forEach((p, idx) => {
          const px = 16 + idx * (pW + 14);

          ctx.fillStyle = OS.rgba(OS.C.surface, 0.9);
          ctx.strokeStyle = OS.C.line;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(px, startY, pW, pH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(p, px + 8, startY + 24);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = OS.C.muted;
          if (mode === 'saga') {
            if (idx === 0) ctx.fillText(step >= 3 ? 'Status: CANCELLED' : step >= 1 ? 'Status: PENDING' : 'Status: READY', px + 8, startY + 54);
            if (idx === 1) ctx.fillText(step >= 2 ? 'Status: FAILED (Declined)' : 'Status: READY', px + 8, startY + 54);
            if (idx === 2) ctx.fillText('Status: SKIPPED', px + 8, startY + 54);
          } else {
            ctx.fillText(step >= 2 ? 'Phase 2: COMMITTED' : step >= 1 ? 'Phase 1: LOCKED' : 'Status: IDLE', px + 8, startY + 54);
          }
        });

        // Summary
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('2PC holds blocking row locks causing low throughput; Sagas rely on asynchronous compensating actions.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 19. Message Queues & Event Streaming: Kafka Internals
   * -------------------------------------------------------------------------- */
  OS.register('kafkaStreaming', function (host) {
    let partitions = [
      { id: 'P0', log: ['Msg_0', 'Msg_3'], offset: 2 },
      { id: 'P1', log: ['Msg_1', 'Msg_4'], offset: 2 },
      { id: 'P2', log: ['Msg_2'], offset: 1 }
    ];
    let consumers = ['Consumer-A', 'Consumer-B'];
    let streamLog = 'Kafka Topic "orders-log" with 3 partitions and 2 consumers.';

    const controls = OS.controls(host);
    OS.button(controls, 'Produce Message', () => {
      const randP = Math.floor(Math.random() * 3);
      const nextId = `Msg_${Date.now().toString().slice(-3)}`;
      partitions[randP].log.push(nextId);
      partitions[randP].offset++;
      streamLog = `PRODUCED: Appended [${nextId}] to Partition #${randP} (Offset ${partitions[randP].offset})`;
      render();
    }, { primary: true });

    OS.button(controls, 'Add Consumer-C (Rebalance)', () => {
      if (!consumers.includes('Consumer-C')) {
        consumers.push('Consumer-C');
        streamLog = 'REBALANCE: Consumer group rebalanced! Each consumer now owns exactly 1 partition.';
      }
      render();
    });

    OS.button(controls, 'Remove Consumer-C', () => {
      consumers = consumers.filter(c => c !== 'Consumer-C');
      streamLog = 'REBALANCE: Consumer-C departed; remaining consumers re-assigned partitions.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Kafka Commit Log: Partitions & Consumer Group Offsets', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = streamLog.includes('REBALANCE') ? OS.C.amber : OS.C.muted;
        ctx.fillText(streamLog, 16, 46);

        // Draw Partitions
        const pW = Math.max(260, w - 32);
        const rowH = 36;
        const startY = 65;

        partitions.forEach((p, idx) => {
          const py = startY + idx * (rowH + 10);

          ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
          ctx.strokeStyle = OS.C.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(16, py, 90, rowH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(`Part ${p.id}`, 24, py + 22);

          // Log offsets
          const logX = 115;
          p.log.slice(-4).forEach((msg, mIdx) => {
            const mx = logX + mIdx * 65;
            if (mx + 60 < w - 16) {
              ctx.fillStyle = OS.C.surface;
              ctx.strokeStyle = OS.C.line;
              ctx.beginPath();
              ctx.roundRect(mx, py + 2, 58, rowH - 4, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = OS.C.ink;
              ctx.font = OS.font(9, 'mono', 500);
              ctx.fillText(msg, mx + 6, py + 22);
            }
          });
        });

        // Consumer group assignment
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Active Consumer Group (${consumers.length} instances): ${consumers.join(', ')}`, 16, h - 16);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 20. Distributed Locking: Redlock vs ZooKeeper / etcd Leases
   * -------------------------------------------------------------------------- */
  OS.register('distributedLock', function (host) {
    let lockHolder = 'Client-1';
    let fencingToken = 42;
    let leaseRemainingSec = 8;
    let lockStatus = 'Client-1 holds lock with Fencing Token #42 (Lease TTL 8s)';

    const controls = OS.controls(host);
    OS.button(controls, 'Acquire Lock (Client-2)', () => {
      fencingToken++;
      lockHolder = 'Client-2';
      leaseRemainingSec = 10;
      lockStatus = `Client-2 acquired lock! Monotonic Fencing Token #${fencingToken} issued.`;
      render();
    }, { primary: true });

    OS.button(controls, 'Simulate Client GC Pause', () => {
      leaseRemainingSec = 0;
      lockStatus = '⚠️ GC PAUSE: Client-1 lease expired during GC pause! Lock safely released.';
      render();
    });

    OS.button(controls, 'Storage Reject Old Token #42', () => {
      lockStatus = `🛡️ FENCING REJECT: Storage server rejected write from token #42 (Current token is #${fencingToken})!`;
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Distributed Lock with Fencing Tokens (Martin Kleppmann Safety Guard)', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = lockStatus.includes('REJECT') ? OS.C.rose : lockStatus.includes('PAUSE') ? OS.C.amber : OS.C.green;
        ctx.fillText(lockStatus, 16, 46);

        // Lock Coordinator box
        const boxX = 20;
        const boxY = 70;
        const boxW = Math.max(260, w - 40);
        const boxH = 95;

        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(12, 'mono', 600);
        ctx.fillText(`Lock Service (etcd / Raft Lease)`, boxX + 16, boxY + 28);

        ctx.font = OS.font(11, 'mono', 500);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(`Current Holder: ${lockHolder}  |  Fencing Token: ${fencingToken}  |  TTL: ${leaseRemainingSec}s`, boxX + 16, boxY + 54);

        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Without monotonic fencing tokens, a client delayed by a GC pause can corrupt shared storage.', boxX + 16, boxY + 78);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 21. Eventual Consistency & Conflict Resolution: CRDTs
   * -------------------------------------------------------------------------- */
  OS.register('crdtSync', function (host) {
    let replicaA = { counter: 4, label: 'Replica A (US-East)' };
    let replicaB = { counter: 2, label: 'Replica B (EU-West)' };
    let crdtMsg = 'Replicas disconnected: Local edits happen without coordination.';

    const controls = OS.controls(host);
    OS.button(controls, 'Increment Replica A (+1)', () => {
      replicaA.counter++;
      crdtMsg = `Replica A local increment -> ${replicaA.counter}`;
      render();
    }, { primary: true });

    OS.button(controls, 'Increment Replica B (+2)', () => {
      replicaB.counter += 2;
      crdtMsg = `Replica B local increment -> ${replicaB.counter}`;
      render();
    });

    OS.button(controls, 'Sync / Merge CRDTs', () => {
      const merged = Math.max(replicaA.counter, replicaB.counter) + 1;
      replicaA.counter = merged;
      replicaB.counter = merged;
      crdtMsg = `⚡ MERGED: State-based PN-Counter deterministically converged to [${merged}]!`;
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Conflict-Free Replicated Data Types (CRDT): PN-Counter Convergence', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = crdtMsg.includes('MERGED') ? OS.C.green : OS.C.muted;
        ctx.fillText(crdtMsg, 16, 46);

        // Draw 2 Replicas
        const colW = Math.min(180, (w - 60) / 2);
        const yTop = 70;
        const boxH = 90;

        // Replica A
        ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
        ctx.strokeStyle = OS.C.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, yTop, colW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText(replicaA.label, 26, yTop + 24);
        ctx.font = OS.font(16, 'display', 700);
        ctx.fillStyle = OS.C.accent;
        ctx.fillText(`Value: ${replicaA.counter}`, 26, yTop + 56);

        // Replica B
        const bX = colW + 32;
        ctx.fillStyle = OS.rgba(OS.C.teal, 0.12);
        ctx.strokeStyle = OS.C.teal;
        ctx.beginPath();
        ctx.roundRect(bX, yTop, colW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText(replicaB.label, bX + 12, yTop + 24);
        ctx.font = OS.font(16, 'display', 700);
        ctx.fillStyle = OS.C.teal;
        ctx.fillText(`Value: ${replicaB.counter}`, bX + 12, yTop + 56);

        // Summary
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('CRDTs guarantee strong eventual consistency through commutative, associative merge joins.', 16, h - 14);
      }
    });

    function render() { cv.redraw(); }
  });

})();
