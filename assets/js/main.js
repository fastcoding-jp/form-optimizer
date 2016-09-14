$(function(){
    
    var app = this;

    app.init = function(){
        app.form();
        app.events();
    }
    
    app.form = function(){
        $("#contact_form").formOptimizer({
            language_path: 'assets/lang/',
            language:'fr_FR',
            zipcode_regexp: /^[0-9]{5}/g,
            on_load: function(){
                app.on_scroll();
            }
        });
    }
    
    app.events = function(){
        $(window).scroll(app.on_scroll);
    }
    
    app.on_scroll = function(){
        var scroll_top = $(window).scrollTop();
        if(scroll_top>=$("#section-title").height()) $("#fo-required-fields").addClass("fixed");
        else $("#fo-required-fields").removeClass("fixed");
    }

    app.init();
    
});