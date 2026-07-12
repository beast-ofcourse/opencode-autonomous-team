# Contributing to opencode-autonomous-team

Thank you for your interest in contributing! This document outlines the process for reporting issues and submitting changes.

## Bug Reports

If you find a bug, please open a GitHub issue with the following information:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Your environment (OS, Node version, OpenCode version)
- Screenshots or logs if helpful

## Feature Requests

Feature requests are welcome. Open a GitHub issue describing:

- What problem you are trying to solve
- How you envision the feature working
- Any alternatives you have considered
- Why this would benefit the project

## Pull Request Workflow

1. **Fork** the repository to your own GitHub account.
2. **Create a branch** from `main` with a descriptive name (`fix/issue-description` or `feat/feature-name`).
3. **Make your changes**, keeping them focused on the issue at hand.
4. **Follow existing code style and patterns** used throughout the project. Consistency matters more than personal preference.
5. **Add or update tests** as needed. Run the test suite with:

   ```bash
   npm test
   ```

   All tests must pass before a PR can be merged.
6. **Commit your changes** with a clear commit message describing what and why.
7. **Push your branch** and open a pull request against `main`.
8. In your PR description, reference any related issues and describe what your changes do.

## Code Style

- Match the conventions you see in the existing codebase.
- Keep changes minimal and focused. Avoid unrelated formatting or refactoring.
- Write meaningful commit messages that explain the motivation behind the change.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and constructive in all interactions.

## Questions

If you have questions about contributing, open a GitHub issue with your question.
