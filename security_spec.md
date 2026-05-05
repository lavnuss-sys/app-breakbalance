# Security Spec

## Data Invariants
- A user document can only be created or modified by the user who owns it (`request.auth.uid == userId`).
- The user's UID in the document must match their authentication ID.
- `pet_points` cannot be negative.
- `stats` must have all its required properties.
- `createdAt` is immutable.
- `updatedAt` must be updated on changes.

## The "Dirty Dozen" Payloads
1. Create user document with wrong `uid`.
2. Update user document with additional ghost fields (e.g., `isAdmin`).
3. Update user document but skip `updatedAt`.
4. Update `createdAt` (trying to mutate immutable field).
5. Inject an array larger than 100 into `pet_purchased`.
6. Negative `pet_points`.
7. `appStatus` not from the allowed enum.
8. Unauthenticated read of any user document.
9. Authenticated read of someone else's user document.
10. Update deleting required fields (e.g., omitting `stats`).
11. Update someone else's document.
12. Create document with `userId` larger than 128 chars.
