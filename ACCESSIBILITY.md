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

### 3. Arrow Key Navigation Auto-Submit Issue
**Problem**: Arrow key navigation was selecting radio buttons and immediately triggering page submission/reload. This was not the desired keyboard behavior - arrow keys should move focus only, not select.

**Root Cause**: By default, browser behavior for radio buttons causes arrow keys to both move focus AND select the radio button, triggering the `change` event immediately.

**Solution**: Implemented custom keyboard navigation that:
- **Arrow keys (Up/Down/Left/Right)**: Prevent default behavior and only move focus between radio buttons (no selection)
- **Space/Enter keys**: Select the currently focused radio button and trigger submission
- **Click**: Select and submit immediately (preserved existing mouse behavior)

This approach provides better keyboard UX by decoupling focus from selection, allowing users to explore options before committing to a selection.

## Code Changes

### Before (Original)
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

### After (Current Implementation)
```javascript
// Handle keyboard navigation for radio buttons
container.on('keydown', 'input.value[type="radio"]', function(e) {
    const currentRadio = $(this);
    const radioGroup = currentRadio.closest('.select-list');
    const allRadios = radioGroup.find('input.value[type="radio"]').filter(':visible');
    const currentIndex = allRadios.index(currentRadio);
    
    // Arrow keys: prevent default selection behavior and just move focus
    if (e.keyCode === 38 || e.keyCode === 37) { // Up or Left arrow
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allRadios.length - 1;
        allRadios.eq(prevIndex).focus();
    } else if (e.keyCode === 40 || e.keyCode === 39) { // Down or Right arrow
        e.preventDefault();
        const nextIndex = currentIndex < allRadios.length - 1 ? currentIndex + 1 : 0;
        allRadios.eq(nextIndex).focus();
    } else if (e.keyCode === 32 || e.keyCode === 13) { // Space or Enter
        // Prevent default, check the radio, then trigger our handler
        e.preventDefault();
        currentRadio.prop('checked', true).trigger('change');
    }
});

// Both click and change events
container.on('click change', 'input.value[type="radio"]', function(e) {
    handleUserInteraction(thisValue);
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
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

#### Test 2: Arrow Key Navigation (Focus Only)
1. Use **Tab** to focus the first radio button in a group
2. Use **Arrow Up/Down** or **Arrow Left/Right** keys
3. **Expected**: 
   - Focus should move between radio buttons in the same group
   - Radio buttons should NOT be selected/checked as you navigate
   - No page reload or search submission should occur
4. **Verify**: 
   - Visual focus indicator moves to each radio button
   - The previously selected radio button (if any) remains selected
   - Navigation wraps around (last item goes to first, first goes to last)

#### Test 3: Space Key Selection
1. Use **Tab** to focus a radio button
2. Use **Arrow keys** to navigate to a different radio button (without selecting)
3. Press **Space** key on the focused radio button
4. **Expected**: 
   - The focused radio button should be selected/checked
   - Previously selected radio in the group becomes unselected
   - Faceted search updates and page reloads with new filter
5. **Verify**: 
   - Selection occurs on the focused button (not a different one)
   - Search results update correctly

#### Test 4: Enter Key Selection
1. Use **Tab** to focus a radio button
2. Use **Arrow keys** to navigate to a different radio button
3. Press **Enter** key
4. **Expected**: Same behavior as Space key test
5. **Verify**: Same results as Space key test

#### Test 5: Mouse Click Selection
1. Use mouse to click any radio button
2. **Expected**: 
   - Radio button should be selected immediately
   - Faceted search updates and page reloads
3. **Verify**: 
   - No regression in mouse functionality
   - Same immediate submission behavior as before

#### Test 6: Mixed Keyboard and Mouse Interaction
1. Use keyboard to focus and navigate between radio buttons
2. Use mouse to click a radio button
3. Use keyboard again to navigate
4. **Expected**: All interactions work correctly without conflicts
5. **Verify**: Focus and selection state are maintained properly

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
- [ ] Arrow keys navigate between radio buttons WITHOUT selecting them (focus only)
- [ ] Arrow key navigation wraps around (first to last, last to first)
- [ ] No page reload occurs during arrow key navigation
- [ ] Space key selects the focused radio button and triggers search
- [ ] Enter key selects the focused radio button and triggers search
- [ ] Mouse click selects radio button and triggers search immediately
- [ ] Only one radio button per group can be selected at a time
- [ ] Selection triggers faceted search update with page reload
- [ ] No unintended navigation occurs
- [ ] Screen reader announces radio buttons correctly
- [ ] Screen reader announces focus changes during arrow key navigation
- [ ] Screen reader announces selection changes
- [ ] Visual focus indicators are visible and clear
- [ ] Works across major browsers
- [ ] Works with major screen readers

## Keyboard Behavior Summary

| Interaction | Focus | Selection | Search Submission |
|-------------|-------|-----------|-------------------|
| **Tab** | Moves to next radio button | No change | No |
| **Arrow Keys (↑↓←→)** | Moves within radio group | No change | No |
| **Space** | No change | Selects focused button | Yes (page reload) |
| **Enter** | No change | Selects focused button | Yes (page reload) |
| **Mouse Click** | Moves to clicked button | Selects clicked button | Yes (page reload) |

### Key Design Decision

The implementation **decouples focus from selection** for keyboard users:
- **Focus** indicates which radio button you're currently on (visual indicator)
- **Selection** indicates which option is actually chosen (checked state)

This allows keyboard users to:
1. Navigate through options with arrow keys to explore choices
2. Read/compare different options before committing
3. Select their final choice with Space/Enter

Mouse users retain the familiar "click-to-select-immediately" behavior they expect.

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
