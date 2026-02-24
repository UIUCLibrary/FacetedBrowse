FacetedBrowse.registerFacetApplyStateHandler('resource_template', function(facet, facetState) {
    const thisFacet = $(facet);
    const facetData = thisFacet.data('facetData');
    facetState = facetState ?? [];
    facetState.forEach(function(templateId) {
        if ('single_select' === facetData.select_type) {
            thisFacet.find(`select.resource-template option[value="${templateId}"]`)
                .prop('selected', true);
        } else {
            thisFacet.find(`input.resource-template[data-template-id="${templateId}"]`)
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

const handleUserInteraction = function(thisTemplate) {
    const facet = thisTemplate.closest('.facet');
    const facetData = facet.data('facetData');
    const queries = [];
    const state = [];
    switch (facetData.select_type) {
        case 'single_list':
            facet.find('.resource-template').not(thisTemplate).removeClass('selected');
            thisTemplate.prop('checked', !thisTemplate.hasClass('selected'));
            break;
        case 'multiple_list':
            thisTemplate.toggleClass('selected');
            break;
    }
    if ('single_select' === facetData.select_type) {
        const id = thisTemplate.val();
        queries.push(`resource_template_id[]=${id}`);
        state.push(id);
    } else {
        facet.find('.resource-template.selected').each(function() {
            const id = $(this).data('templateId');
            queries.push(`resource_template_id[]=${id}`);
            state.push(id);
        });
    }
    FacetedBrowse.setFacetState(facet.data('facetId'), state, queries.join('&'));
    FacetedBrowse.triggerStateChange();
};

container.on('change', 'select.resource-template', function(e) {
    handleUserInteraction($(this));
});

// Handle keyboard navigation for radio buttons
container.on('keydown', 'input.resource-template[type="radio"]', function(e) {
    const currentRadio = $(this);
    const radioGroup = currentRadio.closest('.select-list');
    const allRadios = radioGroup.find('input.resource-template[type="radio"]').filter(':visible');
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

container.on('click change', 'input.resource-template', function(e) {
    const thisValue = $(this);
    handleUserInteraction($(this));
    FacetedBrowse.updateSelectList(thisValue.closest('.select-list'));
});


});
