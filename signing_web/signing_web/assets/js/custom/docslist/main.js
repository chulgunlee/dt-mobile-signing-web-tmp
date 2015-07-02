window.WebViewBridge.type = 'ios';
$(function () {
    //$(document).click(function(event) {
    //    if (event.target.parentElement == null
    //        || (event.target.parentElement.id.indexOf('signing-status-for') < 0
    //            && event.target.id.indexOf('signing-status-for') < 0))
    //        DismissPopoverByIx(-1); //dismiss all sign status popovers
    //});
    $('body').on('click', function (e) {
        $('.status-badge').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');//alert(1);
            }
        });
    });

    $('#back-lnk').click(function() {
        WebViewBridge.call('exitSigningRoom', { 'status': 'Back' });
    });
    $('#signers-container').on('shown.bs.modal', function (e) {
        $('.ellipsis').ellipsis();
    });
    $('#docs-list-container').on('shown.bs.popover', function () {
        $('#docs-list-container .ellipsis').ellipsis();
    });
    //$(document).on('click', function() {
    //    alert('click fired');
    //});
});
