var TransJson;
var CollectSigsJson;
var UserConsent;
var CollectedImagesText;
var strCurrentActiveSigBlock;
var CurrentSigBlock;
var apiSign;
var apiIntial;
var apiSign1;
var currentSignor;
var AsssignSigCtrilId = '';
var dbgFlag = false;
var hasInitial = false;
var FullReviewReqd = '';
var txtFiledNotEntered = null;
var wchEvent;
var modalShown = false;
var initCompleted = false;
var atLeastoneSignCollected;
var signingRoomApiUri = apiUri + 'signingroom/';
var isSaveExitPending = false;


$(document).ajaxStart(function () {
    if (modalShown) {
        return
    }
    if (!initCompleted) {
        $('form').hide();
        $('.slide-out-div').hide();
    }
    $('#loading-splash').modal('show');
});


$(document).ajaxComplete(function (event, jqxhr, settings) {
    if (settings.url.toLowerCase().indexOf('terms') >= 0) {
        return
    }
    $('#loading-splash').modal('hide');
    modalShown = false;
    if (initCompleted) {
        $('form').show();
        $('.slide-out-div').show();
    }
});


// add user code header to all ajax requests
$(document).ajaxSend(function(event, xhr, settings) {
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    if (sameOrigin(settings.url)) {
        xhr.setRequestHeader("User-Code", userCode);
    }
});


$('#loading-splash').on('shown.bs.modal', function (e) {
    modalShown = true;
});


$(document).ready(function () {
    $('#loading-splash').modal('show');
    var ua = navigator.userAgent;
    wchEvent = (ua.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) ? "tap" : "click";

    apiSign = $('#sigPad1').signaturePad({ bgColour: 'transparent', drawOnly: true, lineTop: 110, penWidth: 3, penColour: 'black', errorMessageDraw: '' });
    apiIntial = $('#sigPad2').signaturePad({ bgColour: 'transparent', drawOnly: true, lineTop: 110, penWidth: 3, penColour: 'black', errorMessageDraw: '' });
    apiSign1 = $('#sigPad3').signaturePad({ bgColour: 'transparent', drawOnly: true, lineTop: 110, penWidth: 3, penColour: 'black', errorMessageDraw: '' });


    ProcessPageInit();
    $("#iv_button_save_sigs").click(function (e) {
        e.preventDefault();
        return SaveSignatures();
    });

    $("#id_button_disclosure").click(function (e) {
        e.preventDefault();
        $('#id_terms_and_conditions').modal('show');
        return false;
    });

    $("#id_less_sign").click(function (e) {
        e.preventDefault();
        if ($("#id_less_sign").attr("ctrl") == 1) {
            apiSign.clearCanvas();
        } else {
            apiIntial.clearCanvas();
        }
        return false;
    });

    $("#id_button_signaturecapture_modal").click(function (e) {
        e.preventDefault();
        $('#id_signature_initials_modalPopup').modal('show');
        return false;
    });

    $("#id_clearSig1").click(function (e) {
        e.preventDefault();
        apiSign.clearCanvas();
        return false;
    });

    $("#id_clearSig").click(function (e) {
        e.preventDefault();
        apiSign.clearCanvas();
        return false;
    });

    $("#id_clearInitial").click(function (e) {
        e.preventDefault();
        apiIntial.clearCanvas();
        return false;
    });

    $("#id_start").click(function (e) {
        e.preventDefault();

        if ($("#id_start").text() == "Start" || $("#id_start").text() == "Next") {
            if (!checkSigFiledsUpdated(currentSignor, hasInitial)) {
                if (hasInitial) {
                    $('#id_signature_initials_modalPopup').modal('show');
                } else {
                    $('#id_signature_modal').modal('show');
                }

                return false;
            }

            for (var i = 0; i < CurrentSigBlock.length; i++) {
                if (!CurrentSigBlock[i].collected) {
                    $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[i].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[i].sig_name).parent('div').position().top }, 'slow');
                    return false;
                }
            }

            if (CheckFullySigned(CurrentSigBlock) != 200 && txtFiledNotEntered != null) {
                $("#" + txtFiledNotEntered).focus();
                return false;
            }

        } else {
            if ($("#id_start").text() == "Finish") {
                CollectSigsJson.strAction = "FINISH";
            }
            $("#id_start").prop("disabled", true);
            SaveSignatures();
        }

    });

    $("#id_start").tooltip();

    $('#id_location1').click(function (e) {
        e.preventDefault();
        if (TransJson.FullReviewRequired == "1") {
            $('#id_start').tooltip('show');
            return;
        }
        var result = CheckFullySigned(CurrentSigBlock);
        if (result == 200) return;
        if (txtFiledNotEntered == null) {
            $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[result].sig_name).parent('div').position().top }, 'slow');
            window.scroll(0, -100);
        } else {
            $("#" + txtFiledNotEntered).focus();
            txtFiledNotEntered = null;
        }
    });

    $("#id_apply").click(function (e) {
        e.preventDefault();
        if (apiSign.getSignatureImage().length <= 3000 || apiIntial.getSignatureImage().length <= 3000) {
            if (apiSign.getSignatureImage().length <= 3000) {
                $('#id_less_sign').find('p')[0].innerHTML = "The Signature entered was too short. Please try again with a longer signature.";
                $('#id_less_sign').attr("ctrl", "1");
                $("#id_less_sign").modal('show');
                return false;
            }
            if (apiIntial.getSignatureImage().length <= 3000) {
                $('#id_less_sign').find('p')[0].innerHTML = "The Initial entered was too short. Please try again with a longer initial.";
                $('#id_less_sign').attr("ctrl", "2");
                $("#id_less_sign").modal('show');
                return false;
            }
        }
        else {
            $("#" + currentSignor + "_SIG").val(apiSign.getSignatureImage());
            $("#" + currentSignor + "_INITIAL").val(apiIntial.getSignatureImage());

            if (hasInitial == true) {
                $('#id_signature_initials_modalPopup').modal('hide');
                apiIntial.clearCanvas();
            } else {
                $('#id_signature_modal').modal('hide');
            }
            apiSign.clearCanvas();

            $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[0].sig_name).parent('div').position().top }, 'slow');

            if (AsssignSigCtrilId != '') {
                fnAssignSigImagetoCtrl(AsssignSigCtrilId);
            }

            window.scrollBy(0, -100);
            return false;
        }
    });

    $("#id_applySignOnly").click(function (e) {
        e.preventDefault();
        if (apiSign.getSignatureImage().length <= 3000) {
            $('#id_less_sign').find('p')[0].innerHTML = "The Signature entered was too short. Please try again with a longer signature.";
            $("#id_less_sign").modal('show');
            return false;
        }
        else {
            $("#" + currentSignor + "_SIG").val(apiSign.getSignatureImage());
            $("#" + currentSignor + "_INITIAL").val(apiIntial.getSignatureImage());

            if (hasInitial == true) {
                $('#id_signature_initials_modalPopup').modal('hide');
                apiIntial.clearCanvas();
            } else {
                $('#id_signature_modal').modal('hide');
            }
            hasInitial == true ? apiIntial.clearCanvas() : apiSign.clearCanvas();

            // Move to the first signature to capture.
            var result = CheckFullySigned(CurrentSigBlock);
            $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[0].sig_name).parent('div').position().top }, 'slow');

            if (AsssignSigCtrilId != '') {
                fnAssignSigImagetoCtrl(AsssignSigCtrilId);
            }

            window.scrollBy(0, -100);
            return false;
        }
    });

    $("#id_cancel_img").click(function (e) {
        e.preventDefault();
        $('#id_regenSignatureImg').src = null;
        $("#id_clickToSign,#id_edit_img").removeClass('hide');
        return false;
    });

    $("#id_signIn_modal").on('hidden.bs.modal', function () {
        if (TransJson.FullReviewRequired == '1')
            $('#id_start').tooltip('show');
    });
    window.WebViewBridge.type = 'ios';
});


/**
 * Get the initial data of signing room.
 * TODO: remove masterIndxId global var dependency
 */
function ProcessPageInit() {

    $.get(signingRoomApiUri + 'init/' + masterIndxId, function(data, textStatus, xhr) {

        if (xhr.status == 302) {
            WebViewBridge.call('exitSigningRoom', { 'status': 'SessionTimeout' });
            return;
        }

        ProcessPagereloadCtrls(data);
        $(".tncload").load('terms/');
        initCompleted = true;

    }).fail(function(data) {
        WebViewBridge.call('exitSigningRoom', { 'status': 'TechnicalDifficulty' });
    });
}


function CheckuserConsentAction() {
    if (currentSignor == "BUYER") {
        if (UserConsent.buyer_consent == "N" && UserConsent.buyer_consent_withdraw == 'N') {
            $('#id_terms_and_conditions').modal('show');
        }
    }

    if (currentSignor == "COBUYER") {
        if (UserConsent.cobuyer_consent == "N" && UserConsent.cobuyer_consent_withdraw == 'N') {
            $('#id_terms_and_conditions').modal('show');
        }
    }
}


$('#id_terms_and_conditions, #id_signature_initials_modalPopup, #id_saveexit_model, #id_withdraw_model').on('shown.bs.modal', function () {
    $('.footer_link_container .fa-ellipsis-h').hide();
});


$('#id_terms_and_conditions, #id_signature_initials_modalPopup, #id_saveexit_model, #id_withdraw_model').on('hidden.bs.modal', function () {
    $('.footer_link_container .fa-ellipsis-h').show();
});


$('#id_saveexit_model, #id_withdraw_model').on('shown.bs.modal', function () {
    $('.ellipsis-style').popover('hide');
});



/**
 * Deal with page init data and build signing room page
 */
function ProcessPagereloadCtrls(data) {
    var delayTooltip = false;
    TransJson = data.d;

    if (TransJson.next_action == "Redirect") {
        if (dbgFlag) {
            location.href = 'thankyou/';
            return;
        }
        WebViewBridge.call('exitSigningRoom', { 'status': 'SigningComplete' });
        return;
    }

    $('#id_signIn_modal ,#id_terms_and_conditions, #id_signature_initials_modalPopup ,#id_signature_modal').on('shown.bs.modal', function () {
        $('body').css({
            'overflow': 'hidden', 'position': 'fixed', 'width': '100%'
        });
    });

    $('#id_signIn_modal ,#id_terms_and_conditions, #id_signature_initials_modalPopup ,#id_signature_modal').on('hidden.bs.modal', function () {
        $('body').removeAttr('style');
    });

    CollectSigsJson = JSON.parse(TransJson.collect_signatures);     // TODO: why server added json.dumps to this field?
    UserConsent = TransJson.user_consent;
    CollectedImagesText = TransJson.list_collected_sigs;
    CurrentSigBlock = CollectSigsJson.sig_block;

    // apply background images
    fnApplyBackImages(TransJson.list_doc_background_images);

    hasInitial = (CollectSigsJson.initial == 'Y');

    if (TransJson.signable_doc != 'N') {

        if (CurrentSigBlock != null) {
            fnApplySignatures(CurrentSigBlock);
            fnApplyInitials(CurrentSigBlock);
        }
        fnApplyTextFileds(CollectSigsJson);
    }

    currentSignor = CollectSigsJson.sig_type;           // TODO: remove global var currentSignor

    fnSignStatus(TransJson.sign_status, currentSignor, CollectSigsJson.doc_index_id);

    if (CollectedImagesText != null) {
        ApplyCollectedImagesText(CollectedImagesText);
    }


    $("#id_signing_as").text("You are signing as " + CollectSigsJson.signee_name);

    if (strCurrentActiveSigBlock != CollectSigsJson.sig_type) {
        $("#id_signor_alert").text(CollectSigsJson.signee_name);
        $("#id_signIn_modal").modal();
        delayTooltip = true;
    }


    strCurrentActiveSigBlock = CollectSigsJson.sig_type;

    $("#SigTemplateName").text(TransJson.TemplateDescription);      // TODO: not foun in dt20 response

    if (TransJson.signable_doc != 'N') {
        $("#id_start").text("Start");
        if (CurrentSigBlock == null) {
            $("#id_location1").parent().hide();
            $("#id_start").hide();
            $("#id_start").prop("disabled", true);
            $("id_start").tooltip('hide');
        } else {
            $("#id_start").prop("disabled", false);
            $("#id_location1").parent().show();
            $("#id_location1").text($().pluralize(CurrentSigBlock.length + " location"));
            if (CurrentSigBlock.length > 0)
                $("#id_start").show();
        }
    } else {
        $("#id_start").text(TransJson.next_action);
        $("#id_start").prop("disabled", false);
        $("#id_location1").parent().hide();
    }

    $("#id_signee_inital").text(CollectSigsJson.signee_name);
    $("#id_signee_sig").text(CollectSigsJson.signee_name);

    if (!hasInitial) {
        apiSign = apiSign1;
    }

    if (currentSignor.toUpperCase() == 'DEALER') {
        $("#id_withdrawAnchor").css('pointer-events', 'none');
    }

    $("#id_doc_name").text(TransJson.TemplateDescription);

    FullReviewReqd = TransJson.FullReviewRequired;

    if (FullReviewReqd == '1') {
        $("#id_start").prop("disabled", true);
    } else {
        $('#id_start').tooltip('hide');
    }

    if (!delayTooltip && TransJson.FullReviewRequired == "1")
        $('#id_start').tooltip('show');

}


function ApplyCollectedImagesText(CollectedSigsTextArray) {
    $.each(CollectedSigsTextArray, function (key, value) {
        var element;
        if (value.DataType == "SIG") {
            element = document.createElement("img");
            element.src = value.Value;
        } else {
            element = document.createElement("label");
            element.innerText = value.Value;
        }

        element.id = "__DEL__" + value.SignName;
        document.getElementById('cont1').appendChild(element);
        document.getElementById("__DEL__" + value.SignName).setAttribute('style', fnApplyHigherResolution(value.Param));
    });
}


function ButtonUserConsent(action) {
    UserConsent.current_signer = currentSignor;
    UserConsent.consent_action = action;
    var jsonUserConsent = JSON.stringify({ userconsent: UserConsent });
    $.ajax(
    {
        type: "POST",
        url: signingRoomApiUri + "consent",
        data: jsonUserConsent,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg, textStatus, xhr) {
            if (xhr.status == 302) {
                WebViewBridge.call('exitSigningRoom', { 'status': 'SessionTimeout' });
                return false;
            }
            UserConsent = msg;
            if (UserConsent.ErrorOccurred) {
                WebViewBridge.call('exitSigningRoom', { 'status': 'TechnicalDifficulty' });
                return false;
            }
            if (action == 'Withdraw') {
                WebViewBridge.call('exitSigningRoom', { 'status': 'WithdrawConsent' });
            }
        },
        error: function () {
            WebViewBridge.call('exitSigningRoom', { 'status': 'TechnicalDifficulty' });
        }
    });
    return false;
}


function SaveSignatures() {

    if (TransJson.signable_doc == 'N') {
        CollectSigsJson.str_action = "ACK";      // TODO: what's this?
    }

    if (CollectSigsJson.sig_block != null) {
        if (TransJson.signable_doc != 'N') {
            if (currentSignor == "BUYER") {
                CollectSigsJson.signature = $("#BUYER_SIG").val().replace("data:image/png;base64,", "");
                if (CollectSigsJson.initial == 'Y') {
                    CollectSigsJson.inital_signature = $("#BUYER_INITIAL").val().replace("data:image/png;base64,", "");
                }
            }

            if (currentSignor == "COBUYER") {
                CollectSigsJson.signature = $("#COBUYER_SIG").val().replace("data:image/png;base64,", "");
                if (CollectSigsJson.initial == 'Y') {
                    CollectSigsJson.inital_signature = $("#COBUYER_INITIAL").val().replace("data:image/png;base64,", "");
                }
            }

            if (currentSignor == "DEALER") {
                CollectSigsJson.signature = $("#DEALER_SIG").val().replace("data:image/png;base64,", "");
                if (CollectSigsJson.initial == 'Y') {
                    CollectSigsJson.inital_signature = $("#DEALER_INITIAL").val().replace("data:image/png;base64,", "");
                }
            }

            for (K = 0; K <= CollectSigsJson.sig_block.length - 1; K++) {
                CollectSigsJson.sig_block[K].collected = true;
            }

            if (CollectSigsJson.DateFiledBlock != null) {
                for (K = 0; K <= CollectSigsJson.DateFiledBlock.length - 1; K++) {
                    CollectSigsJson.DateFiledBlock[K].Collected = true;
                }
            }


            if (CollectSigsJson.TextFieldBlock != null) {
                for (K = 0; K <= CollectSigsJson.TextFieldBlock.length - 1; K++) {
                    CollectSigsJson.TextFieldBlock[K].TextFieldValue = $("#" + CollectSigsJson.TextFieldBlock[K].TextFieldName).val();
                }
            }

        } else {
        }
    }
    if (CollectSigsJson.str_action == null) {
        CollectSigsJson.str_action = "";
    }
    if (CollectSigsJson.str_action.toUpperCase() != "FINISH" && CollectSigsJson.str_action.toUpperCase() != 'NEW SELECTION' && CollectSigsJson.str_action.toUpperCase() != 'ACK') {
        CollectSigsJson.str_action = "SAVE";
    }

    var sigsData = JSON.stringify(CollectSigsJson);
    $.ajax(
    {
        type: "POST",
        url: signingRoomApiUri + "sigsave/",
        data: sigsData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg, textStatus, xhr) {

            if (xhr.status == 302) {
                WebViewBridge.call('exitSigningRoom', { 'status': 'SessionTimeout' });
                return false;
            }
            if (msg.ErrorOccurred) {
                WebViewBridge.call('exitSigningRoom', { 'status': 'TechnicalDifficulty' });
                return false;
            }
            if (isSaveExitPending) {
                isSaveExitPending = false;
                WebViewBridge.call('exitSigningRoom', { 'status': 'SaveAndExit' });
                return true;
            }
            $("[id^=sig_]").remove();
            $("[id^=__DEL__]").remove();
            $("[id$=_date]").remove();
            $("[id$=_title]").remove();
            $("[id^=txtdealertitle]").remove();
            $(".document-sign-holder").remove();
            ProcessPagereloadCtrls(msg);
            $(window).scrollTop(0);
        },
        error: function (msg) {
            WebViewBridge.call('exitSigningRoom', { 'status': 'TechnicalDifficulty' });
        }
    });
    return false;
}


/**
 * Apply background images
 */
function fnApplyBackImages(imgs) {
    if (imgs != null) {
        $("[id^=BackImage_]").remove();
       
        $.each(imgs, function(idx, value) {
            $("<img>").attr({
                id:  "BackImage_" + value.PageNo,
                src: "data:image/png;base64," + value.Value
            }).addClass("document-img").appendTo('#cont1');
        });

        if ($(window).width() > 1024) {
            $(".document-img").width("1190");
            $(".document-img-container").css('left', '0.01px');
        }
    }
}


function fnApplySignatures(sigBlocks) {
    var imgWidth = '60';

    $.each(sigBlocks, function (key, value) {
        if (!value.is_initial) {
            var tempWidth = parseInt(fnExtractControlWidth(value.sig_style));
            if (tempWidth > 0) {
                imgWidth = tempWidth - 25;
            }

            var s1 = "<div class='document-sign-holder' style='" + fnApplyHigherResolution(value.sig_style) + "' onclick=imgCtrl('" + value.sig_name + "','sig');>";
            s1 = s1 + "<span class='fa fa-pencil-square pull-left sign-holder-icon' id='sig_" + value.sig_name + "'></span>";
            s1 = s1 + " <a class='text-center sign-holder-text' id='label_sig_" + value.sig_name + "'>Click to sign</a>";
            s1 = s1 + "<img id='image_sig_" + value.sig_name + "' width=" + imgWidth + "px height='30px'  style='display:none'/>";
            s1 = s1 + " <span class='fa fa-times-circle pull-right sign-holder-icon-close'  style='display:none'  id='delete_sig_" + value.sig_name + "'></span></div>";
            $('#cont1').append(s1);
        }
    });
}


function fnApplyInitials(sigBlocks) {
    var imgWidth = '60';

    $.each(sigBlocks, function (key, value) {
        if (value.is_initial) {
            var tempWidth = parseInt(fnExtractControlWidth(value.sig_style));
            if (tempWidth > 0) {
                imgWidth = tempWidth - 25;
            }

            var s1 = "<div class='document-sign-holder document-sign-holder-initial-div' style='" + fnApplyHigherResolution(value.sig_style) + "' onclick=imgCtrl('" + value.sig_name + "','initial');>";
            s1 = s1 + "<span class='fa fa-pencil-square pull-left sign-holder-icon-initial' id='initial_" + value.sig_name + "'></span>";
            s1 = s1 + "<img id='image_initial_" + value.sig_name + "'  width=" + imgWidth + "px height='15px' class='sig-img-initial' style='vertical-align: top; display: none;'>";
            s1 = s1 + "<a class='text-center sign-holder-text sign-holder-text-initial after' id='label_initial_" + value.sig_name + "' style='display: block;'>Initial</a>";
            $('#cont1').append(s1);
        }
    });
}


//extract width from style.
function fnExtractControlWidth(styles) {
    var style = styles.split(';');
    for (x in style) {
        var indStyle = style[x].split(':');
        if (indStyle.length > 1) {
            if (indStyle[0] == 'width') {
                return (indStyle[1].replace('px', ''));
            }
        }
    }
}


function fnApplyHigherResolution(styles) {
    var multiFactor = 1.00;
    var resultVal;
    var style = styles.split(';');
    var indStyle;
    var style1 = "";

    if ($(window).width() > 1024) {
        multiFactor = 1.2526;
    }


    for (x in style) {
         indStyle = style[x].split(':');
        if (indStyle.length > 1) {
            if ((indStyle[0] == 'left') || (indStyle[0] == 'top')) {
                resultVal = indStyle[1].replace('px', '');
                indStyle[1] = resultVal * multiFactor;
                indStyle[1] = indStyle[1] + "px";
            }
        }
        style1 = style1 + "; " + indStyle[0] + ":" + indStyle[1];
    }
    return style1;
}


function imgCtrl(ctrl, sigOrInitial) {
    if (document.getElementById(sigOrInitial + "_" + ctrl).style.display != 'none') {
        ImageCtrlClicked(document.getElementById(sigOrInitial + "_" + ctrl));
    } else {
        ImageCtrlDeleteClicked(ctrl, sigOrInitial);
    }
}


function ImageCtrlDeleteClicked(ctrl, sigOrInitial) {
    CurrentSigBlock[findItem(CurrentSigBlock, ctrl)].collected = false;
    if (sigOrInitial == 'initial') {
        $("#initial_" + ctrl).removeClass('hide');
        $("#initial_" + ctrl).show();
        $("#label_initial_" + ctrl).removeClass('hide');
        $("#label_initial_" + ctrl).show();
        $("#image_initial_" + ctrl).prop('src', '');
        $("#image_initial_" + ctrl).hide();
    } else {
        $("#delete_sig_" + ctrl).hide();
        $("#image_sig_" + ctrl).prop("src", "");
        $("#image_sig_" + ctrl).hide();
        $("#label_sig_" + ctrl).removeClass('hide');
        $("#label_sig_" + ctrl).show();
        $("#sig_" + ctrl).removeClass('hide');
        $("#sig_" + ctrl).show();
    }

    fnClearDateField(ctrl);

    fnSetNoOfSigToCapture();

    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        $("#id_start").text(TransJson.NextAction);
    } else {
        if (CurrentSigBlock.length == getUnsingedSigsCount(CurrentSigBlock)) {
            $("#id_start").text("Start");
        } else {
            $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[result].sig_name).parent('div').position().top }, 'slow');
            window.scroll(0, -100);
            $("#id_start").text("Next");
        }
    }
}


//clear all signatures and also set Collected = false;
function fnClearAllSigsAndInitials() {
    $.each(CollectSigsJson.sig_block, function (key, value) {
        value.Collected = false;
        var ctrlId;
        ctrlId = value.sig_name;
        if (value.is_initial == true) {
            $("#label_initial_" + ctrlId).removeClass('hide');
            $("#label_initial_" + ctrlId).show();
            $("#image_initial_" + ctrlId).prop('src', '');
            $("#image_initial_" + ctrlId).hide();
        } else {
            $("#delete_sig_" + ctrlId).hide();
            $("#image_sig_" + ctrlId).prop("src", "");
            $("#image_sig_" + ctrlId).hide();
            $("#label_sig_" + ctrlId).removeClass('hide');
            $("#label_sig_" + ctrlId).show();
            $("#sig_" + ctrlId).removeClass('hide');
            $("#sig_" + ctrlId).show();
        }
        fnClearDateField(ctrlId);
    });

    fnSetNoOfSigToCapture();

    //set text for start button
    $("#id_start").text("Start");
}


function fnClearDateField(ctrl) {
    if ($("#" + ctrl + "_date").length > 0) {
        document.getElementById("cont1").removeChild($("#" + ctrl + "_date")[0].parentElement);
    }
}


function fnSetNoOfSigToCapture() {
    var intUnSignedSigs = getUnsingedSigsCount(CurrentSigBlock);
    $("#id_location1").text(intUnSignedSigs + " locations");
}


function ImageCtrlClicked(ctrl) {
    if (TransJson.FullReviewRequired == "1") {
        $('#id_start').tooltip('show');
        return false;
    }

    if (!checkSigFiledsUpdated(currentSignor, hasInitial)) {
        if (hasInitial) {
            $('#id_signature_initials_modalPopup').modal('show');
        } else {
            $('#id_signature_modal').modal('show');
        }
        AsssignSigCtrilId = ctrl.id;
        return false;
    }

    AsssignSigCtrilId = '';

    var e;

    var strName = ctrl.id.toString();
    document.getElementById(ctrl.id).setAttribute('style', 'display:none');
    document.getElementById("label_" + ctrl.id).setAttribute('style', 'display:none');
    if (strName.search('initial_') != -1) {
        $("#" + "image_" + ctrl.id).prop("src", $("#" + currentSignor + "_INITIAL").val());
        $("#" + "image_" + ctrl.id).show();
        $("#" + "remove_" + ctrl.id).show();
        e = ctrl.id.replace("initial_", "");
    } else {
        $("#" + "image_" + ctrl.id).prop("src", $("#" + currentSignor + "_SIG").val());
        $("#" + "image_" + ctrl.id).show();
        $("#" + "delete_" + ctrl.id).show();
        e = ctrl.id.replace("sig_", "");
    }

    fnApplyDateFileds(CollectSigsJson, e);
    CurrentSigBlock[findItem(CurrentSigBlock, e)].collected = true;
    var txtFld;
    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        $("#id_start").text(TransJson.NextAction);
    } else {
        if (txtFiledNotEntered == null) {
            $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[result].sig_name).parent('div').position().top }, 'slow');
            window.scroll(0, -100);
            $("#id_start").text("Next");
        } else {
            $("#" + txtFiledNotEntered).focus();
            txtFiledNotEntered = null;
        }

    }

    var intUnSignedSigs = getUnsingedSigsCount(CurrentSigBlock);

    $("#id_location1").text(intUnSignedSigs + " locations");
}


function getUnsingedSigsCount(arr) {
    icount = 0;
    for (var i = 0; i < arr.length; i++) {
        if (!arr[i].Collected) {
            icount++;
        }
    }
    return icount;
}


function fnAssignSigImagetoCtrl(ctrl) {
    var e;

    document.getElementById(ctrl).setAttribute('style', 'display:none');
    document.getElementById("label_" + ctrl).setAttribute('style', 'display:none');

    if (ctrl.search('initial_') != -1) {
        $("#" + "image_" + ctrl).prop("src", $("#" + currentSignor + "_INITIAL").val());
        $("#" + "image_" + ctrl).show();
        $("#" + "remove_" + ctrl).show();
        e = ctrl.replace("initial_", "");
    } else {

        $("#" + "image_" + ctrl).prop("src", $("#" + currentSignor + "_SIG").val());
        $("#" + "image_" + ctrl).show();
        $("#" + "delete_" + ctrl).show();
        e = ctrl.replace("sig_", "");
    }

    CurrentSigBlock[findItem(CurrentSigBlock, e)].collected = true;
    fnApplyDateFileds(CollectSigsJson, e);
    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        $("#id_start").text(TransJson.NextAction);
    } else {
        $('html, body').animate({ scrollTop: $("#" + (CurrentSigBlock[result].is_initial ? "initial" : "sig") + "_" + CurrentSigBlock[result].sig_name).parent('div').position().top }, 'slow');
        window.scroll(0, -100);
    }

    var intUnSignedSigs = getUnsingedSigsCount(CurrentSigBlock);

    $("#id_location1").text(intUnSignedSigs + " locations");
}


function fnApplyTextFileds(myDocumentArray) {
    if (myDocumentArray.TextFieldBlock != null) {
        $.each(myDocumentArray.TextFieldBlock, function (key, value) {
            var divElement = document.createElement("div");
            divElement.setAttribute("style", fnApplyHigherResolution(value.TextFieldStyle));

            var element = document.createElement("input");
            element.setAttribute("type", "text");
            element.setAttribute("onkeyup", "CheckTextFields()");
            element.setAttribute("style", "background-color: yellow");
            element.id = value.TextFieldName;
            divElement.appendChild(element);
            document.getElementById('cont1').appendChild(divElement);
        });
    }

}


function fnApplyDateFiledsOnClick(elem) {
    var divElement = document.createElement("div");
    divElement.setAttribute("style", value.DateStyle);

    var element = document.createElement("input");
    element.setAttribute("type", "button");
    element.setAttribute("style", "background-color: yellow");
    element.id = elem.DateFieldName;
    element.value = elem.DateValue;
    divElement.appendChild(element);
    document.getElementById('cont1').appendChild(divElement);
}


function fnApplyDateFileds(myDocumentArray, elem) {
    if (myDocumentArray.DateFiledBlock != null) {
        $.each(myDocumentArray.DateFiledBlock, function (key, value) {
            if (value.DateFieldName == elem + "_date") {
                var divElement = document.createElement("div");
                divElement.setAttribute("style", fnApplyHigherResolution(value.DateStyle));
                var element = document.createElement("input");
                element.setAttribute("type", "button");
                element.setAttribute("style", "background-color: yellow");
                element.id = value.DateFieldName;
                element.value = value.DateValue;
                divElement.appendChild(element);
                document.getElementById('cont1').appendChild(divElement);
                return;
            }
        });
    }
}


/**
 * Create the docs list on the left pane
 *
 */
function fnSignStatus(signStatus, currSignor, currentDocId) {
    $("#id_sign_status_docs").empty();

    // html for checkmark
    var checkmark = $("<div class='doc-selected-wrapper check-icon'><div class='roundedTwo docSelector'><input type='checkbox' disabled='disabled' checked='checked'><label></label>");
    var docNumber = 0;

    $.each(signStatus.doc_sign_status, function (n, ele) {

        if (currSignor == ele.signer_type) {
            docNumber += 1;

            // doc item displayed in the left pane
            var li = $("<li class='panel-document text-center doc_popup'>").attr("id", "doc-" + ele.doc_index_id);

            // image base for the doc item
            var imgDiv = $("<div>").addClass('doc-icon-wrapper');
            $("<img>").attr('src', '/static/images/doc_iconX2.png')
                      .addClass((currentDocId == ele.doc_index_id) ? 'doc-icon-selected' : 'doc-icon')
                      .appendTo(imgDiv);

            // add signed checkmark to signed docs
            if (ele.signer_status.toUpperCase() == 'SIGNED' && ele.signer_type.toUpperCase() == currSignor.toUpperCase()) {
                checkmark.clone().appendTo(imgDiv);
            }

            imgDiv.appendTo(li);

            // doc title
            $("<p class='text-center panel-document-title'>").html(ele.template_type_desc).appendTo(li);
            $("<p class='panel-document-number'>").html(docNumber).appendTo(li);

            // display the doc
            $("#id_sign_status_docs").append(li);

            // load doc onclick
            $('#doc-' + ele.doc_index_id).on(wchEvent, function (evt) {
                fnLoadUserSelectedDoc(ele.doc_index_id);
            });
        }
    });
    theScroll = new IScroll('#id_document_wrapper');
}


function fnLoadUserSelectedDoc(docIndexId) {
    if (CurrentSigBlock == null) {
        fnLoadNewSelectionWithSaveDoc(docIndexId, 'New Selection');
        return;
    }

    atLeastoneSignCollected = false;
    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        fnLoadNewSelectionWithSaveDoc(docIndexId, 'Save');
    } else if (!atLeastoneSignCollected) {
        fnLoadNewSelectionDoc(docIndexId);
    }
    else {
        $('#id_saveexit_model_side_panel').modal('show');
        $("#id_saveexit_model_side_panel").attr('docIndexId', docIndexId);
    }
}


function fnLoadNewSelectionWithSaveDoc(docIndexId, action) {
    CollectSigsJson.str_action = 'Save';
    CollectSigsJson.user_selected_doc_index_id = docIndexId;
    SaveSignatures();
}


function fnLoadNewSelectionDoc(docIndexId) {
    if (typeof docIndexId === 'undefined')
        docIndexId = $("#id_saveexit_model_side_panel").attr('docIndexId');
    fnClearSigAndInitials();
    CollectSigsJson.str_action = 'New Selection';
    CollectSigsJson.user_selected_doc_index_id = docIndexId;
    SaveSignatures();
}


function SaveAndExit() {
    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        isSaveExitPending = true;
        SaveSignatures();
    } else {
        $("#id_saveexit_model").modal('show');
        return false;
    }
}


function WithdrawConsent() {
    $("#id_withdraw_model").css('display', 'block');
    return false;
}


function SaveAndExitOK() {
    fnClearSigAndInitials();
    WebViewBridge.call('exitSigningRoom', { 'status': 'SaveAndExit' });
    return false;

}


function fnClearSigAndInitials() {
    if (CurrentSigBlock == null) return;
    $.each(CurrentSigBlock, function (n, block) {
        block.Collected = false;
    });

    fnClearAllSigsAndInitials();
}


function fnCls(e) {
    document.getElementById(e).style.visibility = "hidden";
    var sigid = e.split("_+");
    document.getElementById(sigid[0]).style.visibility = "hidden";
    return false;
}


function SignPopupClick() {
    $('#popupDialog').popup('open');
    return false;
}


function SignaturePopupClick() {
    $('#popupDialog').popup('open');
    return false;
}


function btnNextClicked(strSignorType) {
    if (apiSign.getSignature() == '') {
        alert('Please sign the document.');
        return false;
    }

    document.getElementById(strCurrentActiveSigBlock + "_SIG").value = apiSign.getSignatureImage();

    if (apiIntial.getSignature() == '') {
        alert('Please put initials.');
        return false;
    }

    document.getElementById(strCurrentActiveSigBlock + "_INITIAL").value = apiIntial.getSignatureImage();

    $("#id_signature_modal").dialog("close");
    return false;
}


function fnAssignCurrentSig(e) {
    $('#' + e).css({ 'background': 'transparent' });
    document.getElementById(e).height = document.getElementById(e).height;
    document.getElementById(e).width = document.getElementById(e).width;
    if (CurrentSigBlock[findItem(CurrentSigBlock, e)].IsInitial == true) {
        document.getElementById(e).src = document.getElementById(strCurrentActiveSigBlock + "_INITIAL").value;
    } else {
        document.getElementById(e).src = document.getElementById(strCurrentActiveSigBlock + "_SIG").value;
    }

    CurrentSigBlock[findItem(CurrentSigBlock, e)].Collected = true;

    return false;
}


function findItem(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].sig_name === value) {
            return (i);
        }
    }
    return (-1);
}


/**
 * Actually function name should be "findFirstUnsignedBlock"
 */
function CheckFullySigned(arr) {
    txtFiledNotEntered = null;
    atLeastoneSignCollected = false;
    if (arr == null) return (200); //nothing to sign either because it was already signed or it's non-signable document

    for (var j = 0; j < arr.length; j++) {
        if (arr[j].collected) {
            atLeastoneSignCollected = true;             // charlee: this is used to decide whether to save the doc when switching doc....
        }
    }

    for (var i = 0; i < arr.length; i++) {
        if (!arr[i].collected) {
            return (i);
        }
    }

    if (CollectSigsJson.TextFieldBlock != null) {
        arText = CollectSigsJson.TextFieldBlock;

        for (var i = 0; i < arText.length; i++) {
            if ($("#" + arText[i].TextFieldName).val().length <= 1) {
                $("#id_start").text("Next");
                txtFiledNotEntered = arText[i].TextFieldName;
                return (null);
            }
        }
    }
    return (200);
}


function checkSigFiledsUpdated(Signor, IntialRequied) {
    if ($("#" + Signor + "_SIG").val() == "") {
        return false;
    }

    if (IntialRequied) {
        if ($("#" + Signor + "_INTIAL").val() == "") {
            return false;
        }
    }
    return true;
}


$(function () {
    $(window).scroll(function () {
        var docElement = $(document)[0].documentElement;
        var winElement = $(window)[0];

        if ((docElement.scrollHeight - winElement.innerHeight) == winElement.pageYOffset) {
            if (TransJson.FullReviewRequired == "1") {
                $('#id_start').tooltip('hide');
                $('#id_start').prop('disabled', false);
                TransJson.FullReviewRequired = 0;
            }
        }
    });
});


function CheckTextFields() {
    for (K = 0; K <= CollectSigsJson.TextFieldBlock.length - 1; K++) {
        CollectSigsJson.TextFieldBlock[K].TextFieldValue = $("#" + CollectSigsJson.TextFieldBlock[K].TextFieldName).val();
    }

    var result = CheckFullySigned(CurrentSigBlock);
    if (result == 200) {
        $("#id_start").text(TransJson.NextAction);
    } else {
        if (txtFiledNotEntered == null) {
            $("#id_start").text("Next");

        } else {
            $("#" + txtFiledNotEntered).focus();
            txtFiledNotEntered = null;
        }
    }
}