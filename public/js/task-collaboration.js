var socket = io.connect();

socket.on('emit todo content', function(data){
	console.log('todo refresh');
	var $el = $('#'+data._id).parent().children('.collapsible-body');
	$el.html(data.content);
});

socket.on('emit new todo', function(data){
	//
});
