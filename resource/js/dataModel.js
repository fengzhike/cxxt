// 命名空间 dmJs
$(function(){
    var dmJs = window.dmJs = {};
    dmJs.isAndroid = /(Android)/i.test(navigator.userAgent);
    dmJs.isIos = /(ios)/i.test(navigator.userAgent);
    dmJs.params ={
        geolocation:{
            id:1,
            city:'北京',
            longitude:'116.319784',
            latitude:'40.00496'
        }
    };
    dmJs.i18n = {
        getMsgs:function(key){
            return dmJs.i18n[key + '_' + 'zh-CN'];
        }
    };
    dmJs.data = {
        categories:null,
        hasNext:true,
        offset:0
    };
    dmJs.getCategories = function(callback, error){
        var _self = arguments.callee;
        _self.busy = true;
        if(dmJs.data.categories == null){
            $.get(mainJs.getApiUrl('/urming_quan/system/getCategories')).success(function(data, statusText, jqhr){
                var res = $.parseJSON(data);
                dmJs.data.categories = res.categories;
                if($.isFunction(callback)){
                    callback(res.categories);
                }
                _self.busy = false;
                return res.categories;
            }).error(function(){
                viewJs.showPopMsg('网络错误');
                if($.isFunction(error)){
                    error();
                }
                _self.busy = false;
            });
            return;
        } else if($.isFunction(callback)){
            callback(dmJs.data.categories);
            _self.busy = false;
        }
        return dmJs.data.categories;
    };
    dmJs.getVerifyCode = function(params, callback){
        if(params.mobile == ''){
            return;
        }
        dmJs._ajax({id:'getVerifyCodeTmp',method:'POST',params:params,url:'/urming_quan/user/getVerifyCodeTmp',callback:callback});
    };
    dmJs.confirmService = function(serviceOwnID, callback){
        var currentUser = dmJs.sStore.getUserInfo();
        /*if(currentUser == null){
            dmJs.sStore.toLogin({
                url:'./myOrders.html'
            });
            return;
        }*/
        var params = {serviceOwnID:serviceOwnID,accessToken:currentUser.accessToken};
        dmJs._ajax({
            id:'useService',
            accessInvalid:function(){
                dmJs.sStore.toLogin({
                    url:'./buyorder.html'
                });
            },
            params:params,
            url:'/urming_quan/service/useService',
            callback:callback
        });
    };
    // /urming_quan/system/getCategoryTags
    dmJs.getCategoryTags = function(params, callback){
        dmJs._ajax({params:params, dataType:'html',callback:callback, id:'getCategoryTags', url:'/urming_quan/system/getCategoryTags'});
    };
    dmJs._ajax = function(options){
        //console.log(options)
        //viewJs.maskBusy(options.maskText, options.id);
        return $.ajax({
            cache:false,
            url:mainJs.getApiUrl(options.url),
            type:options.method =='POST' ? 'POST' : 'GET',
            data:options.params,
            dataType:options.dataType,
            success:function(data, statusText, jqhr){
                //console.log(data)
                viewJs.hideBusyMask(options.id);
                try {
                    var res = $.parseJSON(data);
                } catch(ex){
                    var res = data;
                }
                if(res.error){
                    if(dmJs.sStore.accessInvalid(res)){
                        if($.isFunction(options.accessInvalid)){
                            options.accessInvalid();
                        } else {
                            dmJs.sStore.logout();
                            dmJs.sStore.toLogin();
                        }
                        return;
                    }
                    //console.log(res);

                    if( res.error_code >= 20257&& res.error_code <= 20261 ||res.error_code == 20265 ){
                        viewJs.navigator.next({
                            next:{
                                url:'./index.html',
                                id:'startpage',
                                options:{}
                            },lastAuto:false
                        });
                    }else{
                        viewJs.showApiError(options.preError ? options.preError(res) : res);
                    }

                    return;
                }
                if($.isFunction(options.callback)){
                    options.callback(res);
                }
            },error:function(){
                viewJs.hideBusyMask(options.id);
                viewJs.showPopMsg('网络错误');
                if($.isFunction(options.error)){
                    options.error();
                }
            }
        });
    };
    dmJs.getAccessToken = function(){
        var userInfo = dmJs.sStore.getUserInfo();
        if(userInfo != null){
            return userInfo.accessToken;
        }
        return null;
    };
    dmJs.findCatById = function(id, callback){
        viewJs.maskBusy(null, 'findCatById');
        dmJs.getCategories(function(lst){
            viewJs.hideBusyMask(null, 'findCatById');
            var cat;
            for(var i = lst.length-1; i > -1; i--){
                cat = lst[i];
                if(cat.id == id){
                    break ;
                }
            }
            if($.isFunction(callback)){
                callback(cat);
            }
        }, function(){
            viewJs.hideBusyMask(null, 'findCatById');
            viewJs.showPopMsg('加载分类错误');
        });
    };
    dmJs.calGrade = function(reviewNumbers){
        var numbers = $.trim(reviewNumbers).split(',');
        var total = 0;
        var user = 0,num,maxNum = -1,maxScore = -1,nums=[];
        for(var i = 0; i < 5; i++){
            num = Number(numbers[i]);
            if(num > maxNum){
                maxNum = num;
                maxScore = i+1;
            }
            nums[i] = num;
            total += num*(i+1);
            user+=num;
        }
        if(user == 0 ){
            return {user:user, grade:0,maxNum:maxNum, maxScore:maxScore,nums:nums};
        }
        var grade = (Math.round(total*10/user))/10;
        var halfStar = grade - Math.floor(grade);
        if(halfStar > 0){
            halfStar = grade- halfStar;
        }
        return {user:user, grade:grade,halfStar:halfStar,maxNum:maxNum, maxScore:maxScore,nums:nums}
    };
    dmJs.ajaxForm = function(formData, url, callback, options){
        //ajax 提交form
        var options = options || {};
        var reqId = options.reqId || 'ajaxForm';
        //viewJs.maskBusy(options.busyDesc || '提交中', reqId);
        return $.ajax({
            url : url,
            type : "POST",
            data : formData,
            dataType:"text",
            // 告诉jQuery不要去处理发送的数据
            processData : false,
            // 告诉jQuery不要去设置Content-Type请求头
            contentType : false,
            success:function(data){
                viewJs.hideBusyMask(reqId);
                var res = $.parseJSON(data);
                var accessInvalid = dmJs.sStore.accessInvalid(res);
                if(accessInvalid){
                    viewJs.showApiError(res);
                    dmJs.sStore.toLogin();
                    return;
                }
                if(res.error){
                    viewJs.showApiError(res);
                    return;
                }
                if($.isFunction(callback)){
                    callback(res);
                }
            },
            error:function(){
                viewJs.showPopMsg('网络错误');
                viewJs.hideBusyMask(reqId);
            },
            xhr:function(){            //在jquery函数中直接使用ajax的XMLHttpRequest对象
                var xhr = new XMLHttpRequest();

                /*  xhr.upload.addEventListener("progress", function(evt){
                 if (evt.lengthComputable) {
                 var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                 $('#mask_ajaxForm,#submitService').html("正在提交."+percentComplete.toString() + '%');
                 console.log("正在提交."+percentComplete.toString() + '%');        //在控制台打印上传进度
                 }
                 }, false);*/

                return xhr;
            }
        });
    };
    // 根据父区域ID获取区域列表
    dmJs.getAreasByParentId = function(parentID, success, error) {
        var key = 'childCity_'+parentID;
        localStorage.getItem(key);
        if(localStorage.getItem(key) == null){
            viewJs.maskBusy(null, 'getAreasByParentId');
            $.get(mainJs.getApiUrl('/urming_quan/system/getAreasByParentId?_d='+Date.now()),{parentID:parentID})
                .success(function(data){

                    localStorage.setItem(key, data);
                    if($.isFunction(success)){
                        success($.parseJSON(data));
                    }
                    viewJs.hideBusyMask('getAreasByParentId');
                }).error(function(){
                    //console.log(arguments);
                    if($.isFunction(error)){
                        error(arguments);
                    }
                    viewJs.hideBusyMask('getAreasByParentId');
                });
        } else {
            if($.isFunction(success)){
                success($.parseJSON(localStorage.getItem(key)));
            }
        }
    };
    dmJs.initData = function(){
        localStorage.removeItem('cities');
        // 定位
        var geolocation = dmJs.sStore.get('geolocation');
        if( geolocation != null){
            dmJs.params.geolocation = geolocation;
        } else {
            mainJs.getPos();
        }
        dmJs.loadI18n();
        // 2.定位
        // 3.获取定位城市id
        viewJs.afterToggleLogin();

    };

    dmJs.loadI18n = function(){
        var ver = 10;
        localStorage.removeItem('msg_api_zh-CN');
        localStorage.removeItem('msg_api_zh-CN_v2');
        localStorage.removeItem('TFLDic2');
        var localMsgs = localStorage.getItem('msg_api_zh-CN_ver');
        if(localMsgs){
            localMsgs =  $.parseJSON(localMsgs);
            if(localMsgs.ver  < ver){
                localMsgs = null;
                localStorage.removeItem('msg_api_zh-CN_ver');
            }
        }
        if(localMsgs == null){
            $.getJSON(mainJs.getResourceURL('/i18n/zh-CN/msg_api_v2.txt?ver='+ver), function(data, status, jqhr){
                dmJs.i18n['msg_api_zh-CN'] = data;
                localStorage.setItem('msg_api_zh-CN_ver', jqhr.responseText);
            }).error(function(){
            });
        } else {
            if(dmJs.i18n['msg_api_zh-CN'] == null){
                dmJs.i18n['msg_api_zh-CN'] = localMsgs;
            }
        }
    };
    dmJs.fetchDataforLoginUser = function(callback){
        if($.isFunction(callback)){
            callback();
        }
    };
    dmJs.lStore = {
        data:{},
        save:function(key, value){
            var realKey = 'ls-'+ key;
            this.data[realKey] = value;
            localStorage.setItem(realKey, JSON.stringify(value));
        },get:function(key){
            var me = this;
            var realKey = 'ls-'+ key;
            var val = me.data[realKey];
            if(val == null || val == ''){
                val = me.formatVal(realKey);
                if(val!= null){
                    val = $.parseJSON(val);
                    me.data[realKey] = val;
                }
            }
            return val;
        },formatVal:function(key){
            var val = localStorage.getItem(key);
            if(val == 'null' || val == 'undefined'){
                var me = this;
                me.data[key] = value;
                val =  null;
            }
            return val;
        },remove:function(key){
            var me = this;
            var realKey = 'ls-'+ key;
            delete me.data[realKey];
            localStorage.removeItem(realKey);
        }
    };
    // 用户认证模块
    dmJs.hasLogin = function(){
        return this.sStore.getStr('currentUser') != null;
    };
    dmJs.sStore = {
        data:{},
        save:function(key, value){
            if($.isEmptyObject(value)){
                //console.log(key+':为空对象');
                return;
            }
            var realKey = 'authz-'+ key;
            // TODO
            // dmJs.sStore.data[realKey] = value;
            sessionStorage.setItem(realKey, JSON.stringify(value));
        },
        getLoginUser:function(callback){
            var me = this,cookieAccessToken;
            if(me.alreadySyncByCookie){
                if($.isFunction(callback)){
                    callback();
                    return;
                }
            }
            var accessToken = dmJs.getAccessToken();
            if($.trim(accessToken) != ''){
                callback();
                return;
            }
            cookieAccessToken = dmJs.lStore.get('cookieAccessToken');
            if(!cookieAccessToken){
                callback();
                return;
            }
            cookieAccessToken = cookieAccessToken.val;
            me.syncUser(cookieAccessToken, function(data){
                me.alreadySyncByCookie = true;
                if($.isFunction(callback)){
                    callback();
                }
            },function(){
                dmJs.lStore.remove('cookieAccessToken');
                me.alreadySyncByCookie = true;
                if($.isFunction(callback)){
                    callback();
                }
            });

        },syncUser:function(accessToken,callback,accessInvalid){
            var me = this;
            dmJs._ajax({
                id:'getLoginUserInfo',
                url:'urming_quan/user/getUserByAccessToken',
                params:{accessToken:accessToken},
                accessInvalid:function(){
                    if($.isFunction(accessInvalid)){
                        accessInvalid();
                    }
                },callback:function(data){
                    data.accessToken = accessToken;
                    me.saveLoginInfo(data);
                    if($.isFunction(callback)){
                        callback();
                    }
                }
            });
        },get:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            var val = dmJs.sStore.data[realKey];
            if(val == null || val == ''){
                val = me.formatVal(realKey);
                if(val!= null){
                    val = $.parseJSON(val);
                    // TODO
                    // dmJs.sStore.data[realKey] = val;
                }
            }
            return val;
        },
        getStr:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            return sessionStorage.getItem(realKey);
        },
        remove:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            delete dmJs.sStore.data[realKey];
            sessionStorage.removeItem(realKey);
        },
        saveLoginInfo:function(user){
            var me = this;
            dmJs.lStore.save('cookieAccessToken', {val:user.accessToken});
            me.save('currentUser', user);
        },logout:function(callback){
            var me = this;
            var userInfo = me.getUserInfo();
            if(userInfo != null){
                var url = $.get(mainJs.getApiUrl('/urming_quan/user/logout'), {accessToken:userInfo.accessToken}).complete(function(){
                    me.remove('currentUser');
                    dmJs.lStore.remove('cookieAccessToken');
                    if($.isFunction(callback)){
                        callback();
                    }
                });
            } else {
                dmJs.lStore.remove('cookieAccessToken');
                me.remove('currentUser');
                if($.isFunction(callback)){
                    callback();
                }
            }
            viewJs.afterToggleLogin();

        },getUserInfo:function(){
            var me = this;
            var userInfo = me.get('currentUser');
            if(userInfo != null){
                userInfo.saveSelf = function(){
                    me.saveLoginInfo(this);
                };
            }
            return userInfo;
        },formatVal:function(key){
            var val = sessionStorage.getItem(key);
            if(val == 'null' || val == 'undefined'){
                var me = this;
                // TODO
                // dmJs.sStore.data[key] = value;
                val =  null;
            }
            return val;
        },reLogin:function(options){
            this.logout();
            this.toLogin(options);
        },login:function(params, callback){
            var me = this;
            me.remove('currentUser');
            me.logout(function(){
                var url = mainJs.getApiUrl('/urming_quan/user/login');
                params.password = mainJs.md5(params.password);
                $.post(url, params, function(data, statusText, jqhr){
                        var res = $.parseJSON(data);
                        //console.log(res)
                        if(res.error != null){
                            viewJs.showApiError(res);
                            return;
                        }
                        me.saveLoginInfo(res);
                        viewJs.afterToggleLogin();
                        var successTo = me.getSuccessTo('successTo');
                        if(successTo == null){
                            // $.mobile.changePage('./');
                            viewJs.navigator.next({next:{url:'./', id:'startPage'}});
                            return;
                        }
                        me.clearSuccessTo();
                        if(successTo.url != null || successTo.href != null){
                            viewJs.navigator.next({next:{url:successTo.url || successTo.href,
                                id:successTo.id,
                                options:successTo.options},
                                last:successTo.last});
                            // $.mobile.changePage(successTo.url, successTo.options);
                        } else {
                            viewJs.navigator.next({next:{url:'./', id:'startPage'}});
                            return;
                        }

                    }
                ).error(function(){
                        viewJs.showPopMsg('网络错误');
                    });
            });

        },clearSuccessTo:function(){
            var me = this;
            me.remove('successTo');
        },getSuccessTo:function(){
            var me = this;
            return me.get('successTo');
        },saveSuccessTo:function(successTo){
            if(!$.isEmptyObject(successTo)){
                var me = this;
                me.save('successTo', successTo);
            } else {
                //console.log('登录成功转向参数为空！');
            }
        },accessInvalid:function(res){
            var me = this;
            var ret = res.error_code == '20001' || res.error_code == '20003';
            if(ret){
                dmJs.lStore.remove('cookieAccessToken');
                me.remove('currentUser');
                viewJs.showPopMsg(urmingTips.accessInvalid);
            }
            return ret;
        },toLogin:function(successTo){
            var me = this;
            if(successTo != null){
                me.saveSuccessTo(successTo);
            } else {
                me.saveSuccessTo({url:'./'});
            }
            if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2Flogin.html%3F&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
                return;
            }else{
                viewJs.navigator.next({next:{url:'./login.html', id:'signIn'}});
            }
            // $.mobile.changePage('./login.html');
        },syncBalance:function(callback){
            var me = this;
            var currentUser = me.getUserInfo();
            if(currentUser == null){
                me.toLogin();
                return
            }
            dmJs._ajax({
                maskText:'同步用户信息',
                id:'syncBalance',
                url:'/urming_quan/user/getUserPageByAccessToken',
                params:{accessToken:currentUser.accessToken,type:2},
                callback:function(data){
                    currentUser.user = data.user;
                    me.saveLoginInfo(currentUser);
                    if($.isFunction(callback)){
                        callback();
                    }
                }
            });
        }
    };
    dmJs.initData();
});
pubCnJs= {
    publishTitle:'发布赛事项目',
    namedec:'2到30个字',
    projectName:'项目名称',
    categories:'项目分类',
    contact:'联系方式',
    contactCon:'联系方式',
    introduction:'项目介绍',
    introdec:'详细的介绍，能吸引更多支持者呦',
    phone:'电话',
    email:'邮箱',
    WeChat:'微信',
    picture:'添加图片',
    insertLink:'插入链接',
    decmore:'附件请上传至第三方网盘供应商，然后在项目介绍中填入加密下载链接',
    dec:'描述',
    submit:'完成',
    pubSub:'发布',
    catPlaceh:'利于查找和管理哦~例:创新、实践',
    exit:'退出',
    chioseTag:'选择分类',
    tagTip:'点击<span class="v-fill-tag-icon">　</span>才能完成标签的输入哦！',
    tag:'手动输入标签',
    setTag:'选择标签',
    searchTitle:'赛事项目',
    pagePrev:'上一页',
    pageNext:'下一页',
    linkNamePlace:'请输入链接名称',
    linkValuePlace:'请输入链接地址',
    linkValue:'链接地址',
    linkName:'链接名称',



    turnLang:'To English'
}
pubEnJs= {
    publishTitle:'Publish',
    namedec:'a maximum of 30 characters',
    projectName:'Title',
    categories:'category',
    contact:'Contact',
    contactCon:'contact content',
    introduction:'Project introduction',
    introdec:'detailed description',
    phone:'Phone',
    email:'Email',
    WeChat:'WeChat ID',
    picture:'Add Pic',
    insertLink:'Insert link',
    decmore:'Annexes please upload to third-party Web site provider, Then fill in the introduction to encrypt download links',
    dec:'Desc.',
    submit:'submit',
    pubSub:'submit',
    catPlaceh:'tags',
    exit:'Exit',
    chioseTag:'Chiose Tags',
    tagTip:'Check<span class="v-fill-tag-icon">　</span> to chiose this tag！',
    tag:'write a tag',
    setTag:'Set Tag',
    searchTitle:'Event Project',
    pagePrev:'Prev',
    pageNext:'Next',
    linkNamePlace:'Name Of Link ',
    linkValuePlace:'Address Of Link',
    linkValue:'Address',
    linkName:'Name',

    turnLang:'切换到中文'
}
serviceCnJs={
    title :'参赛项目详情',
    buy:'支持',
    collect:'收藏',
    categories:'分 类',
    creTime:'发布时间',
    reviewNumbers:'暂无评价',
    provider:'<span class="prePageTitle">参赛项目提供者</span>',
    svrDetail:'<span class="prePageTitle">参赛项目描述</span>',
    report:'举报',
    exit:'退出',
    pubSub:'确定',



    turnLang:'To English'

}
serviceEnJs={
    title:'Project',
    buy:'Support',
    collect:'Collect ',
    categories:'Category',
    creTime:'Published Time',
    reviewNumbers:'No Review',
    provider:'<span class="prePageTitle">Provider</span>',
    svrDetail:'<span class="prePageTitle">Project Introduction</span>',
    report:'Report',
    exit:'Exit',
    pubSub:'submit',



    turnLang:'切换到中文'

}
registCnjs = {
    signUp:'公众号注册',
    group:'公司/机构/学校',
    project:'项目/团队',
    userName:'用户名',
    userNameP:'4-20位字母、数字或下划线',
    realname:'公众号',
    realnameP:'机构、企业名称',
    contactRealname:'联系人',
    contactRealnameP:'联系人姓名',
    securityCode:'验证码',
    securityCodeP:'图片验证码',
    phoneName:'手机号',
    phoneNameP:'联系人手机号',
    phoneCodeR:'获取验证码',
    phoneCode:'验证码',
    phoneCodeP:'短信验证码',
    passWord:'密码',
    passWordP:'密码',
    hide:'隐藏',
    agree:'我已阅读并接受',
    term:'《创新学堂使用协议》',
    submit:'提交',
    toLogin:'登录',
    toRegister:'注册',

    tip:'手机号仅作为公众号消息接收、联络，不能用于登录'
}
registEnjs = {
    signUp:'Sign Up',
    group:'Co./Org./School',
    project:'Project/Group',
    userName:'User Name',
    userNameP:'4-20letters,numbers,or underscores',
    realname:'Name',
    realnameP:'Name of organizations',
    contactRealname:'Contact',
    contactRealnameP:'Contact Name',
    securityCode:'ReCaptcha',
    securityCodeP:'Please enter the graphical verification code',
    phoneName:'Mobile phone',
    phoneNameP:'Mobile phone',
    phoneCodeR:'Get Code',
    phoneCode:'ReCaptcha',
    phoneCodeP:'SMS verification code',
    passWord:'Password',
    passWordP:'Password',
    hide:'Hide',
    agree:'By signing up, you agree to our <br/>',
    term:'《Terms Of Use&Privacy Policy》',
    submit:'Submit',
    toLogin:'Sign In',
    toRegister:'Sign Up',

    tip:'Mobile phone are used only for receiving account information,cannot be used to log on'
}