# 🤝 Contributing to Ionity Central

Thank you for your interest in contributing to **Ionity Central** — the enterprise unified workspace, CRM, and AI platform by Ionity Global (Pty) Ltd.

---

## 📋 Before You Start

1. **Read the [README](README.md)** to understand the project architecture.
2. **Browse the [wiki/](wiki/)** for module-level documentation.
3. **Check open issues** before creating a new one.
4. **All contributions** require the Contributor to agree to the Apache 2.0 license terms.

---

## 🌿 Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Firebase on push |
| `dev` | Integration branch for in-progress features |
| `feature/<name>` | New features or module additions |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation updates |

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Create a fix branch
git checkout -b fix/issue-123
```

---

## 🚀 Development Setup

```bash
git clone https://github.com/Ionity-Global-Pty-Ltd/ionity-central.git
cd ionity-central
python -m http.server 8080
# → Open http://127.0.0.1:8080
```

No build step is required — the project is pure HTML/CSS/JS (ES2024 Modules).

---

## 📐 Code Style

- **JavaScript**: ES2024 vanilla JS. No frameworks, no bundlers. Use `const`/`let`, arrow functions, and async/await.
- **CSS**: Vanilla CSS3 with CSS custom properties (design tokens in `css/main.css`). No preprocessors.
- **HTML**: Semantic HTML5. Use `aria-*` attributes on interactive elements.
- **Comments**: Minimal inline comments. Prefer self-documenting naming. Add a JSDoc block for public module functions.
- **File naming**: `kebab-case` for CSS; `camelCase` for JS module files (matching existing convention).

---

## ✅ Contribution Checklist

Before submitting a Pull Request:

- [ ] Code follows the existing style (no framework imports, pure vanilla JS/CSS)
- [ ] New JS module registered in `index.html` script tags
- [ ] New CSS file linked in `index.html` stylesheet links
- [ ] Tested locally with `python -m http.server 8080`
- [ ] Tested across Chrome (primary), Firefox, and Edge
- [ ] No console errors or warnings introduced
- [ ] Wiki page updated or created if a new module was added
- [ ] `README.md` updated if a new module or file was added to the tree
- [ ] No secrets, API keys, or credentials committed

---

## 🐛 Reporting Bugs

Open an issue with:
1. **Description**: Clear description of the bug.
2. **Steps to reproduce**: Numbered step-by-step.
3. **Expected behavior**: What should happen.
4. **Actual behavior**: What actually happens.
5. **Browser & OS**: Chrome 120+ / Firefox 120+ / Edge + Windows/Mac/Linux.
6. **Console errors**: Copy any errors from DevTools Console.

---

## 💡 Requesting Features

Open an issue with the **Enhancement** label and describe:
1. The problem you are solving.
2. Your proposed solution.
3. Any alternative approaches considered.

---

## 📜 License

By contributing, you agree your contributions are licensed under the [Apache License 2.0](LICENSE).  
Copyright © 2026 Ionity Global (Pty) Ltd & Antwerp Designs.
