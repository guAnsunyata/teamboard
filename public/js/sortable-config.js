//sortable-config for task.hbs
	//sortable
	function sortable_init(el){
		var sortable = new Sortable(el, {
		    group: "name",  // or { name: "...", pull: [true, false, clone], put: [true, false, array] }
		    sort: true,  // sorting inside list
		    delay: 0, // time in milliseconds to define when the sorting should start
		    disabled: false, // Disables the sortable if set to true.
		    store: null,  // @see Store
		    animation: 150,  // ms, animation speed moving items when sorting, `0` — without animation
		    filter: ".ignore-elements",  // Selectors that do not lead to dragging (String or Function)]
		    ghostClass: "sortable-ghost",  // Class name for the drop placeholder
		    chosenClass: "sortable-chosen",  // Class name for the chosen item
		    dataIdAttr: 'data-id',

		    forceFallback: false,  // ignore the HTML5 DnD behaviour and force the fallback to kick in
		    fallbackClass: "sortable-fallback",  // Class name for the cloned DOM Element when using forceFallback
		    fallbackOnBody: false,  // Appends the cloned DOM Element into the Document's Body

		    scroll: true, // or HTMLElement
		    scrollSensitivity: 30, // px, how near the mouse must be to an edge to start scrolling.
		    scrollSpeed: 10, // px

		    setData: function (dataTransfer, dragEl) {
		        dataTransfer.setData('Text', dragEl.textContent);
		    },

		    // dragging started
		    onStart: function (/**Event*/evt) {
		    	console.log('onStart: ',evt.oldIndex);
		        evt.oldIndex;  // element index within parent
		    },

		    // dragging ended
		    onEnd: function (/**Event*/evt) {
		        evt.oldIndex;  // element's old index within parent
		        evt.newIndex;  // element's new index within parent
		    },

		    // Element is dropped into the list from another list
		    onAdd: function (/**Event*/evt) {
		        var itemEl = evt.item;  // dragged HTMLElement
		        evt.from;  // previous list
		        // + indexes from onEnd
		    },

		    // Changed sorting within list
		    onUpdate: function (/**Event*/evt) {
		        var itemEl = evt.item;  // dragged HTMLElement
		        // + indexes from onEnd
		    },

		    // Called by any change to the list (add / update / remove)
		    onSort: function (/**Event*/evt) {
		    	console.log('onSort: ' ,evt);
		    },

		    // Element is removed from the list into another list
		    onRemove: function (/**Event*/evt) {
		        // same properties as onUpdate
		    },

		    // Attempt to drag a filtered element
		    onFilter: function (/**Event*/evt) {
		        var itemEl = evt.item;  // HTMLElement receiving the `mousedown|tapstart` event.
		    },

		    // Event when you move an item in the list or between lists
		    onMove: function (/**Event*/evt) {
		        // Example: http://jsbin.com/tuyafe/1/edit?js,output
		        evt.dragged; // dragged HTMLElement
		        evt.draggedRect; // TextRectangle {left, top, right и bottom}
		        evt.related; // HTMLElement on which have guided
		        evt.relatedRect; // TextRectangle
		        // return false; — for cancel
		    }
		});
		return{
			sortable: sortable
		}
	};

	// api_sortable();
