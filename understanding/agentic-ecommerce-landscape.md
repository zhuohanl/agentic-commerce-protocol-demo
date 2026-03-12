# Agentic E-commerce Landscape  
### Technical Overview for Super App Architecture

Author: [TBD]  
Date: 2026  
Status: Draft

---

# 1. Overview

**Agentic e-commerce** refers to a new commerce paradigm where **AI agents perform shopping tasks on behalf of users**, including:

• product discovery  
• comparison  
• negotiation  
• checkout  
• payment  
• post-purchase management

Instead of users browsing websites manually, **AI agents interact directly with merchants, platforms, and payment providers through standardized protocols**.

Typical workflow:

```
User intent → AI Agent → Product Discovery → Evaluation → Checkout → Payment → Fulfillment
```

This paradigm requires **machine-readable commerce protocols** so agents can transact autonomously.

Several emerging standards are forming the foundation of this ecosystem.

---

# 2. Key Protocols in Agentic Commerce

Agentic commerce relies on **three conceptual protocol layers**.

```
┌────────────────────────────────────────────┐
│ User Interface                             │
│ Super Apps / Assistants / Chat Interfaces  │
└────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ Agent Layer                                │
│ Buyer Agents / Personal Agents             │
└────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ Commerce Protocol Layer                    │
│ ACP / UCP                                  │
└────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ Payment Authorization Layer                │
│ PSP / Wallet / Payment Tokens              │
└────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ Merchant Infrastructure                    │
│ Platforms / Logistics / Inventory          │
└────────────────────────────────────────────┘
```

---

# 3. Major Protocols and Players

## 3.1 Agentic Commerce Protocol (ACP)

The **Agentic Commerce Protocol (ACP)** is an open standard developed by **OpenAI and Stripe** to enable AI agents to securely perform purchases on behalf of users. :contentReference[oaicite:0]{index=0}

ACP defines:

• product discovery  
• cart management  
• checkout execution  
• payment authorization

Its purpose is to enable **programmatic commerce flows between AI agents and businesses**. :contentReference[oaicite:1]{index=1}

Example ecosystem integrations:

• ChatGPT instant checkout  
• Stripe payment processing  
• PayPal merchant integrations  
• Shopify / Etsy merchants

ACP moves AI from:

```
finding products → completing purchases
```

---

## 3.2 Universal Commerce Protocol (UCP)

The **Universal Commerce Protocol (UCP)** is an open standard initiated by Google to support **agent-driven commerce across platforms**. :contentReference[oaicite:2]{index=2}

UCP provides a **common language for platforms, merchants, and agents to communicate**. :contentReference[oaicite:3]{index=3}

Capabilities include:

• product discovery  
• price negotiation  
• checkout execution  
• discount application  
• order tracking

The protocol is supported by a consortium including:

• Shopify  
• Wayfair  
• Target  
• Etsy  
• Walmart  
• payment providers such as Visa and Mastercard. :contentReference[oaicite:4]{index=4}

---

# 4. ACP vs UCP

| Dimension | ACP | UCP |
|---|---|---|
| Developed by | OpenAI + Stripe | Google + Retail ecosystem |
| Primary focus | Checkout and transaction execution | Full commerce lifecycle |
| Scope | Agent → merchant transaction | Discovery → purchase → post-purchase |
| Payment | PSP-driven (Stripe ecosystem) | Wallet + payment network integration |
| Ecosystem | AI assistants | Search / retail platforms |
| Architecture | Merchant-centric | Platform-centric |

### Conceptual Difference

ACP focuses on **executing a purchase**, while UCP attempts to standardize **the entire commerce journey**.

---

# 5. Typical Agentic Commerce Workflow

```
sequenceDiagram

User->>AI Agent: "Find running shoes under $150"

AI Agent->>Merchant APIs: Query products
AI Agent->>Multiple merchants: Request offers

Merchants->>AI Agent: Price + shipping options

AI Agent->>User: Recommend best option

User->>AI Agent: Approve purchase

AI Agent->>ACP/UCP Layer: Purchase request

Protocol Layer->>Payment Provider: Token authorization

Payment Provider->>Merchant: Payment confirmation

Merchant->>Logistics: Ship product
Merchant->>AI Agent: Order confirmation
```

---

# 6. Ecosystem Architecture

Agentic commerce introduces a **new multi-party architecture**.

```
User
 │
 ▼
AI Assistant / Super App
 │
 ▼
Buyer Agent
 │
 ▼
Protocol Layer (ACP / UCP)
 │
 ├───────────────┬───────────────┬───────────────
 ▼               ▼               ▼
Merchant APIs   PSPs            Logistics
Shopify         Stripe          FedEx
Amazon          PayPal          UPS
Etsy            Adyen
```

This architecture **decouples the consumer interface from merchant infrastructure**.

---

# 7. How the Ecosystem is Shifting

## 7.1 From Websites to AI Interfaces

Traditional commerce:

```
User → Website → Checkout
```

Agentic commerce:

```
User → AI Agent → Commerce APIs
```

The interface of commerce shifts from **websites to AI assistants**.

---

## 7.2 Search Becomes an Intent Marketplace

Instead of ranking pages, agents rank **offers**.

Example:

```
User intent
   ↓
Agents collect offers
   ↓
Agents select best option
```

This shifts competition from **traffic acquisition → algorithmic selection**.

---

## 7.3 Commerce Becomes API-Driven

Merchants must expose:

• product APIs  
• inventory APIs  
• pricing APIs  
• checkout APIs

Visibility becomes dependent on **machine-readable product data**.

---

# 7.4 Role Change of Large E-commerce Platforms

Large platforms such as:

• Amazon  
• eBay  
• Trip.com  
• Shopify marketplaces  

traditionally control the **entire consumer journey**.

```
User
 │
 ▼
Platform
 │
 ├ search
 ├ recommendation
 ├ checkout
 └ payment
```

Agentic commerce **breaks this vertical integration**.

```
User
 │
 ▼
AI Agent
 │
 ▼
Multiple Platforms / Merchants
```

Platforms must therefore evolve.

---

# Platform Strategy 1 — Become Agent Platforms

Platforms may deploy **their own AI shopping agents**.

Example concept:

```
User
 │
 ▼
Amazon AI agent
 │
 ├ Amazon inventory
 ├ third-party merchants
 └ logistics network
```

This preserves the **interface layer**.

---

# Platform Strategy 2 — Become Commerce Infrastructure

Platforms may shift from **consumer destination → commerce infrastructure**.

Example architecture:

```
AI Agent
 │
 ▼
Commerce Infrastructure Platform
 │
 ├ catalog APIs
 ├ pricing APIs
 ├ fulfillment
 └ payments
```

Analogous to:

```
AWS for commerce
```

---

# Platform Strategy 3 — Compete for Agent Demand

Platforms may optimize for **AI agents instead of humans**.

New metrics:

```
agent visibility
machine-readable catalog
price competitiveness
delivery speed
```

---

# Platform Strategy 4 — Vertical Specialization

Some platforms may dominate **specific industries**.

| Platform | Potential Role |
|---|---|
Amazon | logistics + fulfillment |
Shopify | merchant infrastructure |
Trip.com | travel orchestration |
eBay | negotiation marketplace |

---

# Example: Trip.com

Travel planning naturally fits agent orchestration.

```
User Travel Agent
        │
        ▼
Travel Aggregator
        │
        ▼
Trip.com APIs
        │
 ┌─────────────┬─────────────┬─────────────
 ▼             ▼             ▼
Flights       Hotels       Activities
```

Trip.com may evolve from:

```
travel website
```

to

```
travel infrastructure for agents
```

---

# Example: eBay

eBay could become a **negotiation marketplace for agents**.

```
Buyer Agent ↔ Seller Agent
```

Agents can negotiate:

• price  
• delivery  
• product condition

---

# Strategic Risk for Platforms

Agents optimize for:

• price  
• speed  
• reliability

Platform loyalty may weaken.

Example:

```
User: Buy cheapest 65-inch TV

Agent checks:
Amazon
BestBuy
Costco
Direct manufacturer
```

The platform becomes **interchangeable infrastructure**.

---

# Strategic Opportunity

Platforms that adapt early may gain advantages.

Key capabilities:

• agent-friendly APIs  
• structured product data  
• automated pricing  
• trust & identity infrastructure

---

# 8. Implications for Different Players

## LLM Companies

Opportunities:

• control the interface layer  
• capture consumer intent  
• orchestrate transactions

Risk:

• liability and trust

---

## Merchants

Benefits:

• new distribution channels  
• reduced marketing costs

Challenges:

• API readiness  
• data quality

---

## E-commerce Platforms

Platforms must evolve toward:

```
agent-ready commerce infrastructure
```

---

## Payment Providers

PSPs provide:

• payment tokenization  
• fraud detection  
• identity verification

---

# 9. Implications for Super Apps

A super app entering agentic commerce should provide:

Core components:

1. Intent planner  
2. Buyer agent  
3. Merchant discovery layer  
4. Protocol gateway (ACP/UCP)  
5. Payment integration  
6. Trust layer

Architecture:

```
Super App UI
      │
      ▼
Buyer Agent
      │
Intent Planner
      │
Protocol Gateway
      │
 ┌───────────────┬───────────────┐
 ▼               ▼               ▼
Merchant APIs   Payment APIs   Logistics APIs
```

---

# 10. Open Problems

Major unresolved issues include:

Trust  
Fraud  
Agent identity  
Negotiation  
Regulation

---

# 11. References

Agentic Commerce Protocol  
https://developers.openai.com/commerce

Stripe ACP overview  
https://stripe.com/blog/developing-an-open-standard-for-agentic-commerce

Google Universal Commerce Protocol  
https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/

Universal Commerce Protocol specification  
https://ucp.dev

Industry analysis  
https://www.bigcommerce.com/blog/agentic-commerce-protocol/

---

# 12. Key Takeaways

Agentic commerce transforms digital commerce from:

```
traffic → platform → purchase
```

to

```
intent → AI agent → protocol network → merchants
```

The long-term architecture resembles an **internet of agents conducting economic activity**.