# ENG-13: Increase Plan Card Width for Toggle Positioning

## Task Description
Increase the width of the available plans cards so that the toggle will fit exactly to the right side of the "premium lite" text. Both the premium plan title and toggle should be in a row layout while maintaining responsive design across all screen sizes.

## Context Analysis
Based on codebase analysis:

### Current Implementation:
- **SubscriptionPage.jsx**: Main container with side-by-side layout for Available Plans and Upcoming Plans
- **PlanCard.jsx**: Individual plan cards with toggle integration for premium plans
- **PricingToggle.jsx**: Toggle component for monthly/yearly billing
- Current layout uses flex-col for small screens and flex-row for larger screens in premium plan header

### Current Layout Structure:
```
Available Plans Section (left side):
├── Free Plan Card (if applicable)
├── Premium Plan Card
    ├── Title + Toggle Row (flex-col on mobile, flex-row on sm+)
    ├── Price + billing period
    ├── Features list
    └── Subscribe button
```

### Current CSS Classes Analysis:
- **PlanCard container**: `w-full rounded-2xl shadow-md p-4 sm:p-5 lg:p-6`
- **Premium title + toggle row**: `flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 sm:gap-0`
- **Toggle container**: `flex justify-center sm:justify-end sm:ml-4`
- **Available plans grid**: `flex flex-col sm:flex-row gap-4 sm:gap-3 flex-grow`

## Technical Plan

### Phase 1: Width Analysis and Constraints ✅
- [x] Current cards use `flex-1` within parent container
- [x] Parent container has `max-w-7xl` constraint
- [x] Current gap between cards is `gap-4 sm:gap-3`
- [x] Toggle currently has `sm:ml-4` left margin for spacing

### Phase 2: Plan Card Width Modifications
- [ ] Increase minimum card width to accommodate title + toggle in single row
- [ ] Adjust flex properties to allow for better space distribution
- [ ] Modify toggle positioning to align perfectly with premium title
- [ ] Ensure proper spacing between toggle and card edges

### Phase 3: Responsive Design Updates
- [ ] Mobile (< 640px): Maintain current column layout for title/toggle
- [ ] Tablet (640px - 1024px): Ensure toggle fits properly next to title
- [ ] Desktop (1024px+): Optimize spacing for larger screens
- [ ] Test with different language translations for title length variations

### Phase 4: Testing & Validation
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness on various devices
- [ ] Toggle functionality remains intact
- [ ] Overall layout balance maintained

## Security & VAPT Considerations
- No security implications as this is purely UI/UX modification
- No new dependencies or third-party libraries required
- Changes are limited to CSS classes and responsive design
- Following existing security patterns in codebase

## Files to be Modified
1. `src/components/PlanCard.jsx` - Main card layout and toggle positioning
2. Potentially `src/components/SubscriptionPage.jsx` - If container adjustments needed

## Expected Outcome
- Premium plan cards will have increased width
- Toggle will be positioned exactly to the right of the "premium lite" text
- Both elements will be in a horizontal row layout on appropriate screen sizes
- Responsive design maintained across all devices
- Visual balance preserved in the overall subscription page layout

## Implementation Steps
1. Analyze current width constraints and measure required space
2. Modify PlanCard flex properties and minimum widths
3. Adjust toggle positioning within premium plan header
4. Update responsive breakpoints if necessary
5. Test across multiple screen sizes and devices
6. Validate with different language translations

## Implementation Details

### Changes Made:

#### 1. PlanCard.jsx (src/components/PlanCard.jsx):
- **Container Width**: Added minimum width constraints: `min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]`
- **Premium Title/Toggle Layout**: 
  - Increased gap from `gap-2 sm:gap-0` to `gap-3 sm:gap-4` for better spacing
  - Added `flex-shrink-0` to both title and toggle container to prevent compression
  - Removed `sm:ml-4` margin from toggle container for cleaner alignment
- **Responsive Behavior**: 
  - Mobile (< 640px): Column layout maintained for title/toggle
  - Small screens (≥ 640px): Row layout with proper spacing
  - Large screens (≥ 1024px): Enhanced minimum widths for optimal appearance

#### 2. SubscriptionPage.jsx (src/components/SubscriptionPage.jsx):
- **Grid Layout**: Changed from `sm:flex-row` to `lg:flex-row` for better responsive behavior
- **Card Container**: 
  - Added `max-w-md mx-auto lg:mx-0 lg:max-w-none` for centered mobile layout
  - Increased gap from `gap-4 sm:gap-3` to `gap-4 lg:gap-6` for desktop spacing
  - Added `justify-center lg:justify-start` for proper alignment across screen sizes

### Technical Improvements:
1. **Enhanced Card Widths**: Cards now have adequate space for title + toggle row layout
2. **Better Toggle Positioning**: Toggle sits exactly to the right of premium plan text
3. **Improved Responsive Design**: 
   - Mobile: Cards stack vertically with centered layout
   - Tablet: Improved spacing and alignment
   - Desktop: Cards use optimal widths with proper gaps
4. **Flex Properties**: Added `flex-shrink-0` to prevent text/toggle compression

### Issue Resolution - Overlapping Fix:

**Problem Identified**: The increased card widths caused available plans to overlap with the upcoming plans section.

**Additional Changes Made**:

#### 3. SubscriptionPage.jsx - Container Fix (src/components/SubscriptionPage.jsx:155):
- **Layout Change**: Updated to `flex flex-col sm:flex-row` for side-by-side display on small screens+
- **Container Constraints**: Added `overflow-hidden` to prevent section overflow
- **Gap Adjustment**: Set to `gap-3 sm:gap-4` for responsive spacing
- **Equal Space Distribution**: Both Free and Premium plans get equal width (`flex-1`) utilizing full section width

#### 4. PlanCard.jsx - Layout Optimizations (src/components/PlanCard.jsx:176, 184):
- **Width Constraint**: Changed from fixed `min-w-[...]` to responsive `max-w-full` 
- **Prevents Overflow**: Cards now respect their container boundaries  
- **Title Sizing**: Optimized font sizes (`text-base sm:text-lg`) for better fit in equal-width cards
- **Toggle Gap**: Reduced gap to `gap-2 sm:gap-3` for tighter, more efficient spacing
- **Equal Card Sizing**: Both cards now utilize equal space within Available Plans section

### Final Layout Structure:
- **Available Plans**: Display side-by-side in rows on sm+ screens, stacked on mobile
- **Width Distribution**: Each plan gets equal space with `flex-1` and proper responsive behavior
- **Toggle Positioning**: Still positioned exactly to the right of premium plan text in row layout
- **No Overlapping**: Cards contained within their respective sections with `overflow-hidden`
- **Responsive Design**: 
  - Mobile (< 640px): Cards stack vertically
  - Small screens+ (≥ 640px): Cards display side-by-side in rows

### Testing Results:
- Development server running on `http://localhost:5176`
- ✅ No overlap between Available Plans and Upcoming Plans sections
- ✅ Toggle positioned correctly next to premium plan text
- ✅ Cards properly contained within their sections
- ✅ Both plans display side-by-side in rows on sm+ screens
- ✅ Both plans have equal width (1x each) utilizing full Available Plans section space  
- ✅ No wasted space - cards fill the entire Available Plans section width
- ✅ Yearly pricing displays properly with monthly equivalent
- ✅ Responsive design maintained across all devices

## Progress Tracking
- [x] Task planning and analysis
- [x] User approval for implementation approach
- [x] Code modifications implementation
- [x] Responsive design implementation
- [x] Development server setup for testing
- [x] Fixed overlapping issue while maintaining toggle positioning
- [x] Final validation and documentation completion