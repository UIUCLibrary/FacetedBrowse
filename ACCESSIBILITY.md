# Accessibility Implementation for Radio Buttons

## Overview

This module implements **standard, W3C-compliant** radio button accessibility following the [ARIA Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

## Implementation

Radio buttons use native HTML `<input type="radio">` elements with proper event handling for both mouse and keyboard interactions.

### Event Handlers

All radio button facets listen for the `change` event:

```javascript
container.on('change', 'input.value[type="radio"]', function(e) {
    const thisValue = $(this);
    const facet = thisValue.closest('.facet');
    const facetId = facet.data('facetId');
    const dataValue = thisValue.data('value');
    
    // Save focus state for restoration after page reload
    FacetedBrowse.setFocusState(facetId, `input.value[type="radio"][data-value="${dataValue}"]`);
    
    handleUserInteraction(thisValue);
    // Don't reorder list to allow continuous keyboard navigation
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'), false);
});
```

The `change` event fires for all user interactions:
- Mouse clicks
- Keyboard selection (Space/Enter keys)
- Arrow key navigation (which both moves focus AND changes selection per W3C standards)

**Important**: Radio button selections pass `false` to `updateSelectList()` to disable list reordering. This prevents a keyboard navigation issue where selected items floating to the top would trap users at the second position.

### Standard Keyboard Behavior

The browser provides native radio button keyboard navigation:

| Key | Action |
|-----|--------|
| **Tab** | Move focus to the radio group (focuses the checked radio, or first if none checked) |
| **Shift+Tab** | Move focus to previous element |
| **Arrow Up/Left** | Move to and select previous radio button in group |
| **Arrow Down/Right** | Move to and select next radio button in group |
| **Space** | Select the focused radio button |

**Note**: Arrow keys both move focus AND change selection. This is standard behavior for radio buttons per W3C ARIA guidelines.

### List Reordering Behavior

To support continuous keyboard navigation, radio button selections **do not reorder** the list of options. This prevents the following accessibility issue:

**Problem without this fix:**
1. User presses Down arrow to select option 2
2. Option 2 moves to the top of the list
3. Focus returns to option 2 (now at position 1)
4. User presses Down arrow again, selecting what's now option 2
5. User is trapped and cannot advance beyond the second position

**Solution:**
Radio buttons pass `reorder=false` to `FacetedBrowse.updateSelectList()`, keeping options in their original order. Checkboxes and dropdowns still reorder (`reorder=true`) since they don't have the same keyboard navigation pattern.

### Focus Restoration

When a radio button is selected, the page content is updated via AJAX. To maintain accessibility and user context:

1. **Before page reload**: The facet ID and radio button selector are saved to the application state
2. **After page reload**: Focus is automatically restored to the previously selected radio button

This ensures keyboard users don't lose their place in the page after making a selection.

**Implementation details:**
- `FacetedBrowse.setFocusState(facetId, selector)`: Saves the focus state
- `FacetedBrowse.restoreFocus()`: Restores focus after content update
- Focus restoration happens in `page.js` after the AJAX call completes

### Files Modified

- `asset/js/faceted-browse.js` - Added focus state management functions
- `asset/js/site/page.js` - Added focus restoration after content updates
- `asset/js/facet-render/value.js` - Save focus state on radio button interaction
- `asset/js/facet-render/item-set.js` - Save focus state on radio button interaction
- `asset/js/facet-render/resource-class.js` - Save focus state on radio button interaction
- `asset/js/facet-render/resource-template.js` - Save focus state on radio button interaction

## Testing

### Manual Keyboard Testing

1. Navigate to a faceted browse page with radio button filters
2. Press **Tab** to focus the first radio button
3. Use **Arrow Up/Down** to navigate between options
4. Verify that selection changes and search updates occur
5. **Verify focus returns to the selected radio button after page update**
6. Use **Space** to select a radio button
7. Use **Tab** to move to next facet group

### Screen Reader Testing

Test with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- ChromeVox (Chrome)

Expected announcements:
- "Radio button"
- Current label text
- State: "checked" or "not checked"
- Position in group (e.g., "1 of 5")

## References

- [W3C ARIA: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [MDN: Radio Button Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radio_role)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [W3C: Managing Focus](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)

## Future Enhancements

If you want to add features like "click to submit immediately" while maintaining accessibility, those can be layered on top of this standard implementation without breaking keyboard navigation or screen reader compatibility.
