var resetPwdJs = {
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
                resetPwdJs.createSecurityCode();
            }
        })
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = resetPwdJs;
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
        var me = resetPwdJs;
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
        dmJs._ajax({id: 'validateMobile', method: 'POST', params: {mobile: mobile}, url: '/urming_quan/user/validateMobile',
            callback: function (data) {
                if (!data.exsit) {
                    viewJs.dialogPop('手机号不存在', function () {
                    }, '错误', {onlyBtnOk: true});
                    return;
                }
                viewJs.getVerifyCode();
            }});
    }, reset: function () {
        var f = resetPwdJs.validate();
        if (f == null) {
            return;
        }
        var url = '/urming_quan/user/resetPassword';
        dmJs._ajax({
            id: 'resetPwd',
            url: url,
            params: f,
            callback: function () {
                viewJs.showPopMsg('密码设置成功');
                viewJs.navigator.next({
                    next: {url: './login.html'},
                    lastAuto: false
                });
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
        var password = $.trim($f.find('.vTr.password input').val());
        var verifyCode = $.trim($f.find('.vTr.verifyCode input').val());
        var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
        var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
        var inputPhone = $.trim($f.find('.vTr.phone input').val());
        if (!msg) {
            msg = viewJs.validate({name: '验证码', val: verifyCode, must: true});
        }
        if (!msg) {
            msg = viewJs.validate({name: '密码', val: password, must: true, minLength: 6, maxLength: 20});
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
        return {password: password, verifyCode: verifyCode, tempAccessToken: tempAccessToken};
    },createSecurityCode:function(){
        var $p = $.mobile.activePage;
        var tempCode = $p.find(".securityCode > img").data("tempCode");
        $p.find(".securityCode > img").attr("src",mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random());
    }
};