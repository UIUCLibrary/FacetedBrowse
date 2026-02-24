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
let isArrowKeyNavigation = false;

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

// Track arrow key navigation to prevent auto-submit
container.on('keydown', 'input.item-set', function(e) {
    // Arrow keys: Left (37), Up (38), Right (39), Down (40)
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        isArrowKeyNavigation = true;
    }
});

container.on('click change', 'input.item-set', function(e) {
    const thisValue = $(this);
    // Skip submission if this is arrow key navigation
    if (e.type === 'change' && isArrowKeyNavigation) {
        isArrowKeyNavigation = false;
        FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
        return;
    }
    handleUserInteraction($(this));
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
});

});
