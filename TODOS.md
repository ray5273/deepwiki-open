# TODOS

Deferred items from the Internal Documentation Automation plan (2026-04-25).

## Phase 2: Backend Prompt API + Automation

- [ ] **Delta regeneration**: git diff-based change detection + partial regeneration. Expected to reduce model server load by ~90%.
- [ ] **Backend prompt migration**: Move prompts from `src/prompts/wiki.ts` to `api/prompts.py` and expose via API endpoint. Consolidates all prompts in one place.
- [ ] **Generalized language prompt abstraction**: Replace per-language style guide with a configurable language template system.
- [ ] **CI/CD integration**: Auto-regenerate wiki on push to main branch.

## Phase 3: Distribution + Customization

- [ ] **Confluence/Notion integration**: API integration to publish generated docs directly to internal documentation systems.
- [ ] **Team-specific custom templates**: Allow different teams to define their own wiki structure templates and style guides.

## Technical Debt

- [ ] **page.tsx refactoring**: The main wiki page component (~2300 lines) should be broken into smaller components. The prompt extraction in Phase 1 is a first step.
