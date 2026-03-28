# CLAUDE.md — Agent operating rules

## Before coding

- One issue = one precise objective. Do not drift.
- If the task is not trivial, start with analysis, then propose a short plan.
- Wait for validation before implementing when the scope is significant.

## During implementation

- Minimal changes. Do not refactor what isn't broken.
- Keep code simple, readable, testable.
- Do not invent structures, fields, or abstractions without clear necessity.
- Do not anticipate the next phase inside the current issue.
- Contract V2 is the source of truth: `docs/CONTRACT_V2.md`, `src/types.ts`, `engine/domain.py`, `src/data/mythology_data.json` must stay aligned.

## When in doubt

- Flag contract ambiguities explicitly — never compensate in silence.
- Ask rather than assume when scope or behavior is unclear.

## Project structure

- Frontend: React/TypeScript in `src/`, types in `src/types.ts`
- Backend: FastAPI/Python in `engine/`, models in `engine/domain.py`
- Data: single JSON file `src/data/mythology_data.json`
- Contract spec: `docs/CONTRACT_V2.md`
- Tests: `tests/` (Python), `src/components/__tests__/` (frontend)

## Build & test

- Frontend: `npm run build`, `npm test`
- Backend: `cd engine && python -m pytest tests/`
