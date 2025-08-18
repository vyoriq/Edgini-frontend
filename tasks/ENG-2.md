# ENG-2: Remove Subscription Check on Learn Page Reload

## Ticket Description
Remove the subscription check on page reload of learn page. Keep other functionality intact for now.

## Current Issue
The LearnPage.jsx has a useEffect (lines 289-325) that checks subscription status on every page reload, causing unnecessary API calls and delays.

## Tasks
- [x] Create ENG-2 ticket file in tasks folder
- [x] Remove subscription check useEffect from LearnPage.jsx (lines 289-325)  
- [x] Test learn page loads without subscription check on reload
- [x] Analyze current API calls in LearnPage.jsx on reload
- [x] Consolidate user and subscription_details API calls into single call
- [x] Test optimized API call implementation
- [x] Investigate duplicate subscription_details API calls on page reload
- [x] Fix duplicate fetchSubscriptionDetails calls by adding subscription fetch flag
- [x] Find Subscribe button in codebase  
- [x] Integrate create_subscription API on Subscribe button click
- [x] Test subscription creation functionality

## Files Modified
- `/src/components/LearnPage.jsx` - Remove subscription check useEffect and optimize fetchSubscriptionDetails() to use localStorage instead of supabase.auth.getUser() API call
- `/src/components/PlanCard.jsx` - Integrate create_subscription API on Subscribe button click

## Changes Made
1. **Removed redundant subscription check useEffect** - Eliminated lines 289-325 that were checking subscription on page reload
2. **Optimized fetchSubscriptionDetails()** - Changed from `supabase.auth.getUser()` API call to reading userId from localStorage (userProfile.userId)
3. **Reduced API calls** - Now only makes 1 API call (`/subscription_details`) instead of 2 calls (`getUser` + `/subscription_details`)
4. **Fixed duplicate API calls** - Added `subscriptionFetched` state flag to prevent React StrictMode from causing duplicate API calls on component mount
5. **Prevented React StrictMode double execution** - Component now makes only 1 API call even with React StrictMode enabled in development
6. **Integrated create_subscription API** - Added handleSubscribe function in PlanCard component that calls the backend create_subscription endpoint
7. **Enhanced Subscribe button functionality** - Button now creates actual subscriptions with proper user_id, tier mapping, and subscription dates

## Status: Completed
- Created: 2025-08-18
- Priority: High

---