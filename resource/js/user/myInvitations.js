/**
 * Created by lchysh on 2014/8/25.
 */
myInvitationsJs = {
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
        var me = myInvitationsJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('#filter-invitations', 'input', me.filterList);
            }, 500);

        }
    },doAction:function(){
        var $el = $(this);
        var me = myInvitationsJs;
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me.fetchData.apply($el, arguments);
                break;
            case 'userDetail':
                me.toUserPage.apply($el, arguments);
        }
    },toUserPage:function(){
    var $el = $(this);
    var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
    viewJs.navigator.next({next:{url:'./u.html',id:'u',options:{data:param}}, lastAuto:true});
},filterList:function(){
        var me = myInvitationsJs;
        var $el = $(this);
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
                var me = myInvitationsJs;
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
        var me = myInvitationsJs;
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
            id:'getInvitee',
            url:'/urming_quan/friend/getInvitee',
            params:params,
            callback:function(data){
               var total = data.total;
               var list =  data.users;
               var l = list.length;
                var $p = $.mobile.activePage;
                var $paper = $p.find('.pager-nav');
                var $list = $p.find('.friendList');
                $paper.empty();
                var paperTpl = $p.find('#paper_tpl').html();
                var pageInfo = {};
                pageInfo.hasPre = params.offset > 0 ? '' : 'disabled';
                pageInfo.hasNext = (params.offset+params.pageSize) < total ? '' : 'disabled';
                var pageCurrent = Math.ceil(params.offset/params.pageSize+0.1);
                pageInfo.pagePre = pageCurrent-1;
                pageInfo.pageNext = pageCurrent+1;
                pageInfo.pageCurrentTotal = total < params.pageSize ? '1' : [pageCurrent, Math.ceil(total/params.pageSize)].join('/');
                var html = [];
               if(total > 0){
                   var tpl = $p.find('#invitation-tpl').html();
                   var item,info;
                   for(var i = 0; i < l; i++){
                       item = list[i];
                       info = {id:item.id};
                       info.userType = item.type == 1 ? 'person' : 'enterprise';
                       info.sexWord = viewJs.setSexMarkCls(item);
                       info.avatar = mainJs.getProfilePicUrl({sex:item.sex,url:item.profileImageUrl});
                       info.idcardValidated = item.isIdcardValidated == 1 ? 'idcardValidated' : '';
                       info.validateBankCardOK = item.isMoneyGuaranteed == 1 ? 'validateBankCardOK' : '';
                       info.realname = item.realname;
                       html.push(viewJs.applyTpl(tpl, info));
                   }
               }
                $list.html(html.join(''));
                var tmp = viewJs.applyTpl(paperTpl, pageInfo);
                $paper.html(tmp);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(_self);
        });
    }
};