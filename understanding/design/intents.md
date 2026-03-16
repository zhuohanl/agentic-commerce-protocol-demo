# Recommended MVP intent list
1️⃣ Discovery intents (MCP)

These call internal tools.

search_products
browse_category
filter_products
get_product_details
compare_products

Example user queries:

"Show me blue shirts"
"What are the cheapest laptops?"
"Tell me more about this product"

These map to:

MCP → catalog
MCP → ranking

2️⃣ Evaluation intents (MCP)

These refine the product selection.

rank_offers
sort_by_price
apply_filters
recommend_products

Example queries:

"Show cheaper options"
"Which one is best rated?"

3️⃣ Merchant validation intents (A2A)

These involve another agent.

check_availability
confirm_price
reserve_item

Example:

"Is this still in stock?"

Flow:

Planner → A2A → Merchant Agent

4️⃣ Checkout intents (ACP)

These start the transaction.

start_checkout
update_checkout
confirm_order
cancel_checkout

Example:

"I'll buy this one"

Flow:

Planner → ACP → Merchant API

5️⃣ Payment intents (ACP)

These finalize the purchase.

complete_payment
confirm_payment

Example:

"Pay now"

Flow:

ACP → merchant checkout
→ PSP payment

6️⃣ System intents (agent control)

These are needed for conversation control.

help
cancel
restart
fallback

These keep the conversation robust.

# Final MVP intent table

Here is a clean list suitable for your MVP.

| Category | Intent |
|---|---|
| Discovery | search_products |
| Discovery | browse_category |
| Discovery | get_product_details |
| Evaluation | rank_offers |
| Evaluation | filter_products |
| Evaluation | compare_products |
| Merchant coordination | check_availability |
| Merchant coordination | reserve_item |
| Checkout | start_checkout |
| Checkout | update_checkout |
| Checkout | confirm_order |
| Payment | complete_payment |
| System | cancel |
| System | help |

Total:

~12–15 intents

This is a perfect size for MVP.

# Map intents to your architecture

This mapping ensures the system remains deterministic.

| Intent | Layer | Protocol |
|---|---|---|
| search_products | MCP | tool call |
| rank_offers | MCP | tool call |
| check_availability | A2A | merchant agent (read-only, during discovery) |
| reserve_item | A2A | merchant agent (soft lock with TTL, at checkout) |
| start_checkout | ACP | create session |
| confirm_order | ACP | checkout |
| complete_payment | ACP | payment |