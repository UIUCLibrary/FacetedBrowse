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

// Handle keyboard navigation for radio buttons
container.on('keydown', 'input.resource-class[type="radio"]', function(e) {
    const currentRadio = $(this);
    const radioGroup = currentRadio.closest('.select-list');
    const allRadios = radioGroup.find('input.resource-class[type="radio"]').filter(':visible');
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

container.on('click change', 'input.resource-class', function(e) {
    const thisValue = $(this);
    handleUserInteraction($(this));
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
});

});
