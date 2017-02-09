/**
 * Created by lchysh on 2014/8/23.
 */
selectVeifyTypeJs = {
    init:function(){
        var $p = $.mobile.activePage;
        var user = dmJs.sStore.getUserInfo();
        if(user == null){
            dmJs.sStore.toLogin();
            return;
        }
        /*
        var inValid = viewJs.isLockVerifyIdentity(user.user.isIdcardValidated);
        if(inValid){
            viewJs.dialogPop(inValid, function(){
                viewJs.navigator.next({next:{id:'account',url:'./account.html'}});
            },'错误',{onlyBtnOk:true});
//            viewJs.showPopMsg(inValid);
            return;
        }
        */
        var invalid;
        var isIdcardValidated = user.user.isIdcardValidated;
        var isTeacherValidated = user.user.isTeacherValidated;
        var type = user.user.type;
        if(isIdcardValidated==2 || isTeacherValidated==2){
            invalid = "认证正在审核中";
        }
        if((type==1 && isTeacherValidated==1) || (type>1 && isIdcardValidated==1)){
            invalid = "您已通过认证";
            setTimeout(function(){
                viewJs.navigator.next({
                    next:{
                        url:'./mine.html',
                        id:'mine',
                        options:{}
                    },lastAuto:false
                });
            },200)
        }
        if(invalid){
            viewJs.dialogPop(invalid, function(){
                viewJs.navigator.next({next:{id:'account',url:'./account.html'}});
            },'错误',{onlyBtnOk:true});
            return;
        }
        if(type==1 || type==3){
            $p.find("#enterprise").hide();
        }
        if((type==1 && isIdcardValidated==1) || type==3){
            $p.find("#person").hide();
        }
        if(type==2){
            $p.find("#person").hide();
            $p.find("#teacher").hide();
        }
        this.toggleEvents(true);
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = selectVeifyTypeJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.vbt.vr', 'vclick', function(){
                    var $el = $(this);
                    var userType = $el.attr('data-user-type');
                    var user = dmJs.sStore.getUserInfo();
                    var isIdcardValidated = user.user.isIdcardValidated;
                    var isTeacherValidated = user.user.isTeacherValidated;
                    var type = user.user.type;
                    var next = {url:'./verifyUser.html', id:'verifyUser',options:{data:{userType:userType}}};
                    if(userType=="teacher" && type==3){
                        next = {url:'./verifyTeacherIDCard.html', id:'verifyTeacherIDCard',options:{data:{userType:userType}}};
                    }else if(userType=="teacher" && isIdcardValidated==1){
                        next = {url:'./verifyTeacher.html', id:'verifyTeacher',options:{data:{userType:userType}}};
                    }else if(userType=="teacher"){
                        next = {url:'./verifyUser.html', id:'verifyUser',options:{data:{userType:userType}}};
                    }else if(userType=="enterprise"){
                        next = {url:'./verifyEnterprise.html', id:'verifyEnterprise',options:{data:{userType:userType}}};
                    }
                    viewJs.navigator.next({next:next,lastAuto:true});
                });
            }, 500);
        }
    }
};