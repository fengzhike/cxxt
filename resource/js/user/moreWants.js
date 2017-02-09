moreWantsJs = {
	init:function(){
        this.resetData(true);
		this.toggleEvents(true);
		this.fetchData();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = moreWantsJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
                me.resetData();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('[action]', 'vclick', me.doAction);
			}, 500);
		}
	},fetchData:function(evt){
       var me = moreWantsJs;
        var opt = $.extend({evt: evt}, me._data);
        viewJs.loadPage(opt);
        return;
	},
    resetData: function (bInit) {
        var me = moreWantsJs;
        if (bInit) {
            var $p = $.mobile.activePage;
            me._data = {
                tpl: $('#want_item_tpl').html(),
                domain: {},
                url: '/urming_quan/user/getUserWants',
                dataKey: 'userWants',
                $content: $p.find('#moreWantsCt'),
                paperTpl: $('#paper_tpl').html(),
                bLogin: true,
                itemParser: me.itemParser,
                param: {userId: mainJs.parseUrlSearch().userId}
            };
        } else {
            me._data = null;
        }
    }, itemParser: function (item, opt) {
        if(item.category.category.id==5){
            item.action = 'question';
        }else{
            item.action = 'want';
        }
        return item;
    }, doAction: function (evt) {
        var me = moreWantsJs;
        var $el = $(this);
        var param = mainJs.parseUrlSearch($el.attr('param'));
        var action = $el.attr('action');
        switch (action) {
            case 'want':
                viewJs.navigator.next({lastAuto: true, next: {id: 'want', url: './want.html', options: {data: param}}});
				break;
            case 'question':
                viewJs.navigator.next({lastAuto: true, next: {id: 'question', url: './question.html', options: {data: param}}});
                break;
            case 'pageNav':
                me.fetchData.call($el, evt);
                break;
        }
    }
};