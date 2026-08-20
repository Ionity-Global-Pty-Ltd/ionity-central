# 🧠 Local Tiny AI & Semantic RAG Vector Cache

Ionity Central includes a built-in on-device AI engine that runs completely locally in the browser cache, combined with a local semantic Retrieval-Augmented Generation (RAG) knowledge index.

## 1. Local Tiny AI Engine (`LocalTinyAI`)
- **Execution**: 100% on-device inside browser cache.
- **Window.AI / Gemini Nano Bridge**: If running in modern Chrome with Built-in Prompt API (`window.ai`), executes against the on-device Gemini Nano model with zero network traffic.
- **In-Cache Neural Fallback**: Fast local synthesis engine providing 0ms responses for proposal generation, executive debriefs, and architecture specs.
- **Token Usage**: 0 tokens consumed from cloud quotas.

## 2. Local Semantic RAG Cache (`LocalRAGService`)
The RAG engine tokenizes and indexes all workspace entities:
1. **Unity Documents**: Block contents, headings, tables, and notes.
2. **CRM Pipeline**: Deals across Check-in, Quoted, Followed Up, and Paid.
3. **SCRUM Backlog**: User stories, sprint points, and acceptance criteria.

### Relevance Scoring
Uses BM25 / TF-IDF keyword frequency and semantic token matching to extract top-K contextual snippets, automatically injected into AI prompts for hyper-contextual answers.

## 3. Cloud VM Free Backup
- 1-Click snapshot backup sends RAG vector embeddings to `ionity-central-vm` and `gs://ionity-storage-root/rag-cache.json`.
- Restores embeddings seamlessly across team devices.
