betaJs = {
	init:function(){
		return;
		$.get('resource/js/system/beta.css', function(text){
			betaJs.appendCss(text);
			betaJs.appendEl();
            $('#betalogo>.item').unbind('click').click(function(){
                var $el = $(this);
                var handler;
               window.open('./svn.html');
            });
		});

	},appendEl:function(){
		var ver = '<strong>beta 1.2</br>2014.06.19 20:40</strong>'+ navigator.userAgent
		var h = ['<div id="betalogo" class="wrapper">',
			'<div class="item">',
			'<img class="logo" src="resource/images/course-icon-96.png">',
			'<div class="information">',
			'</div>',
			'</div>',
			'</div>'].join('');
		$(h).appendTo(document.body);
	},appendCss:function(text){
		$('<style type="text/css">'+text+'</style>').appendTo(document.head);
	}
};
betaJs.init();