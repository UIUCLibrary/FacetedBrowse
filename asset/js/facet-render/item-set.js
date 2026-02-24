FacetedBrowse.registerFacetApplyStateHandler('item_set', function(facet, facetState) {
    const thisFacet = $(facet);
    const facetData = thisFacet.data('facetData');
    facetState = facetState ?? [];
    facetState.forEach(function(itemSetId) {
        if ('single_select' === facetData.select_type) {
            thisFacet.find(`select.item-set option[value="${itemSetId}"]`)
                .prop('selected', true);
        } else {
            thisFacet.find(`input.item-set[data-item-set-id="${itemSetId}"]`)
                .prop('checked', true)
                .addClass('selected');
        }
    });
    if (['single_list', 'multiple_list'].includes(facetData.select_type)) {
        FacetedBrowse.updateSelectList(thisFacet.find('.select-list'));
    }
});

$(document).ready(function() {

const container = $('#container');

const handleUserInteraction = function(thisItemSet) {
    const facet = thisItemSet.closest('.facet');
    const facetData = facet.data('facetData');
    const queries = [];
    const state = [];
    switch (facetData.select_type) {
        case 'single_list':
            facet.find('.item-set').not(thisItemSet).removeClass('selected');
            thisItemSet.prop('checked', !thisItemSet.hasClass('selected'));
            break;
        case 'multiple_list':
            thisItemSet.toggleClass('selected');
            break;
    }
    if ('single_select' === facetData.select_type) {
        const id = thisItemSet.val();
        queries.push(`item_set_id[]=${id}`);
        state.push(id);
    } else {
        facet.find('.item-set.selected').each(function() {
            const id = $(this).data('itemSetId');
            queries.push(`item_set_id[]=${id}`);
            state.push(id);
        });
    }
    FacetedBrowse.setFacetState(facet.data('facetId'), state, queries.join('&'));
    FacetedBrowse.triggerStateChange();
};

container.on('change', 'select.item-set', function(e) {
    handleUserInteraction($(this));
});

// Handle keyboard navigation for radio buttons
container.on('keydown', 'input.item-set[type="radio"]', function(e) {
    const currentRadio = $(this);
    const radioGroup = currentRadio.closest('.select-list');
    const allRadios = radioGroup.find('input.item-set[type="radio"]').filter(':visible');
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

container.on('click change', 'input.item-set', function(e) {
    const thisValue = $(this);
    handleUserInteraction($(this));
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
});

});
