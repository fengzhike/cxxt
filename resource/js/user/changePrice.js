/**
 * Created by lchysh on 2014/9/16.
 */
// ▲★◆◇→＾♀♂□●○★☆№■※□◇―￣＼＠＃○＿＾■№△§§△→→←＿＿＿
changePriceJs = {
    init:function(){
        if(!viewJs.chkLogin()){
            return;
        }
        var me = this;
        me.resetData(true);
        var $p = $.mobile.activePage;
        $p.find('.fieldContainer input[readonly]').parent().addClass('icon-right-arrow');
        var encodeParam = mainJs.parseUrlSearch().a;
        if(!encodeParam){
            viewJs.showPopMsg('参数错误');
            viewJs.navigator.next({next:{url:'./'}});
            return;
        }
        var param = $.parseJSON(mainJs.decode(encodeParam));
        me.toggleEvents(true);
        me._data.param = param;
        var tpl = $('#changePrice_tpl').html();
        var info = $.extend({}, param);
        info.sumPrice = info.price * info.num;
        $p.find('.ui-content').html(viewJs.applyTpl(tpl, info)).enhanceWithin();
    },resetData:function(bInit){
        var me = changePriceJs;
        if(bInit){
            var data = me._data = {};
        } else {
            me._data = null;
        }
    },toggleEvents:function(bBind){
        var me = changePriceJs;
        var $p = $.mobile.activePage;
        $p.undelegate();
        if(bBind){
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                me.resetData();
            });
            $p.delegate('[action]','vclick', me.doAction);
            $p.delegate('#changePrice_new','input', me.onchangePrice);
        }
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var $el = $(this);
        var me = changePriceJs;
        var action = $el.attr('action');
        var next;
        switch (action){
            case 'submit':
                me.submit();
                break;
            case 'service':
                next = {id:'service',url:'./service.html',options:{data:{serviceID: $.trim($el.attr('data-service-id'))}}};
                break;
            case 'user':
                next = {id:'u',url:'./u.html',options:{data:{userId: $.trim($el.attr('data-user-id'))}}};
                break;
        }
        if(next){
            viewJs.navigator.next({next:next,lastAuto:true});
        }
    },submit:function(){
        var user = viewJs.chkLogin();
        if(!user){
            return;
        }
        var me = changePriceJs;
        var initParam = me._data.param;
        var newPrice = $.trim($('#changePrice_new').val());
        if(newPrice == ''){
            viewJs.showPopMsg('修改价格不能为空');
            return;
        }
        if(initParam.price == newPrice){
            viewJs.showPopMsg('价格未变更');
            return;
        }
        if(!$.isNumeric(newPrice)){
            viewJs.showPopMsg('价格格式不正确');
            return;
        }
        if(newPrice> 100000){
            viewJs.showPopMsg('价格不能超过100，000元');
            return;
        }
        dmJs._ajax({
            method:'POST',
            id:'changePrice',
            url:'/urming_quan/service/changePrice',
            params:{
                accessToken:user.accessToken,
                newPrice:newPrice,
                serviceCartID:initParam.serviceCartId
            },callback:function(data){
                viewJs.navigator.next({next:{id:'myServices',url:'./myServices.html',options:{data:{tab:'pay'}}}});
            }
        });
    },onchangePrice:function(){
        var me = changePriceJs;
        var $el = $(this);
        var val = $.trim($el.val()).replace(/[^\d]/g,'');
        if(val != ''){
            if(val > 100000){
                viewJs.showPopTip({msg:'价格不能超过100，000',el:$el.parent()});
                val = 100000;
            }
        }
        var initParam = me._data.param;
        $el.val(val);
        $('#changePrice_sum').html(initParam.num * Number(val));
    }
};