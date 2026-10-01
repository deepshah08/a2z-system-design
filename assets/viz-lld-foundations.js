/* ==========================================================================
   System Design, Component by Component — Low-Level Design & Concurrency
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. SOLID Principle Refactoring Engine
   * -------------------------------------------------------------------------- */
  OS.register('solidPrinciples', function (host) {
    let mode = 'violation'; // 'violation' or 'refactored'
    let selectedPrinciple = 'DIP'; // SRP, OCP, LSP, ISP, DIP

    const principles = [
      { key: 'DIP', name: 'Dependency Inversion', bad: 'OrderService ──► MySQLDatabase (Hardcoded Direct Dep)', good: 'OrderService ──► «interface» IDatabase ◄── MySQLDatabase / MockDB' },
      { key: 'SRP', name: 'Single Responsibility', bad: 'UserManager (Auth + DB + Email + Log)', good: 'UserManager + EmailService + UserRepo + Logger' },
      { key: 'OCP', name: 'Open-Closed', bad: 'PaymentProcessor with switch(type) { if Paypal... }', good: 'PaymentProcessor ──► PaymentStrategy (Add ApplePay without edit)' },
      { key: 'LSP', name: 'Liskov Substitution', bad: 'Square extends Rectangle (Breaks setWidth/setHeight)', good: 'Shape interface with getArea() implemented by both' },
      { key: 'ISP', name: 'Interface Segregation', bad: 'WorkerInterface { work(), eat(), sleep() }', good: 'Workable { work() } + Feedable { eat() }' }
    ];

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Design Architecture',
      options: [
        { label: 'Violated (Tightly Coupled)', value: 'violation' },
        { label: 'Refactored (Clean Architecture)', value: 'refactored' }
      ],
      value: mode,
      onChange: (v) => { mode = v; render(); }
    });

    OS.segmented(controls, {
      label: 'Principle',
      options: principles.map(p => ({ label: p.key, value: p.key })),
      value: selectedPrinciple,
      onChange: (v) => { selectedPrinciple = v; render(); }
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
        const p = principles.find(item => item.key === selectedPrinciple) || principles[0];

        // Header info
        ctx.font = OS.font(14, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`${p.key}: ${p.name}`, 16, 26);

        ctx.font = OS.font(12, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        const desc = mode === 'violation' ? 'Monolithic, rigid, untestable direct coupling' : 'Decoupled, polymorphic, dependency injection enabled';
        ctx.fillText(desc, 16, 46);

        const cardY = 65;
        const cardH = 145;
        const cardW = Math.max(260, w - 32);

        // Draw architecture card
        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = mode === 'violation' ? OS.rgba(OS.C.rose, 0.4) : OS.rgba(OS.C.green, 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        if (mode === 'violation') {
          // Bad Architecture Diagram
          const bW = Math.min(180, (cardW - 60) / 2);
          const bH = 65;
          const yPos = cardY + 35;

          // Box 1 (High-level)
          ctx.fillStyle = OS.rgba(OS.C.rose, 0.12);
          ctx.strokeStyle = OS.C.rose;
          ctx.beginPath();
          ctx.roundRect(32, yPos, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(12, 'mono', 600);
          ctx.fillText('Client / Consumer', 42, yPos + 24);
          ctx.font = OS.font(10, 'sans', 400);
          ctx.fillStyle = OS.C.rose;
          ctx.fillText('Tight Concrete Import', 42, yPos + 44);

          // Arrow with cross
          const arrowStartX = 32 + bW + 4;
          const arrowEndX = cardW - bW + 4;
          const midX = (arrowStartX + arrowEndX) / 2;

          ctx.strokeStyle = OS.C.rose;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, yPos + bH / 2);
          ctx.lineTo(arrowEndX, yPos + bH / 2);
          ctx.stroke();

          // Arrow head
          ctx.beginPath();
          ctx.moveTo(arrowEndX, yPos + bH / 2);
          ctx.lineTo(arrowEndX - 6, yPos + bH / 2 - 4);
          ctx.lineTo(arrowEndX - 6, yPos + bH / 2 + 4);
          if (ctx.closePath) ctx.closePath();
          ctx.fillStyle = OS.C.rose;
          ctx.fill();

          ctx.fillStyle = OS.C.rose;
          ctx.font = OS.font(10, 'display', 700);
          ctx.fillText('HARD DEPENDENCY', Math.max(32 + bW, midX - 50), yPos + bH / 2 - 10);

          // Box 2 (Low-level)
          ctx.fillStyle = OS.rgba(OS.C.rose, 0.12);
          ctx.strokeStyle = OS.C.rose;
          ctx.beginPath();
          ctx.roundRect(cardW - bW + 16, yPos, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(12, 'mono', 600);
          ctx.fillText('Concrete Implementation', cardW - bW + 24, yPos + 24);
          ctx.font = OS.font(10, 'sans', 400);
          ctx.fillStyle = OS.C.muted;
          ctx.fillText('No Mocking / Zero Flex', cardW - bW + 24, yPos + 44);

          // Text summary
          ctx.font = OS.font(11, 'mono', 400);
          ctx.fillStyle = OS.C.muted;
          ctx.fillText(`Anti-Pattern: ${p.bad}`, 28, cardY + cardH - 14);

        } else {
          // Refactored Architecture Diagram
          const bW = Math.min(130, (cardW - 80) / 3);
          const bH = 65;
          const yPos = cardY + 35;

          // Box 1 (High-level)
          const x1 = 28;
          ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
          ctx.strokeStyle = OS.C.accent;
          ctx.beginPath();
          ctx.roundRect(x1, yPos, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText('High-Level Core', x1 + 8, yPos + 24);
          ctx.font = OS.font(10, 'sans', 400);
          ctx.fillStyle = OS.C.accent;
          ctx.fillText('Domain Logic', x1 + 8, yPos + 44);

          // Box 2 (Interface)
          const x2 = x1 + bW + (cardW - 3 * bW - 40) / 2;
          ctx.fillStyle = OS.rgba(OS.C.violet, 0.12);
          ctx.strokeStyle = OS.C.violet;
          ctx.beginPath();
          ctx.roundRect(x2, yPos, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText('«interface»', x2 + 10, yPos + 22);
          ctx.fillStyle = OS.C.violet;
          ctx.fillText('Contract / Port', x2 + 10, yPos + 42);

          // Box 3 (Implementations)
          const x3 = cardW - bW + 16;
          ctx.fillStyle = OS.rgba(OS.C.green, 0.12);
          ctx.strokeStyle = OS.C.green;
          ctx.beginPath();
          ctx.roundRect(x3, yPos, bW, bH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText('Adapter / Impl', x3 + 8, yPos + 24);
          ctx.font = OS.font(10, 'sans', 400);
          ctx.fillStyle = OS.C.green;
          ctx.fillText('ProdDB / MockDB', x3 + 8, yPos + 44);

          // Arrow 1 -> 2
          ctx.strokeStyle = OS.C.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1 + bW, yPos + bH / 2);
          ctx.lineTo(x2, yPos + bH / 2);
          ctx.stroke();

          // Arrow 3 -> 2 (Inversion)
          ctx.strokeStyle = OS.C.green;
          ctx.beginPath();
          ctx.moveTo(x3, yPos + bH / 2);
          ctx.lineTo(x2 + bW, yPos + bH / 2);
          ctx.stroke();

          ctx.fillStyle = OS.C.muted;
          ctx.font = OS.font(11, 'mono', 400);
          ctx.fillText(`Clean Pattern: ${p.good}`, 28, cardY + cardH - 14);
        }
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 2. Observer & Pub/Sub Event Dispatcher
   * -------------------------------------------------------------------------- */
  OS.register('observerPattern', function (host) {
    let subscribers = [
      { id: 'EmailService', active: true, events: [] },
      { id: 'PushNotifier', active: true, events: [] },
      { id: 'AnalyticsLogger', active: true, events: [] },
      { id: 'InventorySync', active: false, events: [] }
    ];
    let eventLog = ['System initialized: Event broker ready'];
    let eventCounter = 101;

    const controls = OS.controls(host);
    OS.button(controls, 'Emit OrderPlaced Event', () => {
      const evt = `Order#${eventCounter++}`;
      eventLog.unshift(`[Broker] Dispatched: ${evt}`);
      subscribers.forEach(s => {
        if (s.active) {
          s.events.unshift(evt);
          if (s.events.length > 3) s.events.pop();
        }
      });
      if (eventLog.length > 5) eventLog.pop();
      render();
    }, { primary: true });

    OS.button(controls, 'Toggle Inventory Subscriber', () => {
      const inv = subscribers.find(s => s.id === 'InventorySync');
      if (inv) inv.active = !inv.active;
      render();
    });

    OS.button(controls, 'Clear History', () => {
      eventLog = ['Event history cleared.'];
      subscribers.forEach(s => s.events = []);
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        // Subject / Broker Box
        const brokerW = Math.min(160, w * 0.3);
        const brokerX = 16;
        const brokerY = 30;
        const brokerH = 140;

        ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
        ctx.strokeStyle = OS.C.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(brokerX, brokerY, brokerW, brokerH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(13, 'display', 600);
        ctx.fillText('Event Broker', brokerX + 12, brokerY + 24);
        ctx.font = OS.font(10, 'sans', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText('Publisher Subject', brokerX + 12, brokerY + 40);

        // Recent event in Broker
        ctx.font = OS.font(10, 'mono', 400);
        ctx.fillStyle = OS.C.accent;
        const lastEvt = eventLog[0] || 'Idle';
        ctx.fillText(lastEvt.slice(0, 18), brokerX + 12, brokerY + 70);

        // Subscribers Column
        const subX = Math.max(brokerX + brokerW + 60, w - Math.min(220, w * 0.45));
        const subW = Math.min(200, w - subX - 16);
        const subH = 34;

        subscribers.forEach((s, idx) => {
          const sy = brokerY + idx * (subH + 6);

          ctx.fillStyle = s.active ? OS.rgba(OS.C.teal, 0.12) : OS.rgba(OS.C.faint, 0.08);
          ctx.strokeStyle = s.active ? OS.C.teal : OS.C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(subX, sy, subW, subH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = s.active ? OS.C.ink : OS.C.faint;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(s.id, subX + 8, sy + 18);

          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = s.active ? OS.C.teal : OS.C.rose;
          ctx.fillText(s.active ? `Recv: ${s.events[0] || 'Waiting'}` : 'Detached / Offline', subX + 8, sy + 30);

          // Connection Arrow
          ctx.strokeStyle = s.active ? OS.C.teal : OS.rgba(OS.C.line, 0.5);
          ctx.lineWidth = s.active ? 1.5 : 1;
          ctx.setLineDash(s.active ? [] : [3, 3]);
          ctx.beginPath();
          ctx.moveTo(brokerX + brokerW, brokerY + brokerH / 2);
          ctx.lineTo(subX, sy + subH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Bottom log readout
        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(`Event Log: ${eventLog.slice(0, 2).join('  |  ')}`, 16, h - 16);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 3. In-Memory Cache Design: LRU & LFU Mechanics
   * -------------------------------------------------------------------------- */
  OS.register('lruCache', function (host) {
    const CAPACITY = 4;
    let cacheMap = new Map(); // key -> value
    let dll = []; // [MRU ... LRU]
    let hitMissLog = 'Cache empty (Capacity = 4)';
    let cv = null;

    function render() {
      if (cv && cv.redraw) cv.redraw();
    }

    function put(k, v) {
      if (cacheMap.has(k)) {
        // Update & Promote to head
        dll = [k, ...dll.filter(x => x !== k)];
        cacheMap.set(k, v);
        hitMissLog = `UPDATE: Key "${k}" refreshed -> Promoted to MRU Head`;
      } else {
        if (dll.length >= CAPACITY) {
          const evicted = dll.pop();
          cacheMap.delete(evicted);
          hitMissLog = `EVICT: Tail key "${evicted}" evicted (Capacity reached) -> Added "${k}"`;
        } else {
          hitMissLog = `PUT: Added "${k}" to MRU Head`;
        }
        dll = [k, ...dll];
        cacheMap.set(k, v);
      }
      render();
    }

    function get(k) {
      if (cacheMap.has(k)) {
        dll = [k, ...dll.filter(x => x !== k)];
        hitMissLog = `CACHE HIT: "${k}" accessed -> Moved to MRU Head`;
      } else {
        hitMissLog = `CACHE MISS: "${k}" not present in cache`;
      }
      render();
    }

    // Seed initial entries
    put('A', 'Payload_A');
    put('B', 'Payload_B');
    put('C', 'Payload_C');

    const controls = OS.controls(host);
    OS.button(controls, 'Get("B") [Hit]', () => get('B'));
    OS.button(controls, 'Get("Z") [Miss]', () => get('Z'));
    OS.button(controls, 'Put("D") [Fill]', () => put('D', 'Payload_D'));
    OS.button(controls, 'Put("E") [Trigger Eviction]', () => put('E', 'Payload_E'), { primary: true });
    OS.button(controls, 'Reset', () => {
      cacheMap.clear();
      dll = [];
      put('A', 'Payload_A');
      put('B', 'Payload_B');
      put('C', 'Payload_C');
    });

    cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Doubly Linked List (MRU ◄──► LRU) + Hash Table Index', 16, 24);

        // Status banner
        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = hitMissLog.includes('HIT') ? OS.C.green : hitMissLog.includes('EVICT') ? OS.C.rose : OS.C.accent;
        ctx.fillText(hitMissLog, 16, 46);

        // Draw Nodes
        const startX = 24;
        const nodeW = Math.min(85, (w - 80) / CAPACITY);
        const nodeH = 75;
        const nodeY = 70;

        for (let i = 0; i < CAPACITY; i++) {
          const k = dll[i];
          const nx = startX + i * (nodeW + 30);

          if (k) {
            ctx.fillStyle = i === 0 ? OS.rgba(OS.C.green, 0.15) : i === CAPACITY - 1 ? OS.rgba(OS.C.rose, 0.15) : OS.rgba(OS.C.accent, 0.12);
            ctx.strokeStyle = i === 0 ? OS.C.green : i === CAPACITY - 1 ? OS.C.rose : OS.C.accent;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(nx, nodeY, nodeW, nodeH, 8);
            ctx.fill();
            ctx.stroke();

            // Label
            ctx.fillStyle = OS.C.ink;
            ctx.font = OS.font(14, 'mono', 700);
            ctx.fillText(`Key: ${k}`, nx + 12, nodeY + 28);

            ctx.font = OS.font(10, 'sans', 400);
            ctx.fillStyle = OS.C.muted;
            ctx.fillText(i === 0 ? 'MRU Head' : i === dll.length - 1 ? 'LRU Tail' : `Node #${i + 1}`, nx + 12, nodeY + 48);

            ctx.fillStyle = OS.C.faint;
            ctx.font = OS.font(9, 'mono', 400);
            ctx.fillText(cacheMap.get(k) || '', nx + 12, nodeY + 64);
          } else {
            // Empty slot
            ctx.fillStyle = OS.rgba(OS.C.line, 0.2);
            ctx.strokeStyle = OS.C.line;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.roundRect(nx, nodeY, nodeW, nodeH, 8);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = OS.C.faint;
            ctx.font = OS.font(11, 'sans', 400);
            ctx.fillText('[Empty Slot]', nx + 12, nodeY + 42);
          }

          // Double arrow between nodes
          if (i < CAPACITY - 1) {
            const arrowX = nx + nodeW + 4;
            ctx.strokeStyle = OS.C.muted;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(arrowX, nodeY + 30);
            ctx.lineTo(arrowX + 22, nodeY + 30);
            ctx.moveTo(arrowX + 22, nodeY + 45);
            ctx.lineTo(arrowX, nodeY + 45);
            ctx.stroke();
          }
        }

        // Hash Map representation at bottom
        const bottomY = nodeY + nodeH + 30;
        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(16, bottomY, w - 32, 40, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 500);
        ctx.fillStyle = OS.C.ink;
        const mapKeys = Array.from(cacheMap.keys()).map(k => `"${k}": &Node_${k}`).join('  |  ');
        ctx.fillText(`HashMap Pointer Table: { ${mapKeys || 'empty'} }`, 28, bottomY + 24);
      }
    });
  });

  /* --------------------------------------------------------------------------
   * 4. Concurrency: Lock-Free Atomic Ring Buffer vs Mutex Contention
   * -------------------------------------------------------------------------- */
  OS.register('casRingBuffer', function (host) {
    const SIZE = 8;
    let buffer = new Array(SIZE).fill(null);
    let head = 0; // write
    let tail = 0; // read
    let contentionCount = 0;
    let mode = 'lockfree'; // 'lockfree' vs 'mutex'
    let lockAcquired = false;

    const controls = OS.controls(host);
    OS.segmented(controls, {
      label: 'Concurrency Primitive',
      options: [
        { label: 'Lock-Free (Atomic CAS)', value: 'lockfree' },
        { label: 'Pthread Mutex Lock', value: 'mutex' }
      ],
      value: mode,
      onChange: (v) => { mode = v; render(); }
    });

    OS.button(controls, 'Atomic Produce (CAS)', () => {
      const nextHead = (head + 1) % SIZE;
      if (nextHead === tail) {
        contentionCount++;
      } else {
        buffer[head] = Math.floor(Math.random() * 90 + 10);
        head = nextHead;
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Atomic Consume', () => {
      if (head !== tail) {
        buffer[tail] = null;
        tail = (tail + 1) % SIZE;
      }
      render();
    });

    OS.button(controls, 'Simulate Thread Collision', () => {
      contentionCount += Math.floor(Math.random() * 3 + 1);
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Ring Buffer (Size: ${SIZE}) — ${mode === 'lockfree' ? 'CAS Atomic Pointers' : 'Mutex Guarded Critical Section'}`, 16, 24);

        // Slot drawing
        const slotW = Math.min(50, (w - 60) / SIZE);
        const slotH = 50;
        const startX = 24;
        const startY = 60;

        for (let i = 0; i < SIZE; i++) {
          const sx = startX + i * (slotW + 6);
          const hasData = buffer[i] !== null;

          ctx.fillStyle = hasData ? OS.rgba(OS.C.accent, 0.2) : OS.rgba(OS.C.surface, 0.8);
          ctx.strokeStyle = i === head ? OS.C.green : i === tail ? OS.C.amber : OS.C.line;
          ctx.lineWidth = (i === head || i === tail) ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(sx, startY, slotW, slotH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(12, 'mono', 600);
          ctx.fillText(hasData ? String(buffer[i]) : '·', sx + slotW / 2 - 6, startY + 28);

          // Head / Tail markers
          if (i === head) {
            ctx.fillStyle = OS.C.green;
            ctx.font = OS.font(10, 'display', 700);
            ctx.fillText('HEAD', sx + slotW / 2 - 14, startY - 8);
          }
          if (i === tail) {
            ctx.fillStyle = OS.C.amber;
            ctx.font = OS.font(10, 'display', 700);
            ctx.fillText('TAIL', sx + slotW / 2 - 12, startY + slotH + 18);
          }
        }

        // Metrics box
        const my = startY + slotH + 35;
        ctx.fillStyle = OS.C.surface;
        ctx.strokeStyle = OS.C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(16, my, w - 32, 60, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = OS.font(11, 'mono', 500);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText(`Write Head: ${head}  |  Read Tail: ${tail}  |  Occupancy: ${buffer.filter(x => x !== null).length} / ${SIZE}`, 28, my + 24);

        ctx.font = OS.font(11, 'sans', 400);
        ctx.fillStyle = contentionCount > 0 ? OS.C.rose : OS.C.muted;
        const msg = mode === 'lockfree'
          ? `Lock-Free CAS Retry Events: ${contentionCount} (Zero Kernel Context Switch Overhead)`
          : `Mutex Lock Contention Events: ${contentionCount} (Futex wait / Sleep & Wake Cycles)`;
        ctx.fillText(msg, 28, my + 44);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 5. Thread Pools & Work-Stealing Schedulers
   * -------------------------------------------------------------------------- */
  OS.register('threadPool', function (host) {
    let workers = [
      { id: 'Worker-1', deque: ['Task#1', 'Task#2', 'Task#3'], busy: true },
      { id: 'Worker-2', deque: ['Task#4'], busy: true },
      { id: 'Worker-3', deque: [], busy: false },
      { id: 'Worker-4', deque: [], busy: false }
    ];
    let taskCounter = 5;
    let stealLog = 'All threads initialized.';

    const controls = OS.controls(host);
    OS.button(controls, 'Enqueue Burst Tasks', () => {
      workers[0].deque.push(`Task#${taskCounter++}`);
      workers[0].deque.push(`Task#${taskCounter++}`);
      workers[0].busy = true;
      stealLog = 'Burst added to Worker-1 queue.';
      render();
    }, { primary: true });

    OS.button(controls, 'Work-Steal Step', () => {
      // Find idle worker and busy worker with > 1 task
      const idle = workers.find(w => w.deque.length === 0);
      const busy = workers.find(w => w.deque.length > 1);

      if (idle && busy) {
        // Steal from tail of busy worker's deque
        const stolen = busy.deque.pop();
        idle.deque.push(stolen);
        idle.busy = true;
        stealLog = `⚡ WORK STEAL: ${idle.id} stole [${stolen}] from tail of ${busy.id}!`;
      } else {
        // Process one task from each busy worker
        workers.forEach(w => {
          if (w.deque.length > 0) {
            const finished = w.deque.shift();
            stealLog = `Processed ${finished} on ${w.id}.`;
          }
          w.busy = w.deque.length > 0;
        });
      }
      render();
    });

    OS.button(controls, 'Drain All Tasks', () => {
      workers.forEach(w => { w.deque = []; w.busy = false; });
      stealLog = 'All work deques drained.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('ForkJoin Multi-Worker Thread Pool (Work-Stealing Deques)', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = stealLog.includes('STEAL') ? OS.C.amber : OS.C.muted;
        ctx.fillText(stealLog, 16, 44);

        const rowH = 34;
        const startY = 60;
        const colW = Math.max(260, w - 32);

        workers.forEach((worker, idx) => {
          const y = startY + idx * (rowH + 8);

          // Worker label box
          ctx.fillStyle = worker.busy ? OS.rgba(OS.C.teal, 0.15) : OS.rgba(OS.C.faint, 0.08);
          ctx.strokeStyle = worker.busy ? OS.C.teal : OS.C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(16, y, 110, rowH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(11, 'mono', 600);
          ctx.fillText(worker.id, 24, y + 18);
          ctx.font = OS.font(9, 'sans', 400);
          ctx.fillStyle = worker.busy ? OS.C.green : OS.C.faint;
          ctx.fillText(worker.busy ? 'ACTIVE / RUNNING' : 'IDLE (Stealing)', 24, y + 30);

          // Worker Deque items
          const dequeX = 136;
          const items = worker.deque;
          if (items.length === 0) {
            ctx.fillStyle = OS.C.faint;
            ctx.font = OS.font(11, 'sans', 400);
            ctx.fillText('— Deque empty —', dequeX, y + 22);
          } else {
            items.forEach((item, tIdx) => {
              const itemX = dequeX + tIdx * 70;
              if (itemX + 65 < w - 16) {
                ctx.fillStyle = tIdx === 0 ? OS.rgba(OS.C.accent, 0.2) : OS.rgba(OS.C.surface, 0.9);
                ctx.strokeStyle = tIdx === 0 ? OS.C.accent : OS.C.line;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(itemX, y + 4, 60, rowH - 8, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = OS.C.ink;
                ctx.font = OS.font(10, 'mono', 600);
                ctx.fillText(item, itemX + 8, y + 22);
              }
            });
          }
        });
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 6. Finite State Machines & The State Pattern
   * -------------------------------------------------------------------------- */
  OS.register('stateMachine', function (host) {
    const states = ['CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    let currentState = 'CREATED';
    let lastTransitionLog = 'Order initiated in CREATED state.';

    const validTransitions = {
      CREATED: ['PAID', 'CANCELLED'],
      PAID: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: []
    };

    function attemptTransition(target) {
      const allowed = validTransitions[currentState] || [];
      if (allowed.includes(target)) {
        currentState = target;
        lastTransitionLog = `SUCCESS: Transitioned [${currentState}] ➔ [${target}]`;
      } else {
        lastTransitionLog = `GUARD REJECTED: Illegal transition from [${currentState}] ➔ [${target}]!`;
      }
      render();
    }

    const controls = OS.controls(host);
    OS.button(controls, 'Pay Order ➔', () => attemptTransition('PAID'), { primary: true });
    OS.button(controls, 'Ship Order ➔', () => attemptTransition('SHIPPED'));
    OS.button(controls, 'Mark Delivered ➔', () => attemptTransition('DELIVERED'));
    OS.button(controls, 'Cancel Order ➔', () => attemptTransition('CANCELLED'));
    OS.button(controls, 'Reset Order', () => {
      currentState = 'CREATED';
      lastTransitionLog = 'Order reset to CREATED state.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 230,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('Order Lifecycle Finite State Machine (Guarded Transitions)', 16, 24);

        // Feedback log
        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = lastTransitionLog.includes('REJECTED') ? OS.C.rose : OS.C.green;
        ctx.fillText(lastTransitionLog, 16, 44);

        // State nodes along a horizontal / wrapped path
        const nodeW = Math.min(85, (w - 70) / 4);
        const nodeH = 50;
        const startY = 75;

        const mainFlow = ['CREATED', 'PAID', 'SHIPPED', 'DELIVERED'];
        mainFlow.forEach((st, idx) => {
          const x = 20 + idx * (nodeW + 20);
          const isActive = currentState === st;

          ctx.fillStyle = isActive ? OS.rgba(OS.C.accent, 0.25) : OS.rgba(OS.C.surface, 0.8);
          ctx.strokeStyle = isActive ? OS.C.accent : OS.C.line;
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(x, startY, nodeW, nodeH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = OS.C.ink;
          ctx.font = OS.font(10, 'mono', 600);
          ctx.fillText(st, x + 10, startY + 28);

          if (idx < mainFlow.length - 1) {
            // Forward arrow
            const ax = x + nodeW + 4;
            ctx.strokeStyle = OS.C.muted;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(ax, startY + nodeH / 2);
            ctx.lineTo(ax + 12, startY + nodeH / 2);
            ctx.stroke();
          }
        });

        // Cancelled terminal branch
        const cancelX = 20 + (nodeW + 20) / 2;
        const cancelY = startY + nodeH + 30;
        const isCancelled = currentState === 'CANCELLED';

        ctx.fillStyle = isCancelled ? OS.rgba(OS.C.rose, 0.25) : OS.rgba(OS.C.surface, 0.8);
        ctx.strokeStyle = isCancelled ? OS.C.rose : OS.C.line;
        ctx.lineWidth = isCancelled ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(cancelX, cancelY, nodeW * 1.5, nodeH - 10, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCancelled ? OS.C.rose : OS.C.ink;
        ctx.font = OS.font(10, 'mono', 600);
        ctx.fillText('CANCELLED (Terminal)', cancelX + 12, cancelY + 25);
      }
    });

    function render() { cv.redraw(); }
  });

  /* --------------------------------------------------------------------------
   * 7. Low-Level Storage Engines: B+ Tree vs LSM-Tree
   * -------------------------------------------------------------------------- */
  OS.register('lsmTree', function (host) {
    let memTable = ['user:101', 'user:104'];
    let walLog = ['SET user:101', 'SET user:104'];
    let sstablesL0 = [['user:090', 'user:099'], ['user:100', 'user:105']];
    let statusMsg = 'MemTable accepts fast sequential in-memory writes.';

    const controls = OS.controls(host);
    OS.button(controls, 'Write Key (Append WAL + MemTable)', () => {
      const nextId = Math.floor(Math.random() * 80 + 110);
      const key = `user:${nextId}`;
      walLog.push(`SET ${key}`);
      memTable.push(key);
      memTable.sort();
      statusMsg = `Wrote [${key}] to Append-Only WAL + Red-Black MemTable.`;
      if (memTable.length >= 4) {
        statusMsg += ' MemTable full! Flushing to L0 SSTable...';
        sstablesL0.unshift([...memTable]);
        memTable = [];
      }
      render();
    }, { primary: true });

    OS.button(controls, 'Trigger L0 Merge Compaction', () => {
      if (sstablesL0.length > 1) {
        const merged = Array.from(new Set(sstablesL0.flat())).sort();
        sstablesL0 = [merged.slice(0, 4)];
        statusMsg = 'COMPACTION: Leveled SSTables merged & tombstones pruned.';
      } else {
        statusMsg = 'L0 compaction already clean.';
      }
      render();
    });

    OS.button(controls, 'Reset Storage Engine', () => {
      memTable = ['user:101', 'user:104'];
      walLog = ['SET user:101', 'SET user:104'];
      sstablesL0 = [['user:090', 'user:099']];
      statusMsg = 'Storage engine reset to clean state.';
      render();
    });

    const cv = OS.canvas(host, {
      height: 240,
      render: function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        ctx.font = OS.font(13, 'display', 600);
        ctx.fillStyle = OS.C.ink;
        ctx.fillText('LSM-Tree: Write-Ahead Log (WAL) ➔ MemTable ➔ Disk SSTables', 16, 24);

        ctx.font = OS.font(11, 'mono', 400);
        ctx.fillStyle = statusMsg.includes('COMPACTION') ? OS.C.green : OS.C.muted;
        ctx.fillText(statusMsg, 16, 44);

        // Tier 1: In-Memory (MemTable + WAL)
        const colW = Math.min(180, (w - 60) / 2);
        const yTop = 60;
        const boxH = 65;

        // WAL
        ctx.fillStyle = OS.rgba(OS.C.amber, 0.12);
        ctx.strokeStyle = OS.C.amber;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(16, yTop, colW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Sequential WAL', 26, yTop + 20);
        ctx.font = OS.font(9, 'mono', 400);
        ctx.fillStyle = OS.C.muted;
        ctx.fillText(walLog.slice(-2).join(' | ') || 'WAL empty', 26, yTop + 42);

        // MemTable (RAM)
        const memX = colW + 32;
        ctx.fillStyle = OS.rgba(OS.C.teal, 0.15);
        ctx.strokeStyle = OS.C.teal;
        ctx.beginPath();
        ctx.roundRect(memX, yTop, colW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('In-Memory MemTable', memX + 10, yTop + 20);
        ctx.font = OS.font(9, 'mono', 400);
        ctx.fillStyle = OS.C.teal;
        ctx.fillText(`Keys (${memTable.length}/4): ${memTable.join(', ') || 'Flushed'}`, memX + 10, yTop + 42);

        // Flush Arrow down
        ctx.strokeStyle = OS.C.muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(memX + colW / 2, yTop + boxH);
        ctx.lineTo(memX + colW / 2, yTop + boxH + 20);
        ctx.stroke();

        // Tier 2: Disk SSTables (Level 0)
        const diskY = yTop + boxH + 25;
        const diskW = Math.max(260, w - 32);

        ctx.fillStyle = OS.rgba(OS.C.surface, 0.9);
        ctx.strokeStyle = OS.C.line;
        ctx.beginPath();
        ctx.roundRect(16, diskY, diskW, 65, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = OS.C.ink;
        ctx.font = OS.font(11, 'mono', 600);
        ctx.fillText('Persistent Storage: Level-0 Immutable SSTables (Sorted String Tables)', 28, diskY + 22);

        sstablesL0.forEach((sst, idx) => {
          const sstX = 28 + idx * 125;
          if (sstX + 115 < w - 16) {
            ctx.fillStyle = OS.rgba(OS.C.accent, 0.12);
            ctx.strokeStyle = OS.C.accent;
            ctx.beginPath();
            ctx.roundRect(sstX, diskY + 30, 115, 26, 4);
            ctx.fill();
            ctx.stroke();

            ctx.font = OS.font(9, 'mono', 400);
            ctx.fillStyle = OS.C.ink;
            ctx.fillText(sst.slice(0, 2).join(', '), sstX + 8, diskY + 47);
          }
        });
      }
    });

    function render() { cv.redraw(); }
  });

})();
