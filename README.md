# System Design, Component by Component

> **An Explorable Architectural Guide to Scalable, Fault-Tolerant & Low-Level Systems**  
> Live URL: [https://deepshah08.github.io/a2z-system-design/](https://deepshah08.github.io/a2z-system-design/)

A zero-dependency, pure web standards interactive textbook and visual exploration engine inspired by *LLMs, Token by Token*, *Operating Systems, Cycle by Cycle*, and *Computer Networks, Packet by Packet*.

---

## 📚 Curricular Scope & Foundational Sources

Synthesized from the recognized canon of system design, low-level architecture, and distributed engineering:
- **Martin Kleppmann** — *Designing Data-Intensive Applications (DDIA)*
- **Alex Xu & Sahn Lam** — *System Design Interview (Vols 1 & 2)*
- **Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four)** — *Design Patterns: Elements of Reusable Object-Oriented Software*
- **Robert C. Martin (Uncle Bob)** — *Clean Architecture: A Craftsman's Guide to Software Structure and Design*
- **Daniel Abadi** — *The PACELC Theorem & Consistency Trade-offs*
- **Diego Ongaro & John Ousterhout** — *In Search of an Understandable Consensus Algorithm (Raft)*
- **Modern Cloud Scale Practices (2026)** — eBPF XDP, Kafka Partitioning, RocksDB LSM-Trees, Singleflight Mutexes, Twitter Snowflake IDs, CRDTs, and W3C Distributed Tracing.

---

## 🧩 29 Live Interactive Simulators

### Flagship Hero Arena
- **Hero: Distributed System Capacity & Bottleneck Arena**: Interactive end-to-end pipeline (Clients $\to$ CDN $\to$ Load Balancer $\to$ Redis Cache $\to$ Sharded Database) with dynamic QPS sliders, CDN bypass toggles, cache hit ratios, queue backpressure, and database IOPS saturation meters.

### Part I: Low-Level Design, OOP & Concurrency Foundations (Ch 01–07)
1. **SOLID Principles & Object-Oriented Modeling**: Toggle tight concrete coupling vs interface dependency injection across SRP, OCP, LSP, ISP, and DIP.
2. **Design Patterns in Action (Observer / Pub-Sub)**: Publish domain events to a central broker; dynamically attach and detach subscribers.
3. **In-Memory Cache Design (LRU & LFU Mechanics)**: Step-by-step Hash Map + Doubly Linked List with $\mathcal{O}(1)$ promote and tail eviction.
4. **Concurrency Primitives (Lock-Free CAS Ring Buffer vs Mutex)**: Step atomic Compare-and-Swap (CAS) head/tail pointers on a circular buffer vs mutex lock contention.
5. **Thread Pools & Work-Stealing Schedulers**: Multi-worker thread pool where idle workers steal tasks from the deques of busy threads.
6. **Finite State Machines & The State Pattern**: Guarded order lifecycle state machine (Created $\to$ Paid $\to$ Shipped $\to$ Delivered) rejecting invalid transitions.
7. **Low-Level Storage Engines (LSM-Tree vs B+ Tree)**: Sequential WAL append, in-memory MemTable, immutable Level-0 SSTable flushes, and merge compaction.

### Part II: Scalability & Distributed Infrastructure Primitives (Ch 08–13)
8. **Load Balancing Algorithms & Health Probing**: Round Robin vs Weighted Least Connections with simulated node failure and dynamic health check failovers.
9. **Consistent Hashing & Virtual Nodes**: Hash ring $[0, 2^{32}-1]$ with virtual node replication ($1\times$ vs $3\times$) and key partition migration.
10. **Rate Limiting Algorithms**: Multi-algorithm arena comparing Token Bucket (burst capacity) against Sliding Window Counters.
11. **Distributed Caching & Cache Stampede**: Hot key expiration under 1,000 concurrent reader threads; toggle Singleflight Mutex locks to protect the database.
12. **Distributed Unique ID Generation**: 64-bit Twitter Snowflake ID bit decomposer (Timestamp + Datacenter + Worker + Sequence) with clock backward drift safety.
13. **Probabilistic Data Structures (Bloom Filter)**: Bit array with $k=2$ hash functions demonstrating true positives, true negatives, and false positive edge cases.

### Part III: Data Systems, Consistency & Consensus (Ch 14–21)
14. **CAP & PACELC Theorems**: Trade-off matrix comparing Cassandra, Google Spanner, DynamoDB, and PostgreSQL under network partitions and normal operations.
15. **Database Sharding & Partitioning Strategies**: Direct shard routing via hash keys vs cross-shard scatter-gather queries with router merging.
16. **Replication & Quorum Consensus (Dynamo-Style)**: Leaderless $N=3$ cluster with configurable Read ($R$) and Write ($W$) quorums demonstrating strong consistency ($R+W > N$) vs stale read risks.
17. **Distributed Consensus (The Raft Protocol)**: 5-node cluster simulating leader crashes, randomized election timeouts, candidate term increments, and log replication.
18. **Distributed Transactions (2PC vs Saga Pattern)**: Two-Phase Commit coordinator locking vs Saga orchestrator with automatic compensating transaction rollbacks on payment failure.
19. **Message Queues & Event Streaming (Kafka Internals)**: 3-partition append-only commit log with consumer group offset tracking and dynamic partition rebalancing.
20. **Distributed Locking & Fencing Tokens**: Distributed leases with monotonically increasing fencing tokens ($T, T+1$) preventing stale write storage corruption after GC pauses.
21. **Eventual Consistency & CRDTs**: Multi-replica PN-Counter demonstrating commutative, conflict-free state convergence across disconnected regions.

### Part IV: Real-World Large-Scale Architectural Blueprints (Ch 22–28)
22. **Designing a URL Shortener (TinyURL)**: Base62 7-character hashing, Key Generation Service (KGS) memory pool, Redis cache, and HTTP 301 vs 302 redirect behavior.
23. **Designing a Distributed Web Crawler**: URL Frontier queues, host-specific politeness delay throttling, robots.txt parsing, and Bloom filter duplicate deduplication.
24. **Designing a Real-Time Chat & Notification System**: Distributed WebSocket connection gateways, Redis Pub/Sub room broker, and client heartbeat presence monitoring.
25. **Designing a Video Streaming Platform (YouTube / Netflix)**: Ingestion chunking pipeline, HLS/DASH manifest generation, and Adaptive Bitrate (ABR) switching under bandwidth throttling.
26. **Designing an Inverted Index & Distributed Search Engine**: Document tokenization, stop-word removal, inverted index postings lists, and linear postings list intersection.
27. **Designing a Real-Time Collaborative Document Editor**: Concurrent multi-user edits at identical text offsets; CRDT fractional indexing preserving user intent.
28. **Designing Distributed Observability: Tracing & Metrics**: W3C TraceContext (`traceparent`) span propagation across API Gateway, Auth, Order, and Database microservices.

---

## 🧪 Automated Headless Audit Harness

Run the built-in headless test harness across 4 viewports (320px mobile, 480px, 768px tablet, 1200px desktop):

```bash
npm test
```

Audits:
- Complete DOM mounting of all 29 visualizers.
- Event listener triggers (every button, slider, and selector fires without exceptions).
- Finite coordinate math (zero `NaN`, `Infinity`, or unbounded layout regressions).
- High-DPI canvas backing store scaling.

---

## 🚀 Deployment & Static Serving

The project adheres to strict **zero-dependency web standards**:
- Pure HTML5, CSS3, and modern ES6+ JavaScript.
- No Node.js runtime required to serve.
- Compatible with any static file server:

```bash
# Preview locally
python3 -m http.server 8080
```
