# Accessibility Implementation for Radio Buttons

## Overview

This module implements **standard, W3C-compliant** radio button accessibility following the [ARIA Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

## Implementation

Radio buttons use native HTML `<input type="radio">` elements with proper event handling for both mouse and keyboard interactions.

### Event Handlers

All radio button facets listen for both `click` and `change` events:

```javascript
container.on('click change', 'input.value[type="radio"]', function(e) {
    const thisValue = $(this);
    handleUserInteraction(thisValue);
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
});
```

- **`click` event**: Fired when user clicks with mouse
- **`change` event**: Fired when user selects with keyboard (Space/Enter) or arrow keys

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

### Files Modified

- `asset/js/facet-render/value.js`
- `asset/js/facet-render/item-set.js`
- `asset/js/facet-render/resource-class.js`
- `asset/js/facet-render/resource-template.js`

## Testing

### Manual Keyboard Testing

1. Navigate to a faceted browse page with radio button filters
2. Press **Tab** to focus the first radio button
3. Use **Arrow Up/Down** to navigate between options
4. Verify that selection changes and search updates occur
5. Use **Space** to select a radio button
6. Use **Tab** to move to next facet group

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

## Future Enhancements

If you want to add features like "click to submit immediately" while maintaining accessibility, those can be layered on top of this standard implementation without breaking keyboard navigation or screen reader compatibility.
