# Supporting ACP (Agentic Commerce Protocol)

## Overview

The **Agentic Commerce Protocol (ACP)** is an open standard jointly developed by **OpenAI and Stripe** that enables AI agents, buyers, and merchants to complete purchases through structured programmatic interfaces.

ACP provides a standardized way for AI agents to discover products, initiate checkout sessions, and complete transactions with merchant systems without requiring traditional web checkout flows.

Official references:

- OpenAI Commerce Documentation  
  https://developers.openai.com/commerce/

- Agentic Checkout Specification  
  https://developers.openai.com/commerce/specs/checkout/

- Stripe Agentic Commerce Protocol  
  https://docs.stripe.com/agentic-commerce/protocol

- ACP Specification Repository  
  https://github.com/agentic-commerce-protocol/agentic-commerce-protocol

ACP is designed to enable **programmatic commerce flows between AI agents, users, and businesses** while allowing merchants to keep their existing payment and fulfillment infrastructure. :contentReference[oaicite:0]{index=0}

---

# What “Supporting ACP” Means

When a platform claims it **supports ACP**, this does not simply mean integrating a single API.

Supporting ACP requires implementing several **protocol-level contracts** that allow AI agents and merchant systems to interoperate safely and reliably.

These bindings typically fall into the following categories:

1. API Contract  
2. Data Model (Commerce Schemas)  
3. Checkout State Model  
4. Interaction Flow  
5. Delegated Payment  
6. Product Discovery Interface  

---

# 1. API Contract

ACP defines a set of REST endpoints that allow AI agents to interact with merchant checkout systems.

Typical operations include:

- Creating a checkout session
- Updating checkout parameters
- Completing checkout
- Cancelling checkout

Example operations:
POST /checkouts
PATCH /checkouts/{id}
POST /checkouts/{id}/complete
POST /checkouts/{id}/cancel


These APIs enable AI agents to programmatically execute transactions rather than navigating a traditional checkout UI.

Official documentation:

- https://developers.openai.com/commerce/specs/checkout/
- https://github.com/agentic-commerce-protocol/agentic-commerce-protocol

The merchant backend returns the **full checkout state with each response**, allowing the AI agent to render the correct purchase status. :contentReference[oaicite:1]{index=1}

---

# 2. Data Model (Commerce Schemas)

ACP defines structured schemas for commerce objects to ensure interoperability between AI agents and merchant systems.

Examples of common objects include:

- Product
- Cart Item
- Checkout Session
- Order Confirmation
- Payment Token Reference

These schemas are typically defined using **OpenAPI and JSON Schema** within the ACP specification.

Example conceptual schema:
Product
id
name
price
currency
availability
merchant_id


Official reference:

- https://github.com/agentic-commerce-protocol/agentic-commerce-protocol

These standardized schemas allow AI agents to interpret and manipulate commerce objects consistently across merchants.

---

# 3. Checkout State Model

ACP uses a **state-driven checkout lifecycle** managed by the merchant backend.

Typical lifecycle states include:
CheckoutCreated
ItemsConfirmed
ShippingCollected
PaymentAuthorized
OrderConfirmed


The merchant system maintains the **authoritative state of the transaction**, and the AI agent synchronizes with this state after each API interaction.

Official documentation:

- https://developers.openai.com/commerce/specs/checkout/

The agent renders the checkout experience based on the state returned by the merchant system. :contentReference[oaicite:2]{index=2}

---

# 4. Interaction Flow (Agent–Merchant Conversation)

ACP defines the end-to-end transaction interaction between three actors:

- Buyer
- AI Agent
- Merchant System

Typical flow:
User request
↓
AI agent interprets intent
↓
Agent retrieves product information
↓
Agent creates checkout session
↓
Merchant validates order
↓
Payment authorization
↓
Order confirmation
↓
Agent returns confirmation to user


This model allows purchases to be completed directly inside AI interfaces without redirecting users to external checkout pages.

Official documentation:

- https://developers.openai.com/commerce/guides/key-concepts/

---

# 5. Delegated Payment

ACP uses a **delegated payment mechanism** that allows AI agents to initiate payments without accessing raw payment credentials.

Instead, payment providers generate secure tokens that can be passed through the protocol.

Example:
SharedPaymentToken (SPT)

The token is sent to the merchant backend, which completes the transaction using its payment provider.

Official documentation:

- https://docs.stripe.com/agentic-commerce/protocol

Shared payment tokens are time-limited and scoped to a specific transaction to improve security. :contentReference[oaicite:3]{index=3}

---

# 6. Product Discovery Interface

Before initiating checkout, AI agents must be able to discover products available for purchase.

ACP implementations typically provide product information via:

- product catalog APIs
- product feeds
- merchant inventory endpoints

Example product attributes:
product_id
name
price
availability
image
attributes


Providing structured product catalog data enables AI agents to search, recommend, and compare products.

Official reference:

- https://developers.openai.com/commerce/guides/get-started/

ACP implementations often require merchants to expose product feeds and checkout APIs for AI agents to interact with their commerce platform. :contentReference[oaicite:4]{index=4}

---

# Minimal ACP Integration Architecture

A minimal ACP-enabled architecture typically resembles the following:
User
↓
AI Agent / Super App
↓
ACP Client
↓
Merchant ACP Endpoint
↓
Merchant Commerce Platform
↓
Payment Provider
↓
Order Fulfillment


ACP defines the **transaction protocol between the AI agent platform and the merchant system**, while the merchant remains responsible for:

- pricing
- tax calculation
- fraud detection
- payment authorization
- order fulfillment

---

# Key Takeaway

Supporting ACP requires implementing a **multi-layer protocol contract**, not just an API integration.

| Layer | Responsibility |
|------|------|
| API | Checkout endpoints for agent interaction |
| Data Model | Structured commerce schemas |
| State Model | Checkout lifecycle management |
| Interaction Flow | Agent–merchant transaction protocol |
| Payment | Delegated payment tokens |
| Discovery | Machine-readable product catalog |

ACP therefore functions as the **execution layer of agentic commerce**, enabling AI agents to securely initiate and complete transactions on behalf of users.