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

To support continuous keyboard navigation and maintain focus, **all input selections (radio buttons and checkboxes) do not reorder** the list of options. This prevents the following accessibility issues:

**Problem without this fix:**
1. User navigates with keyboard and selects an option
2. The selected option moves to the top of the list
3. Focus is lost or returns to the top
4. User cannot continue navigating from their current position
5. For radio buttons, user is trapped and cannot advance beyond the second position

**Solution:**
All input handlers pass `reorder=false` to `FacetedBrowse.updateSelectList()`, keeping options in their original order. This maintains:
- Consistent keyboard navigation for all input types
- Focus position after selection
- Predictable list order for screen reader users

### Focus Maintenance

When a radio button or checkbox is selected, the browse results are updated via AJAX, but **the sidebar containing the facets is not replaced**. This architectural design naturally maintains focus:

1. User selects an input (radio button or checkbox)
2. AJAX updates only the `#section-content` (browse results area)
3. The `#section-sidebar` (facets area) remains unchanged
4. Browser naturally maintains focus on the input element

**No explicit focus restoration is needed** because:
- The facet inputs are not removed from the DOM during updates
- Lists are not reordered (`reorder=false`), so elements don't move
- The browser maintains focus on elements that remain in place

### Files Modified

- `asset/js/facet-render/value.js` - Pass `reorder=false` for all input selections to maintain list order
- `asset/js/facet-render/item-set.js` - Pass `reorder=false` for all input selections to maintain list order
- `asset/js/facet-render/resource-class.js` - Pass `reorder=false` for all input selections to maintain list order
- `asset/js/facet-render/resource-template.js` - Pass `reorder=false` for all input selections to maintain list order

**Note:** The `reorder` parameter in `FacetedBrowse.updateSelectList()` is still used with its default value (`true`) for initialization and category switching, where reordering selected items to the top makes sense.

## Testing

### Manual Keyboard Testing

1. Navigate to a faceted browse page with radio button filters
2. Press **Tab** to focus the first radio button
3. Use **Arrow Up/Down** to navigate between options
4. Verify that selection changes and search updates occur
5. **Verify focus remains on the selected radio button after browse results update**
6. Continue using **Arrow Up/Down** to select more options
7. Use **Tab** to move to next facet group

### Testing Checkboxes

1. Navigate to a faceted browse page with checkbox filters
2. Press **Tab** to focus a checkbox
3. Press **Space** to check/uncheck
4. **Verify focus remains on the checkbox after browse results update**
5. Use **Tab** to move to next checkbox
6. Press **Space** to check/uncheck
7. Verify continuous navigation works smoothly

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
