FacetedBrowse.registerFacetApplyStateHandler('resource_class', function(facet, facetState) {
    const thisFacet = $(facet);
    const facetData = thisFacet.data('facetData');
    facetState = facetState ?? [];
    facetState.forEach(function(classId) {
        if ('single_select' === facetData.select_type) {
            thisFacet.find(`select.resource-class option[value="${classId}"]`)
                .prop('selected', true);
        } else {
            thisFacet.find(`input.resource-class[data-class-id="${classId}"]`)
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

const handleUserInteraction = function(thisClass) {
    const facet = thisClass.closest('.facet');
    const facetData = facet.data('facetData');
    const queries = [];
    const state = [];
    switch (facetData.select_type) {
        case 'single_list':
            facet.find('.resource-class').not(thisClass).removeClass('selected');
            thisClass.prop('checked', !thisClass.hasClass('selected'));
            break;
        case 'multiple_list':
            thisClass.toggleClass('selected');
            break;
    }
    if ('single_select' === facetData.select_type) {
        const id = thisClass.val();
        queries.push(`resource_class_id[]=${id}`);
        state.push(id);
    } else {
        facet.find('.resource-class.selected').each(function() {
            const id = $(this).data('classId');
            queries.push(`resource_class_id[]=${id}`);
            state.push(id);
        });
    }
    FacetedBrowse.setFacetState(facet.data('facetId'), state, queries.join('&'));
    FacetedBrowse.triggerStateChange();
};

container.on('change', 'select.resource-class', function(e) {
    handleUserInteraction($(this));
});

// Track arrow key navigation to prevent auto-submit
container.on('keydown', 'input.resource-class', function(e) {
    // Arrow keys: Left (37), Up (38), Right (39), Down (40)
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        isArrowKeyNavigation = true;
    }
});

container.on('click change', 'input.resource-class', function(e) {
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
