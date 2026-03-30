# Copilot Instructions — Living Archives

## Design principles

- Choose the simplest solution that fully covers the need.
- No over-engineering, no premature abstraction.
- Clarity and maintainability before sophistication.
- Respect existing project conventions (Contract V2, file structure, naming).
- Do not introduce new layers, patterns, or dependencies without immediate, proven benefit.

## Working rules

- Stay strictly within the scope of the active issue.
- Make minimal, targeted changes — touch only what the issue requires.
- Propose a short plan before coding when the task is non-trivial.
- Do not prepare for hypothetical future needs.
- Do not widen the scope of an issue without explicit justification.
- Preserve Contract V2 consistency: data schema, type definitions, and backend models must stay aligned.
- If a contract ambiguity surfaces, flag it — do not silently compensate.

## Code standards

- Keep code simple, readable, testable.
- Do not invent data structures or fields without necessity.
- Run existing linters and tests after changes.
- Update documentation only when directly related to the change.
- Comments only where clarification is genuinely needed.
