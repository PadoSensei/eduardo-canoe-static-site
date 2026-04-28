# Learning Series 009: The "Source of Truth" Document

### Why do we extract this from the code?

Documentation often rots. By extracting the text directly from the translation files and the code's logic, we ensure the manual matches the **Production Reality**.

### 1. The Client's "Final Signature"

Before going live, the client must "own" the content. If a guest complains about a refund policy, Eduardo needs to know exactly what the system told them. This document acts as the legal and operational baseline.

### 2. Localization Integrity

In a multi-language system (PT, EN, ES, FR), it is easy for one language to fall behind. This audit forces us to see the "gaps"—ensuring that a Spanish-speaking guest gets the same "Iron Shield" protection and clarity as a Portuguese-speaking one.

### 3. Decoupling Logic from Language

By presenting the "19:00 Lock" as a business rule rather than a "cron job," we allow the client to think about his operations. If he decides 19:00 is too early, he can now request a change based on the **Manual**, not the code.
