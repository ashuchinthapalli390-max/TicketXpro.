# Security Specification - Entertainment Platform

## Data Invariants
1. `entertainment` documents must have a valid `type` (movie/event).
2. Users can only read `entertainment` data.
3. Only authenticated admins (checked via `admins` collection) can create/update/delete entertainment.

## The Dirty Dozen Payloads
1. Unauthorized write to `entertainment`.
2. Missing `title` on creation.
3. Invalid `type` (e.g., "unknown").
4. XSS in `title` (long string).
5. Attempting to delete without admin rights.
6. Overwriting `createdAt` with client time.
7. Injecting 1MB junk data into `venue`.
8. Creating a movie with negative `price`.
9. Modifying `district` to a non-existent one.
10. Querying all users (if collection existed).
11. Bypassing check for `email_verified`.
12. Mass deletion of the collection.

## Tests
Verification will be performed via rules deployment and manual check of the logic.
