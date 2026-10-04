# Project Instructions

## Technology and Structure

- Use only HTML, CSS, and vanilla JavaScript.
- Keep HTML, CSS, and JavaScript in separate files.
- Do not add frameworks, external libraries, build tools, or APIs.

## Coding Standards

- Use clear, descriptive names.
- Prefer small functions with a single responsibility.
- Avoid duplicated logic and unnecessary complexity.
- Add comments only when they explain non-obvious behavior.

## Functional Requirements

- Reject empty or whitespace-only ticket titles.
- Validate required fields before saving.
- Update status counts whenever tickets change.
- Persist ticket changes to localStorage.
- Handle missing or invalid stored data without crashing.
- Confirm destructive actions such as deleting a ticket when appropriate.

## Quality and Accessibility

- Use semantic HTML and accessible labels.
- Support keyboard interaction and visible focus states.
- Make the layout responsive on desktop and mobile.
- Do not use unsafe HTML injection to display user-entered values.
- Use text labels as well as color to communicate priority and status.

## Working Practices

- Inspect existing files before modifying them.
- Explain the implementation plan before broad changes.
- Preserve existing working behavior when adding a feature.
- Test the main user flows where possible.
- Do not claim a test passed unless it was actually run.
- Summarize changes, assumptions, and anything still needing verification.

## Skills to Prioritize

- Ticket workflow management: create, update, delete, filter, and prioritize tickets.
- Form validation and UX: reject bad input, surface clear errors, and keep fields consistent.
- State management: keep ticket lists, counters, and localStorage data synchronized.
- Accessibility review: verify labels, focus states, keyboard support, and screen-reader clarity.
- Responsive UI refinement: improve layout and usability across mobile and desktop sizes.
- Bug triage: diagnose missing state updates, stale data, and broken interactions quickly.
- Data safety: handle corrupted or missing saved data without crashing or exposing unsafe UI output.


