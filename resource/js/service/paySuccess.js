/**
 * Created by lchysh on 2014/8/28.
 */
// ▲★◆◇→＾♀♂□●○★☆№■※□◇―￣＼＠＃○＿＾■№△§§△→→←＿＿＿
paySuccessJs = {
    init:function(){
        this.initPage();
        this.toggleEvents(true);
    },initPage:function(){
        var initParams = mainJs.parseUrlSearch();
        initParams = this.clearAdd(initParams)
        var $p = $.mobile.activePage;
        var $content = $p.find('#paySuccess-show');
        var html = '';
        var bOK = true;
        var price = initParams.price;
        var buyNumber = initParams.buyNumber;
        if($.isNumeric(price)){
            price =Number(price);
        } else {
            bOK = false;
        }
        if(bOK && $.isNumeric(buyNumber)){
            buyNumber =Number(buyNumber);
        } else {
            bOK = false;
        }
        if(bOK){
            var tpl = $p.find('#paySuccess_tpl').html();
            var info = {};
            info.name = initParams.serviceName || '';
            info.count = buyNumber;
            info.cost = buyNumber*price;
            html = viewJs.applyTpl(tpl,info);
        } else {
            html = '参数错误';
        }
        $content.html(html);
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = paySuccessJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
            }, 500);
        }
    },chkLogin:function(){
        var user = dmJs.sStore.getUserInfo();
        if(user == null){
            viewJs.dialogPop('请先登录！', function(){
                dmJs.sStore.toLogin({id:'paySuccess',url:'./paySuccess.html',options:{data:mainJs.parseUrlSearch()}});
            }, '错误', {onlyBtnOk:true});
            return;
        }
        return user;
    },clearAdd:function(params){
        for(var attr in params){
            if(params[attr].indexOf('+')!= '-1'){
                var a = params[attr].split('+').join(' ');
                params[attr] = a;
            }
        }
        return params;
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = paySuccessJs;
        if(!me.chkLogin()){
            return;
        }
        var $el = $(this);
        var sAction = $el.attr('action');
        var next;
        switch(sAction){
            case 'publish':
                next = {id:'addService',url:'./addService.html',options:{data:{catId:mainJs.parseUrlSearch().catId}}};
                break;
            case 'view':
                next = {id:'buyorder',url:'./buyorder.html',options:{data:{type:0,userType:1}}};
                break;
        }
        viewJs.navigator.next({next:next});
    }
};