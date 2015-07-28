/**
 * TODO: This comment describes this js module's purpose in life
 */


$(function () {
    var ua = navigator.userAgent,
    wchEvent = (ua.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) ? "tap" : "click";
    tabSlideAction = (ua.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) ? "swipe" : "click";

    $('.slide-out-div').tabSlideOut({
        //class of the element that will become your tab
        tabHandle: '.handle',

        //side of screen where tab lives, top, right, bottom, or left
        tabLocation: 'left',

        //speed of animation
        speed: 300,

        //options: 'click' or 'hover', action to trigger animation
        action: tabSlideAction,

        //position from the top/ use if tabLocation is left or right
        topPos: '0px',

        //position from left/ use if tabLocation is bottom or top
        leftPos: '20px',

        //options: true makes it stick(fixed position) on scroll
        onLoadSlideOut: false,
        fixedPosition: false
    });

    $('html, body,.handle,#id_start').on('click', function (e) {
        $('.status-badge,.ellipsis-style').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $(".status-badge").popover({
        placement: 'top',
        container: 'body',
        html: true,
        content: function () {
            return $('#signed_status_content').html();
        },
        title: function () {}
    });

    $(".ellipsis-style").popover({
        placement: 'top',
        container: 'body',
        html: true,
        content: function () {
            return $('#footer_popover_content').html();
        },
        title: function () {},
    }).on("click", function () {
        $("ul.footer_popover_content").parents(".popover").addClass("signing-room-popover");
    });


    $("#id_contract_document,#id_select_document").on("click", function () {
        $("#id_document_select_nav,#id_document_contract_nav,.checkbox-doclist").toggle();

        if ($("#id_document_contract_nav").is(':visible')) {
            $(".checkbox-doclist").hide();
        } else {
            $(".status-badge").filter(function (i) {
                if ($(this).hasClass("green")) {
                    $(this).prev(".checkbox-doclist").hide();
                } else {
                    $(this).prev(".checkbox-doclist").show();
                }
            });
        }
    });

    $("#id_Sign_btn").on('click', function (evt) {
        evt.stopPropagation();
        if (!$(this).hasClass("disabled"))
            $('#id_select_signer_modal').modal('show');
    });

    $("#id_signature_apply").on('click', function (evt) {
        $("#id_clickToSign,#id_edit_img").addClass('hide');
        $("#id_regenSignatureCanvas,#id_cancel_img").removeClass('hide');
        var imgData = sigApi.getSignatureImage();
        $("#id_regenSignatureImg").attr("src", imgData);
        console.log(imgData);
    });

    $('.document-img-container').on(wchEvent, function (evt) {
        if ($("#id_clickToSign").is(":visible") && $("#id_edit_img").is(":visible"))
            $('#id_signature_initials_modal').modal('show');
    });
});
