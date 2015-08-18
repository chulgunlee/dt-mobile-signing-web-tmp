/*
    tabSlideOUt v1.3
    
    By William Paoli: http://wpaoli.building58.com

    To use you must have an image ready to go as your tab
    Make sure to pass in at minimum the path to the image and its dimensions:
    
    example:
    
        $('.slide-out-div').tabSlideOut({
                tabHandle: '.handle',                         //class of the element that will be your tab -doesnt have to be an anchor
                pathToTabImage: 'images/contact_tab.gif',     //relative path to the image for the tab *required*
                imageHeight: '133px',                         //height of tab image *required*
                imageWidth: '44px',                           //width of tab image *required*    
        });

    
*/


(function($){
    $.fn.tabSlideOut = function(callerSettings) {
        $('#id_slider_handle .panel-handle-bar').css('top', $(window).height()/2);
        var ua = navigator.userAgent,
        wchEvent = (ua.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) ? "tap" : "click";

        var settings = $.extend({
            tabHandle: '.handle',
            speed: 300, 
            action: 'swipe',
            tabLocation: 'left',
            topPos: '200px',
            leftPos: '20px',
            fixedPosition: false,
            positioning: 'absolute',
            pathToTabImage: null,
            imageHeight: null,
            imageWidth: null,
            onLoadSlideOut: false                       
        }, callerSettings||{});

        var options = {
            dragLockToAxis: true,
            dragBlockHorizontal: true,
            preventDefault: true
        };
        var tabHandleID = document.getElementById("id_slider_handle");
        hammertime = new Hammer(tabHandleID, options);

        settings.tabHandle = $(settings.tabHandle);
        var obj = this;
        if (settings.fixedPosition === true) {
            settings.positioning = 'fixed';
        } else {
            settings.positioning = 'absolute';
        }
        
        //ie6 doesn't do well with the fixed option
        if (document.all && !window.opera && !window.XMLHttpRequest) {
            settings.positioning = 'absolute';
        }
        

        
        //set initial tabHandle css
        
        if (settings.pathToTabImage != null) {
            settings.tabHandle.css({
            'background' : 'url('+settings.pathToTabImage+') no-repeat',
            'width' : settings.imageWidth,
            'height': settings.imageHeight
            });
        }
        
        settings.tabHandle.css({ 
            'display': 'block',
            //'textIndent' : 'px',
            'outline' : 'none',
            'position' : 'absolute'
        });
        
        obj.css({
            'line-height' : '1',
            'position' : settings.positioning
        });

        
        var properties = {
                    containerWidth: parseInt(obj.outerWidth(), 10) + 'px',
                    containerHeight: parseInt(obj.outerHeight(), 10) + 'px',
                    tabWidth: parseInt(settings.tabHandle.outerWidth(), 10) + 'px',
                    tabHeight: parseInt(settings.tabHandle.outerHeight(), 10) + 'px'
                };

        //set calculated css
        if(settings.tabLocation === 'top' || settings.tabLocation === 'bottom') {
            obj.css({'left' : settings.leftPos});
            settings.tabHandle.css({'right' : 0});
        }
        
        if(settings.tabLocation === 'top') {
            obj.css({'top' : '-' + properties.containerHeight});
            settings.tabHandle.css({'bottom' : '-' + properties.tabHeight});
        }

        if(settings.tabLocation === 'bottom') {
            obj.css({'bottom' : '-' + properties.containerHeight, 'position' : 'fixed'});
            settings.tabHandle.css({'top' : '-' + properties.tabHeight});
            
        }
        
        if(settings.tabLocation === 'left' || settings.tabLocation === 'right') {
            obj.css({
                'height' : properties.containerHeight,
                'top' : settings.topPos
            });
            
            settings.tabHandle.css({'top' : 0});
        }
        
        if(settings.tabLocation === 'left') {
            obj.css({ 'left': '-' + properties.containerWidth});
            settings.tabHandle.css({'right' : '-' + properties.tabWidth});
        }

        if(settings.tabLocation === 'right') {
            obj.css({ 'right': '-' + properties.containerWidth});
            settings.tabHandle.css({'left' : '-' + properties.tabWidth});
            
            $('html').css('overflow-x', 'hidden');
        }

        //functions for animation events
        
        settings.tabHandle.on(wchEvent,function(event){
            event.preventDefault();
        });
        
        var slideIn = function() {
            $('#id_slider_handle').css('background','none');
            $('#id_slider_handle .panel-handle-bar').css('background','#999');
            
            if (settings.tabLocation === 'top') {
                obj.animate({top:'-' + properties.containerHeight}, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'left') {
                obj.animate({left: '-' + properties.containerWidth}, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'right') {
                obj.animate({right: '-' + properties.containerWidth}, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'bottom') {
                obj.animate({bottom: '-' + properties.containerHeight}, settings.speed).removeClass('open');
            }    
        };
        
        var slideOut = function() {
            $('#id_slider_handle').css('background','#676767');
            $('#id_slider_handle .panel-handle-bar').css('background','#444444');
            
            if (settings.tabLocation == 'top') {
                obj.animate({top:'-3px'},  settings.speed).addClass('open');
            } else if (settings.tabLocation == 'left') {
                obj.animate({left:'-3px'},  settings.speed).addClass('open');
            } else if (settings.tabLocation == 'right') {
                obj.animate({right:'-3px'},  settings.speed).addClass('open');
            } else if (settings.tabLocation == 'bottom') {
                obj.animate({bottom:'-3px'},  settings.speed).addClass('open');
            }
        };

        var clickScreenToClose = function() {
            console.log(wchEvent);
            obj.on(wchEvent,function(event){
                event.stopPropagation();
            });
            
            $(document).on(wchEvent,function(){
                slideIn();
            });
             
            $('.signing-room-container').on('touchstart',function(e){
                slideIn();
                $('.status-badge,.ellipsis-style').each(function () {
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $(this).popover('hide');
                    }
                });
            }); 

        };
        
        var clickAction = function(){
            settings.tabHandle.on(wchEvent,function(event){
                if (obj.hasClass('open')) {
                    slideIn();
                } else {
                    slideOut();
                }
            });
            
            clickScreenToClose();
        };
        
        var swipeAction = function(){
            /*settings.tabHandle.on('swipeLeft',function(event){
                event.preventDefault();
                if (obj.hasClass('open')) {
                    slideIn();
                }
            });

            settings.tabHandle.on('swipeRight',function(event){
                event.preventDefault();
                slideOut();
            });*/
            hammertime.on("swipe", function(e) {
                $('.status-badge,.ellipsis-style').each(function() {
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $(this).popover('hide');
                    }
                });
            });

            hammertime.on("swipeleft", function(ev){
                //console.log('swipeleft');
                if (obj.hasClass('open')) {
                    slideIn();
                }
            });

            hammertime.on("swiperight", function(ev){
                //console.log('swipeRight');
                slideOut();
            });


            clickScreenToClose();
        };

        var hoverAction = function(){
            obj.hover(
                function(){
                    slideOut();
                },
                
                function(){
                    slideIn();
                });
                
                settings.tabHandle.on(wchEvent,function(event){
                    if (obj.hasClass('open')) {
                        slideIn();
                    }
                });
                clickScreenToClose();
                
        };
        
        var slideOutOnLoad = function(){
            slideIn();
            setTimeout(slideOut, 500);
        };
        
        //choose which type of action to bind
        if (settings.action === 'click') {
            clickAction();
        }
        
        if (settings.action === 'hover') {
            hoverAction();
        }
        
        if (settings.action === 'swipe') {
            swipeAction();
        }

        if (settings.onLoadSlideOut) {
            slideOutOnLoad();
        } else {
            $('#id_slider_handle').css('background', 'none');
            $('#id_slider_handle .panel-handle-bar').css('background', '#999');
        }
        
    };
})(jQuery);
