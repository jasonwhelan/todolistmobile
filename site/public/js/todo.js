function pd( func ) {
  return function( event ) {
    event.preventDefault()
    func && func(event)
  }
}

document.ontouchmove = pd()

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  escape:      /\{\{-(.+?)\}\}/g,
  evaluate:    /\{\{=(.+?)\}\}/g
};


var browser = {
  android: /Android/.test(navigator.userAgent)
}
browser.iphone = !browser.android


var app = {
  model: {},
  view: {}
}

var bb = {
  model: {},
  view: {}
}

function logargs() {
  console.log(arguments)
}

var http = {
  req: function(method,url,data,callback) {
    $.ajax({
      url:         url,
      type:        method,
      contentType: 'application/json',
      data:        data ? JSON.stringify(data) : null,
      dataType:    'json',
      crossDomain: true,
      cache:       false,
      success:     callback || logargs,
      error:       callback || logargs
    })
  },


  post: function(url,data,callback) {
    http.req('POST',url,data,callback)
  },

  put: function(url,data,callback) {
    http.req('PUT',url,data,callback)
  },

  get: function(url,callback) {
    http.req('GET',url,null,callback)
  },

  del: function(url,callback) {
    http.req('DELETE',url,null,callback)
  }
}

bb.init = function() {

  var scrollContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[data-role='content']")[0] )
        }
      },1)
    }
  }

  var saveon = false
  var swipeon = false

  bb.model.State = Backbone.Model.extend(_.extend({    
    defaults: {
      items: 'loading'
    },
  }))

  bb.model.Loc = Backbone.Model.extend(_.extend({ 

    defaults: {
      longit: '',
      latit: '',
    },

    initialize: function() {
      var self = this
      _.bindAll(self)

      //self.getloc()
    },

    saveloc: function(loc){
      var self = this
      localStorage.longit = loc.longit
      localStorage.latit = loc.latit
    },

    getloc: function(){
      var self = this

      var a = navigator.online
      if(a){
        navigator.geolocation.getCurrentPosition(
        function(position){
          var latitude  = position.coords.latitude;
          var longitude = position.coords.longitude;
          self.longit = longitude
          self.latit = latitude
          localStorage.longit = longitude
          localStorage.latit = latitude
          self.saveloc(self)
          //return self
        })

      }else{
        self.longit = localStorage.longit
        self.latit = localStorage.latit
        //return self
      }
     // app.view.loc.render()
    }



  }))


  bb.model.Item = Backbone.Model.extend(_.extend({    
    defaults: {
      text: '',
      done: false,
      id: new Date().getTime()
    },

    initialize: function() {
      var self = this
      _.bindAll(self)
    }

  }))


  bb.model.Items = Backbone.Collection.extend(_.extend({    
    model: bb.model.Item,
    url: '/api/rest/todo',
    //localStorage: new Store("items"),

    initialize: function() {
      var self = this
      _.bindAll(self)
      self.count = 0

      self.on('reset',function() {
        self.count = self.length
      })
    },

    additem: function(item) {
      var self = this 
      self.add(item)
      self.count++
      http.post('/api/rest/todo', item, logargs)
      //item.save() 
    },

    updateitem: function(itm){
      var uri = '/api/rest/todo/' + itm.id
      http.put(uri, itm, logargs)
    },

    deleteitem: function(itm){
      self = this
      var uri = '/api/rest/todo/' + itm
      http.del(uri, logargs)
    }

  }))

  bb.view.Loc = Backbone.View.extend(_.extend({ 
    initialize: function(loc) {
      var self = this
      _.bindAll(self)
      self.longit = loc.longit
      self.latit = loc.latit

      self.setElement("#loc")
      self.render()
    },

    render: function() {
      var self = this

      //self.$el.show()

      

      txt = 
          'Current location for ToDo List'+'<br/>'+
          'Latitude:  '+self.latit+'<br />'+
          'Longitude: '+self.longit+'<br />'
        //self.$el.html("hi") 
    }

  }))

bb.view.Head = Backbone.View.extend(_.extend({    
  events: {
    'tap #add': function(){ 
      var self = this
      self.elem.add.hide()
      self.elem.cancel.show()  
        //app.view.itemform = new bb.view.Itemform(app.model.items)     
        app.view.itemform.render()

      },

      'tap #cancel': function(){ 
        var self = this
        self.elem.cancel.hide()
        self.elem.add.show()
        app.view.itemform.cancel()
      }
    },

    initialize: function( items ) {
      var self = this
      _.bindAll(self)
      self.items = items

      self.setElement("div[data-role='header']")

      self.elem = {
        add: self.$el.find('#add'),
        title: self.$el.find('h1'),
        cancel: self.$el.find('#cancel')
      }
      
      self.tm = {
        title: _.template( self.elem.title.html() )
      }

      self.elem.add.hide()

      app.model.state.on('change:items',self.render)
      self.items.on('add',self.render)
    },

    render: function() {
      var self = this
      
      var loaded = 'loaded' == app.model.state.get('items')

      self.elem.title.html( self.tm.title({
        title: loaded ? self.items.length+' Items' : 'Loading...'
      }) )

      if( loaded ) {
        self.elem.add.show()
        self.elem.cancel.hide()
      }
    }    

  }))



bb.view.List = Backbone.View.extend(_.extend({   

  events: {

    'tap .check' : 'check',
    'tap .item_tm' : 'delbut',
    'tap .delbtn' : 'delete'

  }, 

  check: function(event){
    var self = this
    var ids = event.target.getAttribute('id')
    ids = ids.slice(5)
    var itm = self.items.at(ids)
    var done = itm.get('done')
    if(done){
      itm.set('done', false)
    }else{
      itm.set('done', true)
    }
    app.model.items.updateitem(itm)
    self.render()
  },

  delbut: function(event){
    var self = this
    var ids = event.target.getAttribute('id')

    ids = ids.slice(4)

    var itm = self.items.at(ids)
    if (swipeon){
      var delbutton = self.$el.find('div#delete'+ids)
      delbutton.hide()
      delbutton.css('display' , 'none')
      swipeon = false
    }
    else if(!swipeon){
      var delbutton = self.$el.find('div#delete'+ids)
      delbutton.css('display' , 'inline')
      delbutton.show()
      swipeon = true
    }

  },

  delete: function(event){
    var self = this
    var ids = event.target.getAttribute('id')

    ids = ids.slice(6)
    var itm = self.items.at(ids)
    app.model.items.deleteitem(itm.id)
    self.render()
  },

  initialize: function( items ) {
    var self = this
    _.bindAll(self)

    self.setElement('#list')
    self.items = items
    self.items.on('add',self.appenditem)
  },


  render: function() {
    var self = this
    self.$el.empty()
    $('#loc').show()
    self.items.each(function(item){
      self.appenditem(item)
    })
  },

  appenditem: function(item) {
    var self = this

    var itemview = new bb.view.Item({
      model: item
    })

    self.$el.append( itemview.$el.html() )      
    self.scroll()
  }

},scrollContent))



bb.view.Item = Backbone.View.extend(_.extend({   

  initialize: function() {
    var self = this
    _.bindAll(self)

    self.elem = {
      check: self.$el.find('span.check'),
      text: self.$el.find('span.text')
    }

    self.render()
  },

  render: function() {
    var self = this
    var html = self.tm.item( self.model.toJSON() )
    self.$el.append( html )  

    self.markitem(self.model.get('done'))   
    var num = $('span.check').length
    self.$el.find('span.check').attr('id', 'check'+num)
    self.$el.find('span.text').attr('id', 'text'+num)
    self.$el.find('li.item_tm').attr('id', 'item'+num)
    var delbutton = $('div.delete').clone()
    delbutton.attr('id', 'delete'+num)

    delbutton.removeClass('delete')
    delbutton.addClass('delbtn')
    delbutton.css('display' , 'inline')
    delbutton.hide()
    self.$el.find('li.item_tm').append(delbutton)
    swipeon = false
  },

  markitem: function(done) {
    var self = this
    self.$el.find('span.check').html( done ? '&#10003;' : '&nbsp;' )
    self.$el.find('span.text').css({'text-decoration': done ? 'line-through' : 'none' })
  }

},{
  tm: {
    item: _.template( $('#list').html() )
  }
}))

bb.view.Itemform = Backbone.View.extend(_.extend({   
  events: {
    'tap #save': function(){ 
      var self = this
      if(saveon){
        app.view.head.elem.add.hide()
        app.view.head.elem.cancel.show()
        self.save()
        self.$el.hide()

      }
    }
  },

  initialize: function(items) {
    var self = this
    _.bindAll(self)

    self.setElement('#newitem')
    self.items = items
    self.elem = {
      text: self.$el.find('#text'),
      save: self.$el.find('#save')
    }

    self.elem.text.keyup(self.enablesave)
  },

  render: function() {
    var self = this 
    self.$el.show()
    self.elem.save.css('opacity',0.3)
    self.elem.text.val('').focus()
    saveon = false
  },

  enablesave: function() {
    var self = this
    var textlen = self.elem.text.val().length
    if( !saveon && 0 < textlen ) {
      self.elem.save.css('opacity',1)
      saveon = true
    }
    else if( 0 == textlen ) {
      self.elem.save.css('opacity',0.3)
      saveon = false
    }
  },

  cancel: function(){
    var self = this 
    self.$el.hide()
    self.elem.save.css('opacity',0.3)
    self.elem.text.val('')
    saveon = false
  },

  save: function(){
    var self = this
    if( 0 == self.elem.text.val() ) {
      return
    }

    var item = new bb.model.Item({
      text: self.elem.text.val()
    })
    self.items.additem(item)
    self.elem.text.val('')
    app.view.loc.render()
    app.view.head.render()
  }

}))

}

app.init_browser = function() {
  if( browser.android ) {
    $("#main div[data-role='content']").css({
      bottom: 0
    })
  }
}


app.init = function() {
  console.log('start init')




  bb.init()

  app.init_browser()


  app.model.state = new bb.model.State()
  app.model.items = new bb.model.Items()
  app.model.loc = new bb.model.Loc()

  app.view.loc = new bb.view.Loc(app.model.loc)
  app.view.loc.render()

  app.view.head = new bb.view.Head(app.model.items)
  app.view.head.render()

  app.view.list = new bb.view.List(app.model.items)
  app.view.list.render()

  app.view.itemform =  new bb.view.Itemform(app.model.items)

  app.model.loc.getloc( {
    success: function() {
      app.model.loc.longit
      app.view.loc.render()
    }
  })

  app.model.items.fetch( {
    success: function() {
      app.model.state.set({items:'loaded'})
      app.view.list.render()
    }
  })


  console.log('end init')
}






$(app.init)