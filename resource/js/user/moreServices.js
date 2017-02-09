moreServicesJs = {
    init: function () {
        this.resetData(true);
        this.toggleEvents(true);
        this.initPage();
    }, initPage: function () {
        // 更多服务
        var params = mainJs.parseUrlSearch();
        this.fetchData(params);
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = moreServicesJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
            }, 500);
        }
    }, fetchData: function (evt) {
        var me = moreServicesJs;
        var opt = $.extend({evt: evt}, me._data);
        viewJs.loadPage(opt);
        return;
    }, resetData: function (bInit) {
        var me = moreServicesJs;
        if (bInit) {
            var $p = $.mobile.activePage;
            me._data = {
                tpl: $('#service_item_tpl').html(),
                domain: {},
                url: '/urming_quan/user/getUserServices',
                dataKey: 'userServices',
                $content: $p.find('#moreServicesCt'),
                paperTpl: $('#paper_tpl').html(),
                bLogin: true,
                itemParser: me.itemParser,
                param: {userId: mainJs.parseUrlSearch().userId}
            };
        } else {
            me._data = null;
        }
    }, itemParser: function (item, opt) {
        var info = item.serviceVersion;
        info.watchNumber = item.realViewCount;
        info.id = item.id;
        var typePic = {1:mainJs.getSvrPicUrl,3:mainJs.getCoursPicUrl,4: mainJs.getActPicUrl};
        //console.log(item.serviceVersion.category.category.id)
        info.img = typePic[item.serviceVersion.category.category.id]({url: info.picUrl, size: 2});
        return info;
    }, doAction: function (evt) {
        var me = moreServicesJs;
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