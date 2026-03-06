# Changesets

This directory contains the changeset configuration and changeset markdown files. When a developer wants to publish a change, they run `pnpm changeset`, select the packages they want to release, pick a version bump, and write a small message. This creates a markdown file in this folder which gets committed.

During the release process, the `pnpm version-packages` script will consume these files, automatically determine the correct semantic version bump for all packages (including dependents), and update their `CHANGELOG.md` files.

For more information, see the [Changesets documentation](https://github.com/changesets/changesets).
