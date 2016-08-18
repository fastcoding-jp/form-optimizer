$.fn.formOptimizer = function(settings){
    
    var app = this;
    
    app.$form = $(this);
    
    app.settings = $.extend({
        language_path: "./",
        language: 'en_US',
        email_regexp: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
        tel_regexp: /^[0-9]{2,3}[0-9]{4}[0-9]{4}$/g,
        url_regexp: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g,
        zipcode_regexp: /^[0-9]{3}-[0-9]{4}/g,
        date_regexp: /^[0-9]{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/g,
        time_regexp: /^([0-1]{1}[0-9]{1}|2[0-3]):[0-5]{1}[0-9]$/g,
        number_regexp: /^\d*$/g,
        required_text: true,
        on_load: function(){}
    }, settings);
    
    app.init = function(){
        app.setClasses();
        app.initHTML();
        app.events();
    }
    
    app.setClasses = function(){
        
        app.$form.addClass("fo-optimized");
        app.$form.find("input, select, textarea").addClass("fo-field");
        app.$form.find("[type='email']").addClass("fo-email");
        app.$form.find("[type='tel']").addClass("fo-tel");
        app.$form.find("[type='url']").addClass("fo-url");
        app.$form.find("[type='date']").addClass("fo-date");
        app.$form.find("[type='time']").addClass("fo-time");
        app.$form.find("[type='number']").addClass("fo-number");
        app.$form.find("[type='radio']").addClass("fo-radio");
        app.$form.find("[type='checkbox']").addClass("fo-checkbox");
        app.$form.find("select").addClass("fo-select");
        app.$form.find("textarea").addClass("fo-textarea");
        
        app.$form.find(".fo-field").each(function(index){
            $(this).attr("fo-field-id", index);
        });
    }
    
    app.initHTML = function(){
        
        if($("#fo-required-fields").length==0) $("body").append('<div id="fo-required-fields">'+app.lang.required_fields+'<span></span></div>');
        if(app.settings.required_text) app.find(".fo-item.fo-required .fo-label").append('<span class="fo-required-text">'+app.lang.required_text+'</span>');
        app.add_incomplete_button();
        if(app.$form.find(".fo-region").length>0){
            app.$form.find(".fo-region").append('<option value="">'+app.lang.empty_field+'</option>')
            app.lang.prefectures.forEach(function(region){
                app.$form.find(".fo-region").append('<option value="'+region.name+'">'+region.name+'</option>')
            });
        }
    }
    
    app.add_incomplete_button = function(){
        app.$form[0].submit_button = app.$form.find(".fo-submit")[0].outerHTML;
        app.$form.find(".fo-submit").clone().addClass("fo-submit-invalid").removeClass("fo-submit").appendTo(app.$form.find(".fo-submit").parent());
        app.$form.find(".fo-submit").remove();
        if(app.$form.find(".fo-submit-invalid").is("button")) app.$form.find(".fo-submit-invalid").html(app.lang.incomplete).attr("type", "button");
        else app.$form.find(".fo-submit-invalid").html("").attr("value", app.lang.incomplete).attr("type", "button");
    }
    
    app.events = function(){

        app.$form.find(".fo-field").each(function(){
            app.checkField($(this));
        });
        
        app.$form.find(".fo-field").on("click keyup change", function(e){
            if(!$(this).hasClass("fo-submit-invalid") && !$(this).hasClass("fo-submit") && !$(this).hasClass("fo-submit-button")) app.checkField($(this));
            
            if($(this).hasClass("fo-zipcode")){
                if(!$(this).hasClass("fo-invalid-value")){
                    $.ajax({
                        url: "http://where.yahooapis.com/v1/places.q("+$(this).val()+","+app.lang.country_code+");count=0?appid=dj0zaiZpPTNVakxDbDlIVmd4RCZzPWNvbnN1bWVyc2VjcmV0Jng9NTY-&format=json&lang="+app.lang.id,
                        type: "GET",
                        dataType: "jsonp",
                        success: function(data){
                            if(data.places.place){
                                var region = "", city="", street="";
                                if(data.places.place[0].admin1) region = data.places.place[0].admin1;
                                if(data.places.place[0].admin2) city = data.places.place[0].admin2;
                                if(data.places.place[0].admin3) street = data.places.place[0].admin3;
                                app.$form.find(".fo-region option[value=\""+region+"\"]").prop("selected", true);
                                app.$form.find(".fo-address-1").val(city+app.lang.separator+street);
                                app.$form.find(".fo-region").trigger("click");
                                app.$form.find(".fo-address-1").trigger("click");
                            }
                        }
                    })
                }
            }
    
        });

    }
    
    app.datepicker_support = function(field){
        var input = document.createElement('input');
        input.setAttribute('type', field);
        var notACorrectValue = 'not-a-correct-value';
        input.setAttribute('value', notACorrectValue); 
        return (input.value !== notACorrectValue);
    }

    app.checkField = function($field){
        
        if(!app.checkFieldEmpty($field)) $field.addClass("fo-not-empty");
        else $field.removeClass("fo-not-empty");
        
        if($field.parents(".fo-item").hasClass("fo-required")){
            if(!$field.hasClass("fo-not-empty")) $field.parents(".fo-item").addClass("fo-invalid-required");
            else $field.parents(".fo-item").removeClass("fo-invalid-required");
        }
                
        var regexp = /[^]*/, test_value=$field.val(), message="";
        if($field.hasClass("fo-email")){
            message = app.lang.email.message;
            regexp = new RegExp(app.settings.email_regexp);
        }
        if($field.hasClass("fo-url")){
            message = app.lang.url.message;
            regexp = new RegExp(app.settings.url_regexp);
        }
        if($field.hasClass("fo-tel")){
            message = app.lang.tel.message;
            regexp = new RegExp(app.settings.tel_regexp);
        }
        if($field.hasClass("fo-date")){
            message = app.lang.date.message;
            if(!app.datepicker_support("date")) regexp = new RegExp(app.settings.date_regexp);
        }
        if($field.hasClass("fo-time")){
            message = app.lang.time.message;
            regexp = new RegExp(app.settings.time_regexp);
        }
        if($field.hasClass("fo-number")){
            message = app.lang.number.message;
            regexp = new RegExp(app.settings.number_regexp);
        }
        if($field.hasClass("fo-zipcode")){
            message = app.lang.zipcode.message;
            regexp = new RegExp(app.settings.zipcode_regexp);
        }
        if($field.hasClass("fo-katakana")){
            message = app.lang.katakana.message;
            regexp = new RegExp(/[\u30A0-\u30FF]+/g);
        }
        if($field.hasClass("fo-hiragana")){
            message = app.lang.hiragana.message;
            regexp = new RegExp(/[\u3041-\u3096]+/g);
        }

        if(test_value.match(regexp)==null) $field.addClass("fo-invalid-value");
        else $field.removeClass("fo-invalid-value");
        
        if($field.parents(".fo-item").hasClass("fo-invalid-required") || $field.hasClass("fo-invalid-value")) $field.addClass("fo-invalid-field");
        else $field.removeClass("fo-invalid-field");
        
        if($field.hasClass("fo-invalid-field")){
            if($field.parents(".fo-item").hasClass("fo-invalid-required")){
                if($field.hasClass("fo-invalid-value") && $field.parents(".fo-fields").find(".fo-error[fo-field-id='"+$field.attr("fo-field-id")+"']").length==0){
                    $field.parents(".fo-fields").find(".fo-errors").append('<div class="fo-error" fo-field-id="'+$field.attr("fo-field-id")+'">'+message+'</div>');
                } 
            }
            else{
                if($field.hasClass("fo-invalid-value")){
                    if($field.hasClass("fo-not-empty") && $field.parents(".fo-fields").find(".fo-error[fo-field-id='"+$field.attr("fo-field-id")+"']").length==0){
                        $field.parents(".fo-fields").find(".fo-errors").append('<div class="fo-error" fo-field-id="'+$field.attr("fo-field-id")+'">'+message+'</div>');
                    }
                    else if(!$field.hasClass("fo-not-empty")) $field.parents(".fo-fields").find(".fo-error[fo-field-id='"+$field.attr("fo-field-id")+"']").remove();
                }
            }   
        }
        else{
            $field.parents(".fo-fields").find(".fo-error[fo-field-id='"+$field.attr("fo-field-id")+"']").remove();
        }

        app.checkForm();
        
    }
    
    app.checkFieldEmpty = function($field){
        
        var empty = false;
        if($field.hasClass("fo-radio") || $field.hasClass("fo-checkbox")){
            if(app.$form.find("[name='"+$field.attr("name")+"']:checked").length==0) empty=true
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
        $("#fo-required-fields span").html(nbInvalidRequired+"/"+app.$form.find(".fo-required").length);
        
        if(app.$form.find(".fo-invalid-required").length>0) $("#fo-required-fields").fadeIn();
        else $("#fo-required-fields").fadeOut();
        
        var invalidFields = 0;
        invalidFields += app.$form.find(".fo-invalid-required").length;
        invalidFields += app.$form.find(".fo-invalid-value.fo-not-empty").length;
        
        if(invalidFields==0){
            if(app.$form.find(".fo-submit").length==0){
                app.$form.find(".fo-submit-invalid").parent().append(app.$form[0].submit_button);
                app.$form.find(".fo-submit-invalid").hide();
            }
        }
        else{
            app.$form.find(".fo-submit").remove();
            app.$form.find(".fo-submit-invalid").show();
        }
        
        app.settings.on_load();
        
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