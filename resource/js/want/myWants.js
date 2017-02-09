var myWantsJs = {
    init: function () {
        if (!this.preInit()) {
            return;
        }
        this.resetData(true)
        var $p = $.mobile.activePage;
        $p.find('.tabContent .content').empty();
        this.toggleTab();
        this.toggleEvents(true);
        this._fetchSelTab();
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = myWantsJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('.tabHeader .header', 'tabchange', me._fetchSelTab);
            }, 500);
        }
    },_fetchSelTab:function(){
        var me = myWantsJs;
        var $p = $.mobile.activePage;
        var currentTab = $p.find('.current[tabi]').attr('tabi');
        if(currentTab == 2){
            me.getFinishedWants();
        } else {
            me.getUnfinishedWants();
        }
    }, resetData: function (bInit) {
        var me = myWantsJs;
        me.initFinishedWants.busy = false;
        me.initUnfinishedWants.busy = false;
    },doAction: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var me = myWantsJs;
        var $el = $(this);
        var action = $el.attr('action');
        var param = $el.attr('param');
        switch (action) {
            case 'edit':
                if (!dmJs.hasLogin()) {
                    dmJs.sStore.toLogin({url: './want.html', id: 'want', options: {data: {wantID: param}}});
                    return;
                }
                viewJs.navigator.next({next: {url: './addWant.html', id: 'addWant', options: {data: {wantID: param,catId:$el.attr('catId')}}}, lastAuto: true});
                break;
            case 'close':
                me.finishedWant(param, $el);
                break;
            case 'reopen':
                me.reopenWant(param, $el);
                break;
            case 'wantDetail':
                me.toWantDetails.apply($el);
                break;
            case 'pageNav':
                if($el.is('.tab1 [action]')){
                    me.getUnfinishedWants.call($el, e);
                } else {
                    me.getFinishedWants.call($el, e);
                }
                break;
        }
    },toggleTab: function () {
        var params = mainJs.parseUrlSearch();
        if (params.tab == 2) {
            var $p = $.mobile.activePage;
            $p.find('.tabCtr .tab1').removeClass('current').
                end().find('.tabCtr .tab2').addClass('current');
        }
    },
    preInit: function () {
        var user = dmJs.sStore.getUserInfo();
        if (user == null) {
            viewJs.dialogPop('请先登录！', function () {
                viewJs.navigator.pre();
            }, '错误', {onlyBtnOk: true});
            return user;
        }
        return true;
    },
    toWantDetails: function () {
        var $m = $(this);
        var wantID = $m.attr('data-item-id');
        if (wantID != null && wantID != '') {
            var params = {wantID: wantID};
            viewJs.navigator.next({
                next: {url: './want.html', id: 'want',
                    options: {
                        data: params
                    }},
                last: {
                    id: 'myWants',
                    url: './myWants.html',
                    options: {
                        data: {tab: $m.attr('tab'),catId:mainJs.parseUrlSearch().catId}
                    }
                }
            });
        }
    },
    getUnfinishedWants: function (params) {
        if(params == undefined){
            params = {};
        }
        if(params && params.type == 'vclick'){
            var $el = $(params.target);
            if($el.is('.disabled')){
                return;
            }
            var offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
            var params = {offset:offset};
        }
        params.parentCategoryId = mainJs.parseUrlSearch().catId;
        switch(params.parentCategoryId){
            case '2':
                $("#title").html("我的需求");
                break;
            case '5':
                $("#title").html("我的问题");
                break;
            case '7':
                $("#title").html("我的招聘");
                break;
            default:
                $("#title").html("我的需求");
                break;
        }
        var me = myWantsJs;
        var url = '/urming_quan/want/getUnfinishedWants';
        me.loadData(url, params, me.initUnfinishedWants);
    },
    getFinishedWants: function (params) {
        if(params == undefined){
            params = {};
        }
        if(params && params.type == 'vclick'){
            var $el = $(params.target);
            if($el.is('.disabled')){
                return;
            }
            var offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
            var params = {offset:offset};
        }
        params.parentCategoryId = mainJs.parseUrlSearch().catId;
        switch(params.parentCategoryId){
            case '2':
                $("#title").html("我的需求");
                break;
            case '5':
                $("#title").html("我的问题");
                break;
            case '7':
                $("#title").html("我的招聘");
                break;
            default:
                $("#title").html("我的需求");
                break;
        }
        var me = myWantsJs;
        var url = '/urming_quan/want/getFinishedWants';
        me.loadData(url, params, me.initFinishedWants);
    },reopenWant:function(wantID, $el){
        var me = myWantsJs;
        var url = '/urming_quan/want/reopenWant';
        me.loadData(url, {wantID: wantID}, function () {
            var $p = $.mobile.activePage;
            var $pre = $el.prev();
            location.reload();
        });
    },
    finishedWant: function (wantID, $el) {
        viewJs.dialogPop('确定关闭该需求？',function(ok){
            if(ok){
                var me = myWantsJs;
                var url = '/urming_quan/want/finishedWant';
                me.loadData(url, {wantID: wantID}, function () {
                    var $p = $.mobile.activePage;
                    var $pre = $el.prev();
                    location.reload();
                });
            }
        },'提示');
    },
    initFinishedWants: function (data, opt) {
        var total = data.total;
        var wants = data.wants;
        var l = wants.length;
        var $p = $.mobile.activePage;
        var $c = $p.find('.tabContent>.tab2');
        var paperTpl = $p.find('#paper_tpl').html();
        var tpl = $p.find('#want_close_tpl').html();
        var html = [], i = 0;
        var item, info;
        for (; i < l; i++) {
            item = wants[i];
            info = {};
            info.id = item.id;
            info.name = item.wantName;
            info.price = item.price;
            info.catId = item.category.category.id;
            if(item.responseNumber && item.responseNumber>0){
                info.style = 'style="display:none"';
            }
            html.push(viewJs.applyTpl(tpl, info));
        }
        if(l > 0){
            var _PAGE_SIZE = mainJs.PAGE_SIZE;
            var pageInfo = {};
            pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl(paperTpl, pageInfo));
        } else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }
        $c.html(html.join(''));
    },
    initUnfinishedWants: function (data,opt) {
        var total = data.total;
        var wants = data.wants;
        var l = wants.length;
        var $p = $.mobile.activePage;
        var $c = $p.find('.tabContent>.tab1');
        var paperTpl = $p.find('#paper_tpl').html();
        var tpl = $p.find('#want_open_tpl').html();
        var html = [], i = 0;
        var item, picUrl, serviceVersion;
        var actionBtn;
        var marker,info;
        for (; i < l; i++) {
            item = wants[i];
            info = {};
            info.id = item.id;
            info.name = item.wantName;
            info.price = item.price;
            info.status = 'wantStatus'+item.status;
            info.catId = item.category.category.id;
            if(item.responseNumber && item.responseNumber>0){
                info.style = 'style="display:none"';
            }
            if(item.status == 1){
                info.btnCls = "hidecls";
            } else {
                info.btnCls = "";
            }
            html.push(viewJs.applyTpl(tpl, info));
        }
        if(l > 0){
            var _PAGE_SIZE = mainJs.PAGE_SIZE;
            var pageInfo = {};
            pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl(paperTpl, pageInfo));
        } else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }
        $c.html(html.join(''));
    }, loadData: function (url, params, callback) {
        var me = myWantsJs;
        if(callback.busy){
            return;
        }
        callback.busy = true;
        var varParams = params || {};
        var user = dmJs.sStore.getUserInfo();
        var userInfo = user.user;
        var accessToken = user.accessToken;
        varParams.pageSize = mainJs.PAGE_SIZE;
        varParams.offset = varParams.offset || 0;
        varParams.accessToken = accessToken;
        dmJs._ajax({
            id: 'myWants',
            url: url,
            params: varParams,
            accessInvalid: function () {
                dmJs.sStore.logout();
                dmJs.sStore.toLogin({url: './myWants.html'});
                return;
            },
            callback: function (ret) {
                callback(ret, varParams);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(callback);
        });
    }
};