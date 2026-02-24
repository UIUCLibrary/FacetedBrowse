# Accessibility Testing Guide for Radio Button Navigation

## Overview

This document describes the accessibility improvements made to the FacetedBrowse module for Omeka S, specifically addressing keyboard navigation and selection of radio button options in facet filters.

## Issues Fixed

### 1. Radio Button Keyboard Accessibility
**Problem**: Radio button options were not fully accessible to keyboard users. Users could only toggle the first radio option, selection required Shift+Space, and it was impossible to select or deselect other options using standard keyboard commands.

**Root Cause**: The radio button event handlers were only listening for `click` events, which are primarily triggered by mouse interactions. Keyboard navigation (Space/Enter keys) triggers `change` events instead.

**Solution**: Added `change` event listeners alongside existing `click` event listeners for all radio button inputs in the following files:
- `asset/js/facet-render/value.js` (already fixed in previous commit)
- `asset/js/facet-render/item-set.js`
- `asset/js/facet-render/resource-class.js`
- `asset/js/facet-render/resource-template.js`

### 2. Switch Statement Fall-through Bug
**Problem**: Missing `break` statements in switch cases caused unintended fall-through behavior, where selecting a single radio button option would incorrectly trigger the multiple selection logic.

**Solution**: Added missing `break;` statements in the `single_list` case of the switch statements in:
- `asset/js/facet-render/item-set.js`
- `asset/js/facet-render/resource-class.js`
- `asset/js/facet-render/resource-template.js`
- `asset/js/facet-render/value.js` (fixed missing semicolon)

## Code Changes

### Before
```javascript
// Only click event
container.on('click', 'input.item-set', function(e) {
    // ...
});

// Missing break statement
switch (facetData.select_type) {
    case 'single_list':
        // ...
    case 'multiple_list':  // Falls through!
        // ...
        break;
}
```

### After
```javascript
// Both click and change events
container.on('click change', 'input.item-set', function(e) {
    // ...
});

// Proper break statement
switch (facetData.select_type) {
    case 'single_list':
        // ...
        break;  // Prevents fall-through
    case 'multiple_list':
        // ...
        break;
}
```

## Manual Accessibility Testing Strategy

### Prerequisites
- A modern screen reader (NVDA, JAWS, VoiceOver, or similar)
- A working Omeka S installation with FacetedBrowse module enabled
- A faceted browse page with radio button filters configured

### Keyboard Navigation Tests

#### Test 1: Tab Navigation
1. Navigate to a faceted browse page with radio button filters
2. Use **Tab** key to move through page elements
3. **Expected**: Focus should move to each radio button in sequence
4. **Verify**: Each radio button should receive visible focus indicator

#### Test 2: Arrow Key Navigation (Within Radio Group)
1. Use **Tab** to focus the first radio button in a group
2. Use **Arrow Up/Down** or **Arrow Left/Right** keys
3. **Expected**: Focus should move between radio buttons in the same group
4. **Verify**: Only one radio button in the group should be selected at a time

#### Test 3: Space Key Selection
1. Use **Tab** to focus a radio button
2. Press **Space** key
3. **Expected**: The focused radio button should be selected
4. **Verify**: 
   - Previously selected radio in the group becomes unselected
   - Faceted search updates without page reload
   - No unintended navigation occurs

#### Test 4: Enter Key Selection
1. Use **Tab** to focus a radio button
2. Press **Enter** key
3. **Expected**: The focused radio button should be selected
4. **Verify**: Same results as Space key test

#### Test 5: Deselection
1. Select a radio button using keyboard
2. Press **Space** or **Enter** again on the same radio button
3. **Expected**: The radio button should be deselected (if the implementation allows)
4. **Verify**: Faceted search clears that filter

### Screen Reader Tests

#### Test 6: Radio Button Announcement
1. Enable screen reader
2. Navigate to faceted browse page
3. Use **Tab** or arrow keys to navigate radio buttons
4. **Expected**: Screen reader should announce:
   - The radio button label/text
   - "Radio button" or similar control type
   - Current state ("checked" or "not checked")
   - Position in group (e.g., "1 of 5")

#### Test 7: Selection Feedback
1. With screen reader active, select a radio button using keyboard
2. **Expected**: Screen reader should announce:
   - The selection action
   - New state of the radio button
   - Any dynamic content updates

### Browser Compatibility Tests
Test the above scenarios in:
- Chrome/Edge (Windows, macOS, Linux)
- Firefox (Windows, macOS, Linux)
- Safari (macOS, iOS)

### Assistive Technology Compatibility
Test with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- ChromeVox (Chrome)

## Verification Checklist

- [ ] All radio buttons can be reached via Tab key
- [ ] Arrow keys navigate between radio buttons in a group
- [ ] Space key selects/deselects radio buttons
- [ ] Enter key selects radio buttons
- [ ] Only one radio button per group can be selected
- [ ] Selection triggers faceted search update
- [ ] No page reload occurs on selection
- [ ] No unintended navigation occurs
- [ ] Screen reader announces radio buttons correctly
- [ ] Screen reader announces selection changes
- [ ] Visual focus indicators are visible
- [ ] Works across major browsers
- [ ] Works with major screen readers

## ARIA Attributes

The radio buttons in the template files already use native HTML `<input type="radio">` elements with proper attributes:
- `type="radio"` - Declares the element as a radio button
- `name` attribute - Groups radio buttons together (e.g., `name="value_123"`)
- `data-*` attributes - Store metadata for JavaScript handlers

Native HTML radio buttons have built-in ARIA semantics and keyboard behavior, which is why proper event handling is critical for accessibility.

## Additional Notes

- Radio buttons are rendered in `<ul class="select-list">` lists within `<label>` elements for better accessibility
- The `change` event is the standard way to detect keyboard-triggered selection changes on form controls
- Both `click` and `change` events are retained to support both mouse and keyboard users
- The fixes ensure no regression for mouse users while enabling keyboard accessibility

## References

- [MDN: Radio Button Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radio_role)
- [W3C ARIA: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
