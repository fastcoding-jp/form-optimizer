$.fn.formOptimizer = function(settings){
    
    var app = this;
    
    app.$form = $(this);
    
    var scripts= document.getElementsByTagName('script');
    var path= scripts[scripts.length-1].src.split('?')[0];
    app.current_path = path.split('/').slice(0, -1).join('/')+'/';
    
    app.settings = $.extend({
        language_path: app.current_path,
        language: 'en_US',
        tel_mode: 'global'
    }, settings);
    
    app.init = function(){
        app.setClasses();
        app.initHTML();
        app.events();
    }
    
    app.initHTML = function(){
        if($("#fo-required-fields").length==0) $("body").append('<div id="fo-required-fields">'+app.lang.required_fields+'<span></span></div>');
        app.$submit_button = app.$form.find(".fo-submit")[0].outerHTML;
        app.$form.find(".fo-submit").clone().addClass("fo-submit-invalid").removeClass("fo-submit").appendTo(app.$form.find(".fo-submit").parent());
        app.$form.find(".fo-submit").remove();
        if(app.$form.find(".fo-submit-invalid").is("button")) app.$form.find(".fo-submit-invalid").html(app.lang.incomplete).attr("type", "button");
        else app.$form.find(".fo-submit-invalid").html("").attr("value", app.lang.incomplete).attr("type", "button");
    }
    
    app.setClasses = function(){
        app.$form.addClass("fo-optimized");
        app.$form.find("input, select, textarea").addClass("fo-item");
        app.$form.find("input[type]").not("type[button]").each(function(){
            $(this).addClass("fo-"+$(this).attr("type"));
        });
        app.$form.find("select").addClass("fo-select");
        app.$form.find("textarea").addClass("fo-textarea");
    }
    
    app.events = function(){
        
        app.$form.on("click", function(){
            if(!app.$form.hasClass("fo-started-input")){
                app.$form.find(".fo-item").each(function(){
                    app.checkField($(this));
                });
                app.$form.addClass("fo-started-input");
            }
        })
        
        app.$form.find(".fo-item").on("click keyup change", function(){
            if(!$(this).hasClass("fo-submit-invalid") && !$(this).hasClass("fo-submit") && !$(this).hasClass("fo-submit-button")) app.checkField($(this));
        });
        
    }
    

    app.checkField = function($field){
        
        if(!app.checkFieldEmpty($field)) $field.addClass("fo-not-empty");
        else $field.removeClass("fo-not-empty");
        
        if($field.hasClass("fo-required")){
            if(!$field.hasClass("fo-not-empty")) $field.addClass("fo-invalid-required");
            else $field.removeClass("fo-invalid-required");
        }
        
        var regex = /[^]*/, test_value=$field.val(), message="";
        if($field.hasClass("fo-email")){
            message = app.lang.email.message;
            regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/g;
        }
        if($field.hasClass("fo-url")){
            message = app.lang.url.message;
            regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g;
        }
        if($field.hasClass("fo-tel")){
            message = app.lang.tel.message;
            switch(app.settings.tel_mode){
                case 'global':
                    regex = /^([0-9\uff10-\uff19\+\-\uff0b\u30FC\uFF0D]){8,66}$/g;
                    break;
                case 'jp':
                    test_value = test_value.replace(/-/g, "");
                    regex = /^[0-9]{2,3}[0-9]{4}[0-9]{4}$/g;
                    break;
                case 'fr':
                    regex = /^[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}$/g;
                    break;
                default:
                    regex = /^([0-9\uff10-\uff19\+\-\uff0b\u30FC\uFF0D]){8,66}$/g;
                    break;
            }
        }

        if(test_value.match(regex)==null) $field.addClass("fo-invalid-value");
        else $field.removeClass("fo-invalid-value");
        
        if($field.hasClass("fo-invalid-required") || $field.hasClass("fo-invalid-value")) $field.addClass("fo-invalid-field");
        else $field.removeClass("fo-invalid-field");
        
        if($field.hasClass("fo-invalid-field")){
            if($field.hasClass("fo-invalid-required")){
                if($field.hasClass("fo-invalid-value") && $field.parent().find(".fo-invalid-field-message").length==0){
                    $field.after('<span class="fo-invalid-field-message">'+message+'</span>');
                }
            }
            else{
                if($field.hasClass("fo-invalid-value")){
                    if($field.hasClass("fo-not-empty") && $field.parent().find(".fo-invalid-field-message").length==0){
                        $field.after('<span class="fo-invalid-field-message">'+message+'</span>');
                    }
                    else if(!$field.hasClass("fo-not-empty")) $field.parent().find(".fo-invalid-field-message").remove();
                }
            }   
        }
        else{
            $field.parent().find(".fo-invalid-field-message").remove();
        }

        app.checkForm();
        
    }
    
    app.checkFieldEmpty = function($field){
        
        var empty = false;
        if($field.hasClass("fo-radio")){
            if(app.$form.find("[name="+$field.attr("name")+"]").length==0) empty=true;
        }
        else if($field.hasClass("fo-checkbox")){
            if(!$field.is(":checked")) empty=true;
        }
        else{
            if($field.val().length==0) empty=true;
        }
        return empty;
    }

    app.checkForm = function(){
        
        var nbInvalidRequired = app.$form.find(".fo-invalid-required").length;
        $("#fo-required-fields span").html(nbInvalidRequired+"/"+$(".fo-required").length);
        
        if(app.$form.find(".fo-invalid-required").length>0) $("#fo-required-fields").fadeIn();
        else $("#fo-required-fields").fadeOut();
        
        var invalidFields = 0;
        invalidFields += app.$form.find(".fo-invalid-required").length;
        invalidFields += app.$form.find(".fo-invalid-value.fo-not-empty").length;
        
        if(invalidFields==0){
            if(app.$form.find(".fo-submit").length==0){
                app.$form.find(".fo-submit-invalid").parent().append(app.$submit_button);
                app.$form.find(".fo-submit-invalid").hide();
            }
        }
        else{
            app.$form.find(".fo-submit").remove();
            app.$form.find(".fo-submit-invalid").show();
        }
        
    }
    
    return $.ajax({
        url: app.settings.language_path+app.settings.language+'.json',
        type:'GET',
        error: function(){
            alert("Error downloading Form Optimizer language file");
        },
        success: function(lang){
            app.lang = lang;
            app.$form.each(function(){
                app.init($(this)); 
            });
        }
    });
}