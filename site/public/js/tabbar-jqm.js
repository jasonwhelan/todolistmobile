$(function(){
  
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
      $('#header').show()
      $('#footer').show()
      $.mobile.fixedToolbars.show(true)
    }
  }

  $("#tab_login").tap(handletab('login',0)).tap()
  $("#tab_main").tap(handletab('main',1))
  $("#tab_settings").tap(handletab('settings',2))
    
  })

