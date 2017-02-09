myDiplomasJs = {
    init:function(){
        if(!this.chkLogin()){
            return;
        }
        this.clear();
        this.toggleEvents(true);
        this.fetchData();
    },clear:function(){
        var $p = $.mobile.activePage;
        $p.find('.friendList').empty();
    },chkLogin:function(){
        var user = dmJs.sStore.getUserInfo();
        if(user == null){
            viewJs.dialogPop('请先登录！', function(){
                viewJs.navigator.pre();
            }, '错误', {onlyBtnOk:true});
            return;
        }
        return user;
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = myDiplomasJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('#filter-follow', 'input', me.filterList);
            }, 500);

        }
    },doAction:function(){
        var $el = $(this);
        var me = myDiplomasJs;
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me.fetchData.apply($el, arguments);
                break;
            case 'diplomaDetail':
                me.toDiplomaPage.call($el, arguments);
                break;
            case 'innovationEvaluateDetail':
                me.toInnovationEvaluateDetailPage.call($el, arguments);
                break;
        }
    },toDiplomaPage:function(){
        var $el = $(this);
        var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
        viewJs.navigator.next({next:{url:'./diploma.html',id:'diploma',options:{data:param}}, lastAuto:true});
    },toInnovationEvaluateDetailPage:function(){
        var $el = $(this);
        var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
        viewJs.navigator.next({next:{url:'./innovationEvaluateDetail.html',id:'innovationEvaluateDetail',options:{data:param}}, lastAuto:true});
    },filterList:function(){
        var $el = $(this);
        var me = myDiplomasJs;
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
                var me = myDiplomasJs;
        var $p = $.mobile.activePage;
        var $list = $p.find('.friendList');
        var $el = $(this);
        var lastKeyWord = $.trim($el.data('lastKeyWord'));
        var originalVal = $.trim($el.val());
        var val = originalVal.replace(/[^\u4E00-\u9FA5]/g,'');
//        val = originalVal;
        if(val != ''){
            if(lastKeyWord != val){
                if(me.fetchData({keyword:val})){
                    $el.data('lastKeyWord', val);
                }
            }
        } else {
//            if(lastKeyWord != ''){
                me.fetchData();
                $el.data('lastKeyWord', '');
//            }
        }
    },fetchData:function(evt){
        var _self = arguments.callee;
        var me = myDiplomasJs;
        if(_self.busy){
            return;
        }
        if(!me.chkLogin()){
            return;
        }
        var offset = 0;
        if(evt && evt.type == 'vclick'){
            var $el = $(this);
            if($el.is('.disabled')){
                return;
            }
            offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
        }
        _self.busy = true;
        var params = {offset:offset,pageSize:mainJs.PAGE_SIZE,accessToken:dmJs.getAccessToken()};
        if(evt && evt.keyword){
            params.keyword = evt.keyword;
        }
        dmJs._ajax({
            method:'POST',
            id:'getFollowing',
            url:'/urming_quan/user/getCourseStatisticsList',
            params:params,
            callback:function(data){
                me._data = data;
                me.parseList(data, params);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(_self);
        });
        return true;
    },parseList:function(data, opt){
        var _PAGE_SIZE = mainJs.PAGE_SIZE;
        var total = data.total;
        var list =  data.datas;
        var l = Math.min(list.length, _PAGE_SIZE);
        var $p = $.mobile.activePage;
        var $paper = $p.find('.pager-nav');
        $paper.empty();
        var paperTpl = $p.find('#paper_tpl').html();
        var pageInfo = {};
        pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
        pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
        var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
        pageInfo.pagePre = pageCurrent-1;
        pageInfo.pageNext = pageCurrent+1;
        pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
        var html = [];
        var $list = $p.find('.diplomaList');
        if(total > 0){
            var tpl = $p.find('#diploma_item_tpl').html();
            var item,info;
            for(var i = 0; i < l; i++){
                item = list[i];
                info = {id:item.id};
                info.img = mainJs.getSvrPicUrl({url:item.picUrl,size:2});
                info.name = item.serviceName;
                info.endTime = item.endTime;
                if(item.type == 0){
                    info.action = "diplomaDetail";
                }else if(item.type == 1){
                    info.action = "innovationEvaluateDetail";
                }
                html.push(viewJs.applyTpl(tpl, info));
            }
            var tmp = viewJs.applyTpl(paperTpl, pageInfo);
            $paper.html(tmp);
        }else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div></div>'];
        }
        $list.html(html.join(''));

    }
};