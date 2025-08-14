# ENG-1: Query Usage Info and Upgrade Popup Implementation

## Task Description
Implement query usage information display on the LearnPage with subscription upgrade functionality:
- Show query limit from subscription_details API 
- Display query_usage from /curate API
- Handle "Daily query limit reached" exception with upgrade popup
- Redirect to subscription page if user chooses to upgrade

## Impacted Files Analysis

### Primary Files to Modify:
1. **src/components/LearnPage.jsx** - Main component to add usage display and popup
2. **src/components/SubscriptionPage.jsx** - Ensure proper subscription handling
3. **src/api/curate.js** - May need to update for new API response handling

### Supporting Files:
- **src/lib/supabaseClient.jsx** - For subscription_details API calls
- **public/locales/{lang}/translation.json** - For internationalization strings

## Current State Analysis

### LearnPage.jsx Current Implementation:
- ✅ Already has subscription checking logic (lines 116-170)
- ✅ Already has query limit handling with hardcoded limits
- ✅ Already navigates to subscription page when limit exceeded
- ❌ Missing query usage display UI
- ❌ Missing upgrade popup functionality
- ❌ Missing integration with subscription_details API
- ❌ Missing proper exception handling for "Daily query limit reached"

### API Integration Current State:
- ✅ /curate API call exists (line 62-66)
- ❌ Missing subscription_details API integration
- ❌ Missing proper error handling for query limit exception

### Subscription Page Current State:
- ✅ Basic subscription plans display
- ❌ Missing current user tier integration
- ❌ Missing upgrade flow handling

## Detailed Implementation Plan

### Phase 1: API Integration and Data Structure
1. **Update LearnPage to fetch subscription_details** from backend API endpoint
2. **Update curate API handling** to capture query_usage from response
3. **Add proper error handling** for "Daily query limit reached" exception

### Phase 2: UI Components Development
1. **Query Usage Display Component**
   - Show current usage vs limit
   - Progress bar visualization
   - Real-time updates
2. **Upgrade Popup Modal**
   - Responsive modal design
   - Yes/No upgrade options
   - Accessibility compliant

### Phase 3: Integration and Flow
1. **Integrate query usage display** in LearnPage sidebar
2. **Implement popup trigger** on query limit exception
3. **Add navigation handling** for upgrade flow
4. **Update subscription page** to handle upgrade context

### Phase 4: Security and VAPT Compliance
1. **Input validation** for all API calls
2. **Secure error handling** without exposing sensitive data
3. **Rate limiting protection**
4. **XSS prevention** in dynamic content
5. **CSRF protection** for subscription changes

### Phase 5: Testing and Error Handling
1. **Edge case testing** - network failures, invalid responses
2. **User experience testing** - loading states, error messages
3. **Cross-browser compatibility**
4. **Mobile responsiveness**

## Security Considerations
- Validate all API responses before processing
- Sanitize user input and API data
- Implement proper error boundaries
- Use secure storage for sensitive data
- Follow OWASP guidelines for web security
- Implement rate limiting to prevent abuse
- Add logging for security monitoring

## Progress Tracking
- [x] Phase 1: API Integration and Data Structure
  - [x] Added fetchSubscriptionDetails() function to call backend subscription_details API
  - [x] Updated curate API handling to capture query_usage from response
  - [x] Added proper error handling for "Daily query limit reached" exception
- [x] Phase 2: UI Components Development
  - [x] Created renderQueryUsage() component with progress bar visualization
  - [x] Created renderUpgradePopup() modal component with Yes/No options
- [x] Phase 3: Integration and Flow
  - [x] Integrated query usage display in LearnPage sidebar
  - [x] Added upgrade popup to main render with proper navigation
  - [x] Updated subscription checking to use new API with fallback
- [ ] Phase 4: Security and VAPT Compliance
- [ ] Phase 5: Testing and Error Handling

## Implementation Details

### API Integration (Phase 1)
1. **fetchSubscriptionDetails()** - Line 42-76 in LearnPage.jsx
   - Calls `http://localhost:8000/subscription_details?user_id={user_id}` with user_id parameter
   - Sets daily_limit from subscription_details API response
   - Includes error handling and auth validation
   - Called on component mount to initialize daily limit
   
2. **Enhanced handleSubmit()** - Line 78-152 in LearnPage.jsx
   - Added specific handling for "Daily query limit reached" exception
   - Updates current usage from query_usage field in /curate API response
   - Triggers upgrade popup on limit exceeded

### Data Flow:
- **Daily Limit**: Fetched from `subscription_details` API (`daily_limit` field) 
- **Current Usage**: Updated from `/curate` API response (`current` field)
- **Query Usage State**: Combines limit from subscription_details and current from curate

### API Response Fields:
- `/subscription_details`: Uses `daily_limit` field for limit
- `/curate`: Uses `current` field for current usage count

### UI Components (Phase 2)
1. **renderQueryUsage()** - Line 158-200 in LearnPage.jsx
   - Shows current usage vs daily limit with progress bar
   - Color-coded progress (green/yellow/red based on usage)
   - Handles unlimited plans (Pro)
   
2. **renderUpgradePopup()** - Line 206-251 in LearnPage.jsx
   - Modal overlay with upgrade options
   - "Upgrade Plan" button navigates to /subscription
   - "Stay on Current Plan" button closes popup
   - Accessible design with proper z-index

### Integration (Phase 3)
1. **Updated useEffect subscription check** - Line 281-317 in LearnPage.jsx
   - Uses new fetchSubscriptionDetails() API
   - Includes fallback to local Supabase check
   - Proper error handling and navigation

2. **UI Integration**
   - Query usage display added to sidebar after goal section
   - Upgrade popup rendered at root level with fixed positioning

## Files to be Modified
- src/components/LearnPage.jsx
- src/api/curate.js (potential updates)
- src/lib/supabaseClient.jsx (potential updates)
- public/locales/{lang}/translation.json (for new strings)

## Technical Notes
- Current /curate API endpoint: http://localhost:8000/curate
- Subscription data stored in Supabase 'subscriptions' table
- User profile data in 'user_profiles' table with daily_query_count
- Using React hooks for state management
- Tailwind CSS for styling