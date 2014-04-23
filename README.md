todolistmobile
==============

The ToDo List is implemented using Backbone, Jquery, Node, Nginx, MongoDB, HTML5 localstorage, GEolocationAPI

The client side is implmented using Backbone Models and Views. The Main Model in this application is an item which represents a TODO item. A collection model is also implemented to handle storing and manipulating a collection of items. A location model is also implemented. The models also have event bindings which are used to handle events such as adding an item, checking/unchecking an item, or deleting an item. The Backbone Views are then used to present the information to the user.

An app cache is used for storing and loading resources where possible.
The application works on a desktop browser, android and iphone devices without any visible problems encountered.

The app has tab functionality implemented using jquery. The first tab presents a login. This is implemented by using localstorage to remember the username and password. The middle tab is the todo list. The final tab is for settings.

The backend is implemented using Nginx as a proxy server with Node as the application server. MongoDB is used as the persistence layer. A rest API is used to service the transport of data between the front and backend. Routes are defined so that CRUD methods can be accessed. Several Node Modules are used to make the application run such as connect, mongodb, uuid, and crossdomain.


