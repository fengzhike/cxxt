var changeContactInfoJs = {
    init: function () {
        this.initPage();
        this.toggleEvents(true);
    }, initPage: function () {
        var $p = $.mobile.activePage;
        viewJs.clearRegister();
        dmJs._ajax({
            id:'getTempCode',
            url:'/urming_quan/system/getTempCode',
            callback:function(data){
                $p.find(".securityCode > img").data("tempCode",data.data.code);
                changeContactInfoJs.createSecurityCode();
            }
        })
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = changeContactInfoJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('.vbt.sendCode.enable:not(.busy)', 'vclick', me.getVerifyCode);
                $p.delegate('.securityCode > img', 'vclick', me.createSecurityCode);
                $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
            }, 500);
        }
    }, doAction: function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var me = changeContactInfoJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        switch (sAction) {
            case 'submit':
                me.reset.apply($el);
                break;
            case 'pwdCtr':
                me.togglePwdDisp.apply($el);
                break;
        }
    }, getVerifyCode: function () {
        var $p = $.mobile.activePage;
        var mobile = $p.find('.vTr.phone input').val();
        mobile = $.trim(mobile);
        if (mobile == '') {
            return;
        }
        viewJs.getVerifyCode();
    }, reset: function () {
        var f = changeContactInfoJs.validate();
        if (f == null) {
            return;
        }
        var url = '/urming_quan/user/changeContactInfo';
        dmJs._ajax({
            id: 'changeContactInfo',
            url: url,
            method: 'POST',
            params: f,
            callback: function () {
                viewJs.showPopMsg('设置成功');
                $.mobile.activePage.hide();
                viewJs.navigator.next({next:{
                    url:'./account.html',
                    id:'account'
                },lastAuto:false});
            }
        });
    }, togglePwdDisp: function () {
        var $el = $(this);
        var $input = $.mobile.activePage.find('.vTr.password input');
        var isShow = $input.is('[type=text]');
        if (!isShow) {
            $el.data('hide', false);
            $input.attr('type', 'text');
            $el.text('隐藏');
        } else {
            $el.data('hide', true);
            $input.attr('type', 'password');
            $el.text('显示');
        }
    }, validate: function () {
        var $p = $.mobile.activePage;
        var $f = $p.find('.vForm');
        var msg;
        var contactRealname = $.trim($f.find('.vTr.contactRealname input').val());
        var verifyCode = $.trim($f.find('.vTr.verifyCode input').val());
        var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
        var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
        var inputPhone = $.trim($f.find('.vTr.phone input').val());
        if(!msg){
            msg = viewJs.validate({name:"用户名", val:contactRealname, must:true, minLength:1});
        }
        if (!msg) {
            msg = viewJs.validate({name: '验证码', val: verifyCode, must: true});
        }
        if (!msg) {
            if(tempAccessToken == ''){
                msg ="请获取验证码";
            }
        }
        if (!msg) {
            if (inputPhone !== accessTokenMobile) {
                msg = "手机号和获取验证码的手机号不符";
            }
        }
        if (msg) {
            viewJs.showPopMsg(msg);
            return;
        }
        return {contactRealname: contactRealname, verifyCode: verifyCode, tempAccessToken: tempAccessToken,accessToken: dmJs.sStore.getUserInfo().accessToken};
    },createSecurityCode:function(){
        var $p = $.mobile.activePage;
        var tempCode = $p.find(".securityCode > img").data("tempCode");
        $p.find(".securityCode > img").attr("src",mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random());
    }
};