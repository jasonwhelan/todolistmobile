$(document).ready(function() {
  $("#login").bind("tap",function(){
    $('#tab_main').tap()
   $('#tab_main').addClass('ui-btn ui-btn-up-a ui-btn-active')
   $('#tab_login').removeClass('ui-btn ui-btn-up-a ui-btn-active')
   $('#tab_login').addClass('ui-btn ui-btn-up-a')
    $("#content_main").show()
});
  $(".settings").bind("tap",function(){
    $('#tab_main').tap()
    $('#tab_main').addClass('ui-btn ui-btn-up-a ui-btn-active')
   $('#tab_settings').removeClass('ui-btn ui-btn-up-a ui-btn-active')
   $('#tab_settings').addClass('ui-btn ui-btn-up-a')
    $("#content_main").show()
});


  if (localStorage.chkbx && localStorage.chkbx != '') {
    $('#remember_me').attr('checked', 'checked')
    $('#username').val(localStorage.usrname)
    $('#pass').val(localStorage.pass)
} else {
    $('#remember_me').removeAttr('checked')
    $('#username').val('')
    $('#pass').val('')
}

$('#remember_me').bind("tap",function() {

    if ($('#remember_me').is(':checked')) {

        localStorage.usrname = $('#username').val()
        localStorage.pass = $('#pass').val()
        localStorage.chkbx = $('#remember_me').val()
    } else {
        localStorage.usrname = ''
        localStorage.pass = ''
        localStorage.chkbx = ''
    }
});

$('#inc').bind("tap",function() {
    var fontSize = parseInt($("body").css("font-size"));
    fontSize = fontSize + 1 + "px";
    $("body").css({'font-size':fontSize}).refresh();
});

$('#dec').bind("tap",function() {
    var fontSize = parseInt($("body").css("font-size"));
    fontSize = fontSize -1 + "px";
    $("body").css({'font-size':fontSize});
});

$('#colorpicker').farbtastic('#color');

});
