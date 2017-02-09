var recSvrsJs = {
    init: function () {
        if (!this.chkLogin()) {
            return;
        }
        var $p = $.mobile.activePage;
        this.resetData(true);
        this.fetchData();
        this.toggleEvents(true);
    }, chkLogin: function () {
        var user = dmJs.sStore.getUserInfo();
        if (user == null) {
            viewJs.dialogPop('请先登录！', function () {
                viewJs.navigator.pre();
            }, '错误', {onlyBtnOk: true});
            return;
        }
        return user;
    }, fetchData: function (evt) {
        var me = recSvrsJs;
        var opt = $.extend({evt: evt}, me._data);
        viewJs.loadPage(opt);
        return;
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = recSvrsJs;
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
    }, doAction: function (evt) {
        var me = recSvrsJs;
        var $el = $(this);
        var param = mainJs.parseUrlSearch($el.attr('param'));
        var action = $el.attr('action');
        switch (action) {
            case 'service':
                me.toServiceDetail.apply($el);
                break;
            case 'pageNav':
                me.fetchData.call($el, evt);
                break;
        }
    }, toServiceDetail: function () {
        var $m = $(this), htmls;
        var params = {serviceID: $m.attr('data-svrId')};
        viewJs.navigator.next({
            next: {url: './service.html', id: 'service', options: {data: params}},
            lastAuto: true});
    }, resetData: function (bInit) {
        var me = recSvrsJs;
        if (bInit) {
            var $p = $.mobile.activePage;
            me._data = {
                tpl: $('#service_item_tpl').html(),
                domain: {},
                url: '/urming_quan/search/getRecommendServices',
                dataKey: 'datas',
                $content: $p.find('#recSvrsList'),
                paperTpl: $('#paper_tpl').html(),
                bLogin: true,
                itemParser: me.itemParser
            };
        } else {
            me._data = null;
        }
    }, itemParser: function (item, opt) {
        item.img = mainJs.getSvrPicUrl({url: item.picUrl, size: 2});
        return item;
    }
};