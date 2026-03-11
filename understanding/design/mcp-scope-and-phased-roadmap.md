# Agentic Commerce MVP Scope and Phased Roadmap

## Overview

Agentic commerce represents a new model of digital commerce where AI agents assist users in discovering products, comparing merchant offers, and executing transactions on their behalf.

Unlike traditional e-commerce systems where users browse websites and manually complete purchases, agentic commerce allows transactions to occur directly within an AI interface.

This document defines the **Minimum Viable Product (MVP) scope** for implementing agentic commerce capabilities within a super-app environment, along with a **phased roadmap** for future expansion.

The MVP focuses on validating the core hypothesis:

> Users can successfully discover and purchase products through an AI agent interface integrated with merchant systems.

To achieve this, the MVP implements a simplified architecture that supports the complete purchase journey while intentionally deferring advanced commerce functionality.

---

# MVP Architecture Scope

The MVP architecture includes only the layers required to demonstrate an end-to-end purchase workflow.

## Included Layers

### 1. User Interaction Layer

**Components**

- Super-App Interface
- SuperAppAgent

**Responsibilities**

- Provide the user-facing interface for commerce interactions
- Capture user intent through conversational or structured input
- Display product options and transaction confirmations
- Manage user identity and session context

Example interaction:

User: Buy a USB-C charger under $30  
Agent: Here are the best available options  
User: Purchase option #1

In this architecture, the AI interface effectively becomes the **storefront through which commerce interactions occur**.

---

### 2. Intent and Planning Layer

**Components**

- IntentPlanner

**Responsibilities**

- Parse and interpret user requests
- Convert natural language queries into structured workflows
- Trigger downstream processes such as discovery, ranking, and checkout

Example workflow:

1. Search products
2. Retrieve merchant offers
3. Rank offers
4. Initiate checkout

For the MVP, orchestration should remain lightweight and can be implemented using simple rules or LLM tool-calling.

Advanced planning capabilities are out of scope for this phase.

---

### 3. Merchant Discovery Layer

**Components**

- MerchantDiscovery
- MerchantCatalogDB (or MerchantIndex)

**Responsibilities**

- Retrieve merchant products and offers
- Provide candidate merchants for ranking
- Maintain a small product and merchant catalog

For MVP purposes, discovery can be simplified by using:

- a small curated merchant catalog
- a static merchant registry
- a centralized database rather than distributed search infrastructure

---

### 4. Offer Ranking Layer

**Components**

- OfferRankingEngine

**Responsibilities**

- Aggregate offers returned by merchants
- Rank available options according to simple criteria

Example ranking factors:

- price
- delivery estimate

Example scoring logic:

score = price_weight + delivery_weight

Advanced ranking capabilities such as personalization, advertising, and machine-learning ranking models are intentionally excluded from the MVP.

---

### 5. Transaction Layer

**Components**

- CheckoutService
- PaymentProvider
- Optional ACP-compatible interface

**Responsibilities**

- Initiate checkout with the selected merchant
- Authorize payment
- Confirm order creation

The transaction layer ensures that the system can successfully complete purchases.

The merchant remains responsible for fulfillment and payment processing.

---

# MVP Reference Architecture

User  
↓  
SuperAppAgent  
↓  
IntentPlanner  
↓  
MerchantDiscovery  
↓  
MerchantCatalogDB  
↓  
OfferRankingEngine  
↓  
CheckoutService  
↓  
PaymentProvider

This architecture represents the **minimum functional system** capable of supporting agent-driven commerce.

---

# Capabilities Excluded from MVP

The following capabilities are intentionally deferred to later phases.

## Negotiation Systems

Buyer-agent to merchant-agent negotiation is not included in the MVP.

Example architecture:

BuyerAgent ↔ MerchantAgent

Negotiation systems require:

- merchant agents
- dynamic pricing engines
- policy-based decision systems

These introduce significant architectural complexity.

---

## Merchant Agent Layer

The MVP interacts directly with merchant APIs rather than implementing merchant agents.

Future architecture may introduce merchant agents to support richer workflows.

---

## Advanced Ranking Algorithms

Excluded features include:

- machine learning ranking models
- personalized ranking
- advertising and sponsored listings
- merchant bidding systems

These require significant data and experimentation.

---

## Advanced Commerce Logic

The MVP does not include:

- bundle optimization
- tax optimization
- return workflows
- loyalty programs
- advanced inventory synchronization

Such features typically require deep integration with merchant systems.

---

## Distributed Order Orchestration

Complex order lifecycle systems are also excluded, including:

- event-driven order state machines
- distributed order orchestration
- compensation logic for failed transactions

For MVP purposes, a simple order confirmation workflow is sufficient.

---

# Phased Roadmap

## Phase 1 — MVP (Agent Checkout Validation)

Objective:

Validate that users can successfully purchase products through the AI agent interface.

Capabilities:

- conversational commerce interface
- merchant discovery
- basic offer ranking
- checkout and payment execution

Key outcome:

Demonstrate that users trust AI agents to execute purchases.

---

## Phase 2 — Commerce Intelligence

Objective:

Improve recommendation quality and user experience.

Capabilities introduced:

- advanced ranking models
- delivery prediction
- merchant quality scoring
- personalized offer recommendations

---

## Phase 3 — Merchant Ecosystem

Objective:

Scale merchant participation.

Capabilities introduced:

- merchant onboarding platform
- merchant analytics dashboards
- standardized merchant API integrations
- merchant catalog synchronization

---

## Phase 4 — Agent Marketplace

Objective:

Enable autonomous multi-agent commerce.

Capabilities introduced:

- merchant agents
- buyer-merchant negotiation
- dynamic pricing
- multi-merchant workflow orchestration

In this phase, commerce workflows may involve direct interaction between buyer and merchant agents.

---

# Key Design Principle

The MVP should validate only one core hypothesis:

Users are willing to discover and purchase products through an AI agent interface.

Advanced commerce capabilities such as negotiation, dynamic pricing, and sophisticated ranking should only be implemented after this hypothesis is validated through real-world usage data.