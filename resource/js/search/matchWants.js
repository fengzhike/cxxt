matchWantsJs = {
	init:function(){
        this.resetData(true);
		this.toggleEvents(true);
        this.fetchData();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = matchWantsJs;
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
		var me  = matchWantsJs;
        var opt = $.extend({evt: evt}, me._data);
        viewJs.loadPage(opt);
        return;
	},resetData: function (bInit) {
        var me = matchWantsJs;
        if (bInit) {
            var $p = $.mobile.activePage;
            me._data = {
                reqMethod:'POST',
                tpl: $('#matchWant_item_tpl').html(),
                domain: {},
                url: '/urming_quan/search/getMatchWants',
                dataKey: 'datas',
                $content: $p.find('#matchWantsList'),
                paperTpl: $('#paper_tpl').html(),
                bLogin: true,
                itemParser: me.itemParser,
                param: $.extend(mainJs.parseUrlSearch(),{
                    longitude:dmJs.params.geolocation.longitude,
                    latitude:dmJs.params.geolocation.latitude
                })
            };
        } else {
            me._data = null;
        }
    }, itemParser: function (item, opt) {
        return item;
    }, doAction: function (evt) {
        var me = matchWantsJs;
        var $el = $(this);
        var param = mainJs.parseUrlSearch($el.attr('param'));
        var action = $el.attr('action');
        switch (action) {
            case 'want':
                viewJs.navigator.next({lastAuto: true, next: {id: 'want', url: './want.html', options: {data: param}}});
                break;
            case 'pageNav':
                me.fetchData.call($el, evt);
                break;
        }
    }
};