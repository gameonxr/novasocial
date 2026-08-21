# NovaSocial Learning Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Learning feature.

## Contract

`showLearning()` creates a `🎓 Learning` modal and renders a Learning Hub with a Continue Learning panel and six course cards: Flutter Basics, Python Mastery, UI/UX Design, Digital Marketing, AI & ML Basics, and Content Creation.

Each course card preserves its title, lesson count, progress percentage, icon, gradient, and `startCourse(title)` click routing. Courses with progress above zero render the progress bar; the zero-progress course does not. `startCourse(title)` emits the existing starting toast and closes the modal without owning lesson persistence or course navigation.

The harness is static and documentation-only. It does not open the Learning modal or start a course.

## Harness coverage

`docs/learning-contract-harness.js` validates modal construction, Learning Hub labels, six course fixtures, metadata markers, progress conditional, startCourse routing, toast feedback, and modal closure.

## References

1. [`learning.js`](../src/features/learning.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

