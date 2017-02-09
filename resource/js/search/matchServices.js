matchServicesJs = {
	init:function(){
        this.resetData(true);
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		this.fetchData(params);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = matchServicesJs;
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
        var me  = matchServicesJs;
        var opt = $.extend({evt: evt}, me._data);
        viewJs.loadPage(opt);
        return;
    },resetData: function (bInit) {
        var me = matchServicesJs;
        if (bInit) {
            var $p = $.mobile.activePage;
            me._data = {
                reqMethod:'POST',
                tpl: $('#matchService_item_tpl').html(),
                domain: {},
                url: '/urming_quan/search/getMatchServices',
                dataKey: 'datas',
                $content: $p.find('#matchServicesList'),
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
        item.img = mainJs.getSvrPicUrl({url:item.picUrl,size:2});
        return item;
    }, doAction: function (evt) {
        var me = matchServicesJs;
        var $el = $(this);
        var param = mainJs.parseUrlSearch($el.attr('param'));
        var action = $el.attr('action');
        switch (action) {
            case 'service':
                viewJs.navigator.next({lastAuto: true, next: {id: 'service', url: './service.html', options: {data: param}}});
                break;
            case 'pageNav':
                me.fetchData.call($el, evt);
                break;
        }
    }
};