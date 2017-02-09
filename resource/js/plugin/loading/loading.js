loadingJs = {
	init:function(){
		var me = loadingJs;
		//console.log('a');
		/*$.getCss({id:'loadingCss', url:'resource/js/plugin/loading/loading.css',
			ajaxOpt:{
                success:me.setup
			}
		});*/
	},setup:function(){
        var regExp = /(getServiceTagNumber)|(getNewlyPosted)|(getInteractionList)|(publishInteraction)/;
        var isLoadingNext = function(options){
            if(!regExp.test(options.url)){
                return true;
            }
            return false;

        };
		var me = loadingJs;
		var cmp = me.build();
		var count = 0;
		$(document).ajaxSend(function(e, jqxhr, options){
            if(isLoadingNext(options)){
                count++;
                me.startAnimation(cmp);
            }

		}).ajaxComplete(function(e, jqxhr, options){
            if(isLoadingNext(options)){
                count--;
                if(count <= 0){
                    me.stopAnimation(cmp);
                }
            }

		});
	},build:function(){
		var htmls = [
			'<div class="spinner">',
				'<div class="rect1"></div>',
				'<div class="rect2"></div>',
				'<div class="rect3"></div>',
				'<div class="rect4"></div>',
				'<div class="rect5"></div>',
			'</div>'
		];
		return $(htmls.join('')).appendTo(document.body);
	},startAnimation:function(cmp){
		cmp.show();
	},stopAnimation:function(cmp){
		setTimeout(function(){cmp.delay(500).hide(1);}, 500);
	}
};