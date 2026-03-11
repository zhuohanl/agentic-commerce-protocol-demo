# Building an Agentic E‑commerce Super‑App with A2A, MCP, and ACP (2023–2026)

## Executive summary

Agentic e‑commerce moved from “shopping assistants that recommend” (2023–2024) to “transaction-capable agents that can complete checkout inside the AI surface” (late 2025–early 2026). This shift has been driven by three converging forces: (1) better agent architectures (tool use, planning, multi-agent collaboration), (2) protocol standardization for interoperability (MCP for tools/data; A2A for agent-to-agent collaboration), and (3) new commerce primitives that keep merchants as merchant-of-record while enabling in-chat checkout (ACP plus delegated/“shared” payment tokenization). 

In this ecosystem, ACP (Agentic Commerce Protocol) is effectively the **checkout “contract”** between an agent surface and a merchant: merchants expose a small set of REST endpoints for checkout sessions and webhooks for order lifecycle events, and they retain control (accept/decline, payment processing, fulfillment, refunds/chargebacks).  Meanwhile, MCP (Model Context Protocol) standardizes how agents securely connect to enterprise tools and data via a host/client/server model over JSON-RPC 2.0; and A2A (Agent2Agent) standardizes “agent-as-agent” collaboration (capability discovery, task handoff, streaming/asynchronous progress) on top of common transports like HTTP/SSE/JSON-RPC. 

For a super‑app entry point (like Grab/WeChat), the architectural implication is that **your app becomes the orchestration and governance layer**: it routes intent to specialized agents, performs policy checks, mediates identity/consent, and brokers protocol adapters (ACP for commerce checkout, MCP for tools/data, A2A for cross-agent negotiation with partners). Super‑apps already prove out the “single app, many services” model; agentic commerce adds a new “transaction surface” that can live inside chat, cards, and mini-app UX. 

This report proposes a production architecture optimized for: (a) **merchant-of-record preservation** (critical for risk/compliance and partner adoption), (b) **interoperability-first integrations** (protocol adapters and versioned schemas), and (c) **resilient distributed transactions** (sagas, idempotency, deterministic retries, and signed webhooks). 

## Trends and market direction 2023–2026

A useful way to understand “agentic e‑commerce” is to split it into (1) **agent capability trends**, (2) **standardization trends**, and (3) **checkout + payment primitive trends**.

**Agent capability trends (2023–2025): tool use → self-improvement → multi-agent collaboration.** In 2023, research and open tooling emphasized how LLMs can learn to call tools and incorporate results (e.g., Toolformer), and how agent performance can improve via language-feedback memory rather than weight updates (e.g., Reflexion).  In parallel, multi-agent orchestration frameworks matured (e.g., AutoGen), reflecting a practical realization: complex real workflows benefit from multiple specialized agents coordinating.  Surveys in 2024–2025 crystallized planning/reasoning/tool-use patterns and failure modes, which directly map to e‑commerce tasks like discovery → comparison → constraints → checkout. 

**Standardization trends (2024–2026): MCP and A2A as “plumbing” for an agent ecosystem.** In November 2024, Anthropic introduced MCP as an open standard for secure, two-way connections between AI tools and external data sources, positioning it as a remedy for fragmented integrations.  MCP’s spec formalizes a host/client/server model over JSON‑RPC 2.0, which is important because it enables tool discovery and consistent invocation semantics.  By 2025–2026, MCP governance and adoption signals strengthened (e.g., donation to a neutral foundation and broad vendor support reported by major tech press). 

In April 2025, Google announced A2A as an open protocol for agent interoperability, explicitly framing it as complementary to MCP: MCP links agents to tools and context; A2A links agents to other agents—especially relevant when agents are “opaque” and do not share internal state or memory.  A2A details focus on capability discovery (Agent Cards), negotiation of modalities, asynchronous-first task management, and streaming progress—elements that map well to partner negotiations and long-running order fulfillment updates. 

**Checkout + payment primitive trends (late 2025–early 2026): embedded checkout moves upstream into AI conversations.** On September 29, 2025, OpenAI launched Instant Checkout in ChatGPT and publicized ACP (open-sourced, co-developed with Stripe) as the protocol enabling agentic checkout while keeping merchants in control as merchant of record.  The user experience pattern is consistent: product discovery and comparison occur in-chat; users tap “Buy”; checkout completes without leaving the AI surface; and orders, payments, and fulfillment remain on the merchant’s systems.  OpenAI’s help-center documentation emphasizes a buyer-visible “Buy button,” multiple payment methods, and the key governance point that OpenAI is not merchant of record (merchant handles shipping/returns/support). 

In January 2026, Microsoft announced Copilot Checkout—again “no redirect” and “merchant stays merchant of record”—with payments and seller connectivity described as being powered by Stripe and ACP integration patterns.  Tech press coverage framed this as part of an industry contest to control the checkout funnel inside AI assistants rather than on merchant websites. 

A parallel trend (important even if you build primarily on ACP) is that other ecosystems are concurrently launching their own commerce standards and “agentic checkout” experiences, signaling a multi-protocol world where merchants will expect adapters rather than bespoke point integrations. 


## Protocol deep dive: ACP, A2A, MCP, and checkout primitives

### What ACP standardizes in practice

ACP (as published in OpenAI’s commerce documentation and the open-source spec repo maintained by OpenAI + Stripe) defines how an agent and a merchant coordinate checkout while **preserving merchant control**. 

From an integration standpoint, OpenAI’s commerce docs require three flows for Instant Checkout enablement:

1) **Product feeds**: merchants provide structured catalog feeds (CSV/JSON) so product discovery surfaces accurate price/availability; 
2) **Agentic checkout REST API**: merchants implement checkout session endpoints (create/update/complete/cancel) returning “authoritative cart state” each time; 
3) **Delegated payment**: payment providers (or PCI level 1 merchants with vaults) implement a delegated payment endpoint where OpenAI can securely send a single-use payload; the PSP returns a token; OpenAI forwards it in the completion call to the merchant. 

The open-source ACP RFCs add useful engineering-level detail that should influence your architecture even if you don’t implement Instant Checkout directly:

- **Versioning** via `API-Version` headers and explicit supported versions. 
- **Idempotency** required on all POST requests, with explicit conflict semantics and minimum retention windows. 
- **Capability negotiation**: a standardized `capabilities` object whose “intersection” semantics allow a seller to return only what is mutually supported for that session—important as payment methods and authentication interventions diversify. 
- **Payment handler framework** direction: “payment handlers” as rich declarations describing configuration, schemas, and delegation/PCI requirements. 

### Delegated payment and “shared payment tokens” as the security hinge

OpenAI’s delegated payment spec explicitly aims to securely share payment details to a merchant’s PSP/vault, producing a **single-use token restricted by max amount and expiry**; it stresses that merchants are merchant of record and settlement/refunds/chargebacks remain with the merchant + PSP. 

Stripe’s “shared payment tokens” (SPTs) are presented as a concrete primitive for this model: an agent grants an SPT to the seller with usage/expiration limits so the seller can process payment without seeing underlying credentials; Stripe documentation frames SPTs as scoped grants, and Stripe’s newsroom describes Copilot Checkout as using a Stripe-issued Shared Payment Token passed to the seller. 

### How A2A and MCP fit alongside ACP in a super-app

**MCP** is the “tool/data plane”: it provides the model-side mechanism to connect your orchestrator to internal systems (catalog, order history, CRM, loyalty, fraud signals) and partner APIs through standardized tool discovery and invocation. 

**A2A** is the “agent collaboration plane”: it enables your app’s agents to negotiate, delegate, and coordinate with third-party agents (merchant agents, logistics agents, marketplace agents) without requiring tool-level exposure. Google’s A2A announcement and spec emphasize capability discovery, modality negotiation, and secure collaboration, explicitly complementing MCP. 

### Protocol comparison table

| Dimension | ACP (checkout contract) | MCP (tools/data contract) | A2A (agent collaboration contract) |
|---|---|---|---|
| Primary objective | Standardize agent ↔ merchant checkout sessions + payment delegation + order updates for embedded checkout | Standardize model/app ↔ tools/data connections | Standardize agent ↔ agent discovery, collaboration, and task coordination |
| Canonical roles | Buyer agent, merchant/seller, PSP/vault | Host, client connectors, MCP servers | Client agent, server agent, AgentCard discovery |
| Transport + core format | REST endpoints + webhooks for checkout; delegated payment endpoints; versioning + idempotency in headers  | JSON‑RPC 2.0 between host/client/server; spec defines normative requirements  | Built on existing standards (HTTP, SSE, JSON‑RPC), async-first patterns, streaming updates  |
| Security posture | Merchant-of-record preserved; delegated payment restricts token by amount/expiry; production guidance includes TLS + signed webhooks + allowlists  | Requires secure, two-way connections; emphasis on reducing integration fragmentation; security must be implemented in servers/hosts  | Secure exchange between opaque agents; encourages secure transport and authentication; designed to avoid sharing internal state/memory  |
| Why it matters for a super-app | Lets your super-app embed commerce checkout while partners keep existing commerce stacks; supports multi-platform distribution surfaces  | Lets your super-app agents safely use internal tools (catalog, fulfillment visibility, loyalty) without bespoke connectors  | Lets your super-app negotiate/coordinate with partner agents (e.g., merchant, logistics, insurer) beyond tool-style calls  |

## Concrete implementations and case studies

### OpenAI Instant Checkout and merchant integration surface

OpenAI’s public documentation lays out a concrete integration path: apply, supply a product feed, implement checkout session endpoints and order webhooks, and integrate via a PSP that supports the delegated payment spec (with Stripe’s Shared Payment Token described as the first compatible implementation). 

Instant Checkout behavior (as described for buyers) includes a “Buy” button on eligible items, a checkout window in-chat, support for common payments, and an explicit statement that OpenAI is not merchant of record and the merchant handles shipping/returns/support. 

### Microsoft Copilot Checkout as a cross-surface proof point

Microsoft Advertising’s Copilot Checkout announcement stresses: no redirects, frictionless conversion, and merchant remains merchant of record (transaction and customer relationship).  Stripe’s newsroom states that Microsoft communicates with Stripe, Stripe connects with the seller via ACP, and Stripe issues a Shared Payment Token that the seller can process (on Stripe or other providers, while still using Stripe risk signals).  Independent reporting similarly describes in-chat checkout for select retailers and payments powered via partner rails. 

### Public code and reference implementations

The ecosystem already includes multiple public repos that are valuable as “design reference artifacts”:

- **ACP specification + RFCs** (maintained by OpenAI + Stripe): clarifies idempotency rules, versioning, capability negotiation, and payment handler direction. 
- **End-to-end sandbox/demos**: a public “mock implementation” repo demonstrates ACP flows across client, merchant, and PSP for experimentation. 
- **Implementation helpers**: a package that “handles ACP protocol implementation so you focus on business logic” (useful for quick prototyping, but still assess security and spec completeness). 
- **Merchant platform plugins**: a WooCommerce-focused ACP implementation suggests an emerging pattern: merchants will expect platform plugins rather than bespoke integrations. 
- **Type-safe SDKs**: unofficial multi-language protocol implementations (useful to generate schemas and reduce integration errors). 

### A2A and MCP implementation examples

- **A2A codelab (purchasing concierge)**: demonstrates an A2A client doing discovery (AgentCards), sending messages to seller agents, and tracking task progression—directly relevant to “agent-to-agent negotiation” flows (price, fulfillment options, constraints) in commerce. 
- **A2A spec and ecosystem**: the spec formalizes discovery and modality negotiation; Thoughtworks highlights async-first and secure transport patterns, reinforcing production suitability for long-running tasks. 
- **MCP official docs + servers**: Anthropic’s MCP intro points to SDKs and open server implementations; the spec defines JSON-RPC based requirements. 
- **Stripe MCP server**: Stripe hosts a remote MCP server and documents MCP tooling for interacting with Stripe APIs and knowledge bases—important for finance workflows and merchant operations agents. 
- **OpenAI MCP tooling**: OpenAI documents how its Responses API supports remote MCP servers over “streamable HTTP” or HTTP/SSE, and notes that costs are token-based rather than per-tool-call fees (useful for cost modeling). 

## Reference production architecture

This architecture is written for a super‑app entry point where your company is the **experience + orchestration platform**, and commerce is delivered either by (a) your own first-party merchant stack, (b) partners using ACP, or (c) partner agents reachable via A2A.

### Layered production diagram

```mermaid
flowchart TB
  %% Experience layer
  subgraph L1[Experience Layer: Super-App Surfaces]
    UI[Super-App Mobile/Web UI\nChat + cards + mini-app views]
    Wallet[Identity + Wallet UX\nconsent, saved payment, addresses]
    Notif[Push/Email/In-app notifications]
  end

  %% Agent layer
  subgraph L2[Agent Layer: Orchestration + Policy]
    Router["Intent Router\n(classify: shop/order/support)"]
    Orchestrator[Agent Orchestrator\nplans, tools, handoffs, memory]
    Policy[Policy / Risk Gate\nallowlists, spend limits, KYC signals]
    Eval[Quality + Safety Evals\nprompt/tool regressions]
  end

  %% Protocol adapter layer
  subgraph L3[Protocol Adapters]
    ACP[ACP Adapter\nProduct feeds + Checkout sessions + Webhooks]
    MCP[MCP Client/Server Mesh\ninternal tools + partner tools]
    A2A[A2A Gateway\nAgent discovery + task handoff]
  end

  %% Commerce core services
  subgraph L4[Commerce Core Domain Services]
    Catalog[Catalog + Offer Service\nprice/availability snapshots]
    Cart[Cart/Checkout State Service\nsession state + idempotency store]
    Orders[Order Management Service\norder SOR + lifecycle]
    Payments[Payments Orchestrator\nPSP routing + token handling]
    Inv[Inventory/Reservation Service]
    Fulfill[Fulfillment Service\nshipping, tracking, returns]
  end

  %% Partner ecosystem
  subgraph L5[Partner and External Systems]
    Merchants[Partner Merchants\nACP endpoints]
    PSPs[PSPs / Vaults\nDelegated payment endpoints]
    Logistics[Carriers / 3PLs\nAPIs + webhooks]
    Marketplaces[Marketplaces\ncatalog + order APIs]
    PartnerAgents[Partner Agents\nA2A servers]
  end

  %% Data and platform
  subgraph L6[Data + Platform]
    OLTP[(OLTP DBs\norders, users, sessions)]
    Events[(Event bus\norders, inventory, payments)]
    Search[(Search/Vector index\nproducts, policies)]
    Audit[(Audit log / Ledger\nimmutability, forensics)]
    Obs[Observability\ntraces, metrics, logs]
    Sec[Security\nsecrets, keys, WAF, IAM]
  end

  UI --> Router --> Orchestrator
  Wallet --> Policy
  Orchestrator --> MCP
  Orchestrator --> A2A
  Orchestrator --> ACP

  ACP --> Merchants
  ACP --> PSPs
  A2A --> PartnerAgents
  MCP --> Catalog
  MCP --> Orders
  MCP --> Payments

  ACP --> Cart --> Orders --> Fulfill --> Logistics
  Payments --> PSPs
  Orders --> Events
  Inv --> Events
  Fulfill --> Events

  Orders --> OLTP
  Cart --> OLTP
  Catalog --> Search
  Events --> Audit
  Router --> Obs
  Orchestrator --> Obs
  Policy --> Obs
  UI --> Obs
  Cart --> Obs
  Orders --> Obs
  Payments --> Obs
  Sec --- ACP
  Sec --- MCP
  Sec --- A2A
```

### Component responsibilities (what must be “production-grade”)

**Experience layer (super‑app frontend).** Your competitive edge is multi-surface UX: chat + product cards + embedded mini-apps. The system design implication: the frontend must support **progressive disclosure** (recommendations → compare → confirm), explicit user confirmation steps (especially for purchases), and interruption/rollback affordances (“cancel checkout,” “change shipping,” “switch payment”). OpenAI’s Instant Checkout UX and “Buy button” flow show the baseline user expectation for embedded checkout. 

**Agent orchestration.** Treat this as a control plane: intent routing, planning, tool selection, and governance. If you adopt OpenAI’s agent tooling, OpenAI documents agent workflows, MCP tool calling, and deployment surfaces (e.g., Agents SDK and MCP tool in Responses API), which gives you a reference for orchestration primitives (handoffs, tool calls, traces). 

**ACP adapter.** Implement as a dedicated boundary layer so your internal domain model (offers, carts, orders) can map cleanly to ACP requirements: version headers, idempotency headers, authoritative cart responses, and signed webhooks. 

**MCP mesh.** Use MCP to expose internal tools/data (catalog query, order lookup, loyalty eligibility, fraud signals) to your agents with consistent schemas and centralized auth policies. MCP’s host/client/server model provides a stable contract for that mesh. 

**A2A gateway.** Use when a partner is better modeled as an agent (negotiation, iterative clarification, long-running tasks, multi-modal results). A2A’s emphasis on discovery (AgentCards), modality negotiation, and task management fits “merchant concierge” and “fulfillment coordinator” patterns. 

**Commerce core.** Separate “commerce correctness” from “agent reasoning.” The checkout agent should not become your system of record. ACP explicitly keeps orders/payments/compliance on the merchant’s stack; mirror that principle internally: orders service is the SOR; payments orchestrator is safety-critical; inventory reservation must be deterministic and idempotent. 

**Observability + security + governance.** Agentic commerce expands attack surface (prompt injection, tool misuse, model DoS, supply chain vulnerabilities). OWASP explicitly documents these emerging LLM risks; OpenAI’s commerce production guidance calls out TLS requirements, PCI-scope boundaries, signed webhooks, and allowlisting outbound IP ranges. 

## Integration patterns and transaction models

### Message flow building blocks you should standardize

**Three “planes” simplify integration reasoning:**

1) **Synchronous command plane**: user-driven actions (create/update/complete checkout session) should be synchronous, low-latency, and idempotent. ACP formalizes these endpoints and expects “authoritative cart state” on every response. 
2) **Asynchronous event plane**: order lifecycle events and fulfillment updates should flow through webhooks and internal event bus. OpenAI’s Agentic Checkout spec includes order events via webhooks; production guidance includes webhook signature validation and idempotency testing. 
3) **Negotiation / collaboration plane**: when the workflow requires iterative clarification (substitutions, bundles, delivery constraints), use A2A flows rather than forcing everything into tool calls. 

### Distributed transaction model: sagas over two-phase commit

Commerce is a classic multi-step workflow: reserve inventory, calculate tax/shipping, authorize payment, create order, allocate fulfillment, and emit confirmations. In microservices with database-per-service, two-phase commit is generally infeasible; AWS prescriptive guidance explicitly notes that two‑phase commit is not an option in such designs, and recommends saga patterns (choreography or orchestration).  Azure similarly positions sagas as sequences of local transactions with compensating actions for failure recovery. 

Pragmatically:

- Use **saga orchestration** for checkout/payment workflows (a single coordinator can enforce invariants like “no capture before inventory reserved,” “no duplicate order creation”). 
- Use **saga choreography** for partner fulfillment events where each party emits events and downstream services react (useful in marketplaces where you don’t control all participants). 

### Idempotency, retries, and error normalization

In agentic checkout, retries are normal (mobile network instability, backgrounding, tool timeouts). ACP’s RFC mandates idempotency keys on all POST endpoints and defines conflict handling; OpenAI’s production checklist explicitly tests that replaying the same Idempotency-Key yields the same result and that mismatched parameters produce a conflict error.  Payment APIs similarly require idempotent request patterns; Stripe documents idempotency keys and explains parameter-mismatch protections. 

A recommended normalization strategy in your platform:

- Standardize **error taxonomies**: `invalid_request`, `out_of_stock`, `payment_declined`, `requires_3ds`, `service_unavailable` (these appear in ACP docs/RFCs). 
- Make all “side-effect” commands **idempotent at the boundary** and **deduplicated in the domain** (store idempotency key → response mapping, with TTL). 
- Treat 5xx as **non-cacheable** for idempotency (as ACP RFC states) and use exponential backoff with jitter. 

### Key sequence diagrams (Mermaid)

#### Embedded checkout flow (ACP + delegated payment)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant SA as Super-App UI
  participant AO as Agent Orchestrator
  participant M as Merchant ACP API
  participant PSP as PSP / Vault (Delegated Payment)
  participant OMS as Order Management

  U->>SA: "Buy this item"
  SA->>AO: intent=checkout, cart + user context
  AO->>M: POST /checkout_sessions (Idempotency-Key, API-Version)
  M-->>AO: CheckoutSession (authoritative cart, status)
  AO-->>SA: Render cart + shipping options + disclosures

  U->>SA: Confirm address + payment method
  SA->>AO: Confirm purchase

  AO->>PSP: POST /agentic_commerce/delegate_payment (single-use allowance)
  PSP-->>AO: payment_token (scoped, expires)

  AO->>M: POST /checkout_sessions/{id}/complete (payment_token)
  M->>OMS: Create order, authorize/capture payment, reserve inventory
  OMS-->>M: order_id + final totals
  M-->>AO: completed + order_id (+ permalink)
  AO-->>SA: Show confirmation + order tracking entry
```

#### Agent-to-agent negotiation (A2A) before committing checkout

```mermaid
sequenceDiagram
  autonumber
  participant AO as Buyer Agent (Super-App)
  participant SD as Seller Discovery (A2A AgentCard)
  participant SA as Seller Agent (A2A Server)
  participant U as User

  AO->>SD: Discover agents (fetch AgentCards)
  SD-->>AO: Seller AgentCard (skills, auth, modalities)

  AO->>SA: Start task: "Need item X, constraints Y"
  SA-->>AO: Streaming updates (availability, substitutions, ETA options)

  AO->>U: Ask clarifying question (size/color/substitute?)
  U-->>AO: Provide constraints

  AO->>SA: Update task with constraints
  SA-->>AO: Final offer set (price, shipping options, terms)

  AO-->>AO: Decide: proceed to ACP checkout or abort
```

#### Third-party partner fulfillment and post‑purchase updates (event-driven)

```mermaid
sequenceDiagram
  autonumber
  participant OMS as Order Management
  participant F as Fulfillment Service
  participant L as Logistics/3PL
  participant ACPW as Agent Surface Webhook Receiver
  participant AO as Agent Orchestrator
  participant U as User

  OMS->>F: Allocate shipment for order_id
  F->>L: Create shipment (carrier label + tracking)
  L-->>F: tracking_id + ETA

  F-->>OMS: Update order status = shipped
  OMS-->>ACPW: Webhook order_updated (signed)
  ACPW-->>AO: Emit event to agent memory + notification pipeline
  AO-->>U: "Your order shipped" + tracking link
```

## Scalability, latency, cost, security, and compliance

### Scalability and latency: where agentic commerce is different

**Two latency budgets matter:**

- **UI perceived latency** (sub‑second for browse/compare; a few seconds acceptable for “complete purchase”)
- **workflow latency** (minutes/hours for fulfillment updates, refunds)

OpenAI’s production performance guidance explains that generation latency is dominated by token generation and model choice; for commerce, this implies you should stream partial results when browsing/comparing and keep “checkout completion” prompts short and schema-constrained.  A2A’s async-first and streaming patterns similarly align with long-running negotiations and incremental updates. 

**Scaling pattern:** isolate “agent reasoning” from “commerce correctness.”
Agents scale elastically (stateless inference + short-lived memory caches), while commerce services scale with stricter correctness constraints (orders/payments). ACP reinforces this by keeping merchant backends as the system of record and expecting authoritative cart/order state from merchants on every call. 

### Cost engineering: avoid “agent token burn” on deterministic operations

ACP is designed so deterministic operations (pricing, tax, stock validation) live in structured APIs rather than LLM reasoning.  For MCP, OpenAI notes that MCP tool usage costs are based on token usage for importing tool definitions and making tool calls, not per-call fees, which suggests an optimization path: aggressively minimize tool schemas, use scoped toolsets, and cache tool definitions where possible. 

### Security model: explicit consent, constrained tokens, and hardened tool boundaries

Security posture in an agentic commerce funnel should assume that:

- user prompts can be adversarial (prompt injection),
- tool outputs can be unsafe (insecure output handling), and
- agent workloads can be exploited for cost/availability attacks (model DoS).

OWASP’s LLM Top 10 enumerates these categories (prompt injection, insecure output handling, model DoS, supply chain, etc.), which map directly onto commerce agents that call tools and trigger payments. 

OpenAI’s commerce production guidance requires TLS and clarifies PCI scope boundaries: product feeds and agentic checkout specs are designed to stay out of PCI scope, while direct delegated payment integrations or forwarding APIs may bring systems into cardholder data scope.  PCI DSS itself is the baseline standard for payment account data protection, maintained by PCI Security Standards Council; its official materials describe PCI DSS as technical/operational requirements to protect payment account data. 

This is why **constrained tokenization** is central: OpenAI’s delegated payment spec expects single-use payloads with max amount and expiry, and Stripe’s shared payment token model similarly emphasizes scoped grants with usage/expiration limits. 

### Observability and auditability: required for both debugging and governance

Agentic commerce introduces new debugging questions (“why did the agent pick this seller?”, “which tool calls led to a charge?”). Use distributed tracing and structured logs across orchestration + commerce services. OpenTelemetry’s materials emphasize that distributed tracing is essential for complex distributed systems and that standardizing correlation across logs/traces/metrics increases observability value. 

A governance‑grade audit log should include: user consent events, tool invocation transcripts (redacted), idempotency keys, payment token lineage, webhook signatures validated, and explicit state transitions for the saga.

### Recommended vendor / stack options (with pros/cons)

Because your constraints are unspecified (no fixed cloud, budget, or regulatory region), the best recommendation is to design **portable control planes** and **pluggable data planes**, then choose a deployment profile.

| Architecture option | Best for | Strengths | Trade-offs / risks |
|---|---|---|---|
| Modular monolith commerce core + protocol adapters at edges | Early product + fast iteration in a super‑app | Strong consistency for orders/payments; fewer distributed transaction failures | Can bottleneck scaling; requires strict module boundaries to avoid “big ball of mud” |
| Microservices + event streaming + saga orchestrator | Large partner ecosystem, multiple verticals, high concurrency | Independent scaling; aligns with saga guidance for distributed consistency (no 2PC)  | Complexity: schema versioning, event ordering, compensations; higher operational burden  |
| Serverless + managed workflows (functions + workflow engine + managed queues) | Spiky traffic, rapid rollout, cost sensitivity | Fast elasticity; lower ops; workflow engines model sagas well  | Cold starts + tail latency; distributed debugging complexity; vendor-specific primitives |

For payments, your “vendor decision” is less about a specific PSP and more about whether you can keep payment credentials out of your environment:

- **Preferred**: delegated payment via a PSP implementation (keeps your platform away from cardholder data in most cases). 
- **Advanced**: direct delegated payment integration only if you are a PCI DSS level 1 merchant/PSP with vaulting; OpenAI explicitly frames direct integration as for PSPs or PCI DSS level 1 merchants. 
- **Ecosystem direction**: richer payment method support (network tokenization, BNPL tokens) is expanding; Stripe’s recent materials explicitly discuss expanding agentic payment support (including network-led agentic payments and BNPL) via shared primitives. 

## Migration, rollout, and testing plan

### Rollout strategy: prioritize controllability and “merchant trust” milestones

A pragmatic rollout sequence aligns with OpenAI’s own production readiness approach (sandbox testing, documented request/response logs, idempotency, error scenarios, and webhook signature validation). 

**Phase A: internal sandbox + spec conformance harness.**
Build an ACP conformance test suite that replays known-good flows:

- create session with/without address; validate tax/shipping appear after address; 
- delegated payment tokenization steps (headers, canonical serialization, signatures); 
- complete order and verify HTTP 201 / final order state; 
- emit `order_created` and `order_updated` webhooks and validate signatures; 
- idempotency replay and conflict conditions. 

**Phase B: controlled partner pilot (canary merchants + narrow categories).**
Limit by merchant segment and product type; measure: checkout completion rate, payment declines, inventory mismatch rate, median and p95 end-to-end time. OpenAI notes that Instant Checkout onboarding is rolling and initially geography‑limited; treat your own rollout similarly to avoid partner-facing instability. 

**Phase C: expand “protocol surfaces” before expanding merchants.**
Add: (1) capability negotiation, (2) richer fraud/risk signals, (3) A2A negotiation for substitutions, and (4) MCP connectors for post‑purchase support. ACP RFCs explicitly anticipate capability negotiation and richer payment handler frameworks; building adapters early reduces future migration friction. 

### Testing and monitoring plan: combine deterministic tests with agent regression tests

1) **Deterministic contract tests** (ACP endpoints, delegated payment, webhook signatures) as above. 
2) **Replay-based load tests**: simulate realistic retries and network flakiness with idempotency keys; Stripe documents key length limits, expiry behavior, and parameter mismatch protections—use similar behavior in your own idempotency store. 
3) **Agent regression evals**: create a golden set of “shopping journeys” and assert stable outcomes (correct products, correct constraints, no policy violations). Research surveys emphasize planning and tool-use variability; regression tests help avoid silent degradation as models change. 
4) **Security testing**: prompt injection test corpora, tool output sanitization tests, and model DoS quota tests aligned to OWASP LLM Top 10 categories. 
5) **Observability gating**: no production expansion without end-to-end trace sampling and audit log completeness (OpenTelemetry correlation across signals). 

### Selected primary links and code examples

```text
OpenAI commerce docs (ACP overview + specs)
https://openai.com/index/buy-it-in-chatgpt/
https://developers.openai.com/commerce/
https://developers.openai.com/commerce/guides/get-started/
https://developers.openai.com/commerce/specs/checkout/
https://developers.openai.com/commerce/specs/payment/
https://developers.openai.com/commerce/product-feeds/spec/
https://developers.openai.com/commerce/guides/production/

ACP open-source spec + RFCs
https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
https://raw.githubusercontent.com/agentic-commerce-protocol/agentic-commerce-protocol/main/rfcs/rfc.agentic_checkout.md

Public demos / implementation helpers (ACP)
https://github.com/locus-technologies/agentic-commerce-protocol-demo
https://github.com/vercel/acp-handler

MCP specification + servers
https://www.anthropic.com/news/model-context-protocol
https://modelcontextprotocol.io/specification/2025-06-18
https://github.com/modelcontextprotocol/servers

OpenAI MCP tool docs
https://developers.openai.com/api/docs/guides/tools-connectors-mcp/

A2A protocol + codelab
https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
https://a2a-protocol.org/latest/specification/
https://codelabs.developers.google.com/intro-a2a-purchasing-concierge

Stripe agentic commerce + Shared Payment Tokens
https://stripe.com/newsroom/news/microsoft-copilot-and-stripe
https://docs.stripe.com/agentic-commerce
https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens

Distributed transactions (sagas) references
https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/saga-pattern.html
https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-choreography.html
https://learn.microsoft.com/en-us/azure/architecture/patterns/saga

LLM security baseline
https://owasp.org/www-project-top-10-for-large-language-model-applications/
```