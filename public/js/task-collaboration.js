//此程式含有特別的「id前綴」，目的是用於(1)避免原生jsDOM方法不接受數字開頭的query (2)加快任何的query速度(減少次數)。
//上述是用於client socket.on的快速反應
//部分client socket.emit的id查詢尚未優化
var socket = io.connect();
var Global = this;

socket.on('emit todo title', function(data){
	console.log('todo title refresh');
	var $el = $('#li'+data._id).children('.collapsible-header').children('.todos-title');
	$el.html(unescape(data.title));
});

socket.on('emit todo content', function(data){
	console.log('todo content refresh');
	var $el = $('#li'+data._id).find('.todo-content');
	$el.html(unescape(data.content));
});

socket.on('emit new todo', function(data){
	console.log('new todo refresh');
	var html = get_todo_html(data);
	$('.collapsible').append(html);
	var $el = $('#li'+data._id);
    todo_regist($el);
});
socket.on('emit new todo and focus', function(data){
	var $el = $('#li'+data._id);
	$el.children('.todos-title').attr('contentEditable','true').focus();
});

socket.on('emit todo checker', function(data){
	var $el = $('#li'+data._id).children('input[type=checkbox]');
	var state = $el.prop('checked');
	console.log(!state);
	$el.prop('checked', !state);
	//var state2 = $el.prop('checked');
	//console.log(state2);
	console.log('todo checker refresh');
});

socket.on('emit update todo order', function(data){
	/* data : 
	 * todo_id : target
	 * before : 
	 * after : 
	 */
	var sum = $('.collapsible li').length;
	var $el = $('#li'+data.todo_id);
	var $current_after_el = $('.collapsible>li:nth-child('+(parseInt(data.after)+1)+')');

	$el.detach();
	if(data.after >= data.before){
		$current_after_el.after($el);
	}else{ //(no_after <= sum)
	 	$current_after_el.before($el);
	}
	//todo_regist(new_el);
	console.log('current_after_el: ',$current_after_el.html());
	console.log('todo order refresh');
});

socket.on('emit todo delete', function(data){
	var $el = $('#li'+data.todo_id);
	$el.remove();
});

socket.on('emit update todo duedate', function(data){
	console.log('update todo duedate');
	var $el = $('#li'+data.todo_id).find('.todo-duedate');
	if(data.duedate == null){
		var time_source = 'undefined';
	}else{
		var time_source = new Date(data.duedate).getTime();
	}
	var time_skin = data.time_skin;
	console.log(time_skin);
	$el.find('span').html(time_skin).attr('data-time', time_source.toString());
});

var task_id = '5655a784dbb681cc10b5f03d';
//collection
function collection_init(){
	$.post('/api/findAllTodo',{task_id:task_id},function(data){
		console.log('init:',data);
		function compare(a,b) {
		  if (a.order < b.order)
		    return -1;
		  if (a.order > b.order)
		    return 1;
		  return 0;
		}
		//data = data.sort(compare);
		data.sort(compare).forEach(function (t){
			todo_deploy(t, function(el){
				todo_regist(el);
			});
		});
	});
	function todo_deploy(data, callback){
		//append html per todo using data._id, data.status, data.title, data.content
		var html = unescape(get_todo_html(data));
		$('.collapsible').append(html);
		var $el = $('#li'+data._id);
		callback($el);
	}
}

$popout_assigning_panel = $('.popout-assigning-panel');
Global.collection_lock = false;
//尚未優化：$el的id
function todo_regist($el){ // el is whole <li>
	//this_id : 優化用id存取點
	var _this_id = $el.attr('id').replace(/[li]/g, "");
	console.log('regist: ',_this_id);
	$el.find('.todo-content').dblclick(function(){
		var $this = $(this);
		$this.attr("contentEditable","true");
	}).blur(function(){
		if(!Global.collection_lock){
			var $this = $(this);
			$this.attr("contentEditable","false");
		}
	}).keyup(function(){
		var target = $(this).parent().parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2); // for <li id='li...'>
		var content = $(this).html();
		content = escape(content);
		var data = {todo_id: formatted_tartget, content: content};
		//socket.emit
		socket.emit('update todo content',data);
	}).on("change", function(){ //注意：更動Jquery方法
	    if ($(this).text().trim().length > 0) {
	    	$(this).slideDown('slow', function() {});
	    };
	});
	//todo status
	$el.children('label').click(function(){
		var target = $(this).parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2);
		//WARNING : 未知問題，正常運作
		var check = $el.children('input[type=checkbox]').prop('checked');
		console.log(check);
		var data = {
			todo_id: formatted_tartget,
			checker: !check
		}
		socket.emit('update todo checker',data);
	});
	$el.children('.collapsible-header').children('.todos-title').click(function(e){
		e.stopPropagation();
		$(this).attr('contentEditable','true');
	}).blur(function(){
		var $this = $(this);
		$this.attr('contentEditable','false');
		//socket.emit
		var target = $(this).parent().parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2); // for <li id='li...'>
		var content = $(this).html();
		content = escape(content);
		var data = {todo_id: formatted_tartget, title: content};
		content = escape(content);
		socket.emit('update todo title',data);
	});
	$el.children('.collapsible-header').children('.todo-setting').click(function(e){
		e.stopPropagation();
		$(this).parent().parent().find('.todo-setting-drop').slideDown(300, function(){
			//blur
			$('body').click(function(){
				$('.todo-setting-drop').stop().slideUp();
				$('body').off('click');
			});
		});
	});
	$el.find('.todo-setting-drop .remove-btn').click(function(){
		//$el.remove();
		var data = {todo_id: _this_id};
		console.log('emit delete: ', _this_id);
		socket.emit('delete todo', data);
	});
	$el.find('.todo-setting-drop .assign-btn').click(function(){
		$('.popout-assigning-panel').css({"display":"block"});
		active_cancelzone();
	});
	//collapsible
	$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
}

//blur 區

function get_todo_html(data){
	//WARNING : 需補上data.status的判斷
	var checked = false;
	if(data.checker){ checked = 'checked'}else{ checked = '' };
	var setting_icon = 'view_list';
	if(data.duedate){
		picker.set('select', data.duedate);
		var time_skin = picker.get('select', 'mmmm - dd - yyyy').toString();
		var time_data = new Date(data.duedate).getTime();
	}else{
		var time_skin = '期限';
		var time_data = 'undefined';
	}
	var html = "<li id='li"+data._id+"'><input type='checkbox' class='filled-in' id='checkbox"+data._id+"' "+checked+" /><label for='checkbox"+data._id+"' style='position:absolute; margin-top:12px; margin-left:12px'></label><div class='collapsible-header' style='display: inline-block; width:100%;'><i class='material-icons' style='font-size: 14px;'>label</i><span class='todos-title'>"+data.title+"</span><span class='todo-setting'><i class='material-icons'>"+setting_icon+"</i></span><span class='todo-duedate'><span data-time='"+time_data+"'>"+time_skin+"</span></span></div><ul class='todo-setting-drop z-depth-1'><li class='assign-btn' style='color: #0174DF'>指派</li><li class='remove-btn' style='color: #DF013A'>刪除</li></ul><div class='collapsible-body'><div class='todo-content' contentEditable='false'>"+data.content+"</div><div class='todo-plugin'><br/><br/><span class='todo-comment-tag'>評論留言</span><hr/><ul><li class='todo-comment-owner-tag'><i class='material-icons' style='font-size: 10px; margin-right: 5px;'>comment</i>李冠德 created the task</li><li><span class='todo-post-btn'><span>張貼</span></span><span class='todo-post-btn'><span>附檔</span></span></li></ul></div></div></li>";
	return html
}


//UI method
function add_todo(){
	// WARNING : 需補上task_id
	socket.emit('create todo',{task_id:task_id},function(){});
}

function upload(){
	document.getElementById('upload').click();
}

function sortable_button_init(){
	$('#button_sortable').click(function(){
		var state = sortable_api.option("disabled"); // get
		sortable_api.option("disabled", !state); // set
		this.enabled = !this.enabled; //toggle pattern
	    if(this.enabled) {
	        $('.collapsible-header').css('cursor','pointer');
	    } else {
	        $('.collapsible-header').css('cursor','default');
	    }
	});
}

//$('.collapsible-header').off();
//$('.collapsible').collapsible();
//$('.collapsible-header').click();

(function($)
{
    var oldHtml = $.fn.html;
    $.fn.html = function()
    {
        var ret = oldHtml.apply(this, arguments); 
        //trigger your event.
        this.trigger("change");
        return ret;
    };
})(jQuery);



