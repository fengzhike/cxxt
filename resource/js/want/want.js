var wantJs = {
    _data:null,
    init: function () {
        $('#responseCtr').hide();
        var params = this.preInit();
        if (!params) {
            return;
        }
        this.resetData(true);
        var $p = $.mobile.activePage;
        $p.find('.instant-service').hide();
        $p.find('.instant-service.ui-btn').addClass('disable').removeClass('enable');
        this.loadData(params);
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
                '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
    },resetData:function(bInit){
        var me = wantJs;
        if(bInit) {
            me._data = {};
        } else {
            me._data = null;
        }
    },toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = wantJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                //viewJs.toggleParentShow(true);
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                //$p.delegate('.u', 'vclick', me.toUserPage);
                $p.delegate('.user', 'vclick', me.toUserPage);
                $p.delegate('#responseCtr-users', 'vclick', me.toWantResponses);
                $p.delegate('.reportBt', 'vclick', me.fReport);
                $p.delegate('.instant-service.ui-btn.enable', 'vclick', me.instantService);
                $p.delegate('.btn-store','vclick', me.doStoreSvr);
            }, 500);
        }
    },doStoreSvr:function(){
        var _self = arguments.callee;
        // if(_self.busy){
            // return;
        // }
        _self.busy = true;
        var $el = $(this);
        var bCancel = $el.is('.cancel');
        var accessToken = dmJs.getAccessToken();
        var wantID = mainJs.parseUrlSearch().wantID;
        if(accessToken == null){
            if(wantID != null){
                dmJs.sStore.toLogin({href:'./want.html', options:{data:{wantID:wantID}}});
            } else {
                dmJs.sStore.toLogin();
            }
            _self.busy = false;
        } else {
            var params = {wantID:wantID};
            params.accessToken = accessToken;
            dmJs._ajax({
                id:'store',
                params:params,
                url:'/urming_quan/want/'+(bCancel ? 'removeStore': 'store'),
                callback:function(){
                    $el.toggleClass('cancel');
                    $('#storeResult').html(bCancel ? '取消收藏成功' : '收藏成功').show().delay(3000).hide(1);
                    _self.busy = false;
                },error:function(){
                    _self.busy = false;
                }
            });
        }
    }, toUserPage: function () {
        var $el = $(this);
        var userID = $.trim($el.attr('data-userID'));
        viewJs.navigator.next(
            {
                next: {url: './u.html', id: 'u', options: {data: {userId: userID}}},
                lastAuto: true
            });
    }, instantService: function () {
        var me = wantJs;
        var $el = $(this);
        var $p = $.mobile.activePage;
        var username = $el.data('username');
        var wantID =  $el.data('wantID');
        if (!dmJs.hasLogin()) {
            dmJs.sStore.toLogin({url: './want.html', id: 'want', options: {data: {wantID: wantID}}});
            return;
        }
        if($el.html()=="编辑"){
            viewJs.navigator.next({
                next: {url: './addWant.html', id: 'addWant',
                    options:{
                        data:{wantID:wantID}
                    }},
                lastAuto: true
            });
        }else{
            viewJs.navigator.next({next:{
                url:'./addService.html',
                id: 'addService',
                options: {data: {wantID: wantID,catId: 1}}
            },lastAuto:true});
        }
        /*
        $el.hide();
        var tn = dmJs.getAccessToken();
        dmJs._ajax({
            id:'store',
            params:{accessToken:tn,wantID:wantID},
            url:'/urming_quan/want/respondWant',
            callback:function(){
                viewJs.showPopMsg('感谢您的参与,响应信息已经发送给'+username);
               var responseNumber =  me._data.responseNumber;
               var responseUsers =  me._data.responseUsers;
                var user = dmJs.sStore.getUserInfo().user;
                $.each(responseUsers, function(index, item){
                    if(item.id == user.id){
                        user = null;
                        return false;
                    }
                });
                if(user){
                    responseNumber ++;
                    responseUsers.push({id:user.id,profileImageUrl:user.profileImageUrl});
                    me.setRespondUser(responseNumber,responseUsers);
                }
            },error:function(){
                $el.show();
            }
        });
        */
    }, setupInstantService: function (want) {
        var $p = $.mobile.activePage;
        var btn = $p.find('.instant-service.ui-btn').data('wantID', want.id).data('username', want.user.realname);
        var loginUser = dmJs.sStore.getUserInfo();
        if (loginUser != null && want.user.id == loginUser.user.id) {
            btn.html('编辑');
            if(want.responseNumber>0){
                btn.addClass('disable').removeClass('enable');
            }else{
                btn.removeClass('disable').addClass('enable');
            }
        } else {
            btn.removeClass('disable').addClass('enable');
        }
    }, fReport: function () {
        var initParam = mainJs.parseUrlSearch();
        viewJs.navigator.next({
            next: {url: './report.html', id: 'report',
                options: {
                    data: initParam
                }},
            lastAuto: true
        });
    },
    preInit: function () {
        var params = mainJs.parseUrlSearch();
        if ($.trim(params.wantID).length <= 0) {
            viewJs.showApiError({error_code: '20503'});
            return;
        }
        var accessToken = dmJs.getAccessToken();
        if(accessToken){
            params.accessToken = accessToken;
        }
        return params;
    },setRespondUser:function(responseNumber,responseUsers){
        if(!(responseNumber > 0)){
            return;
        }
        $('#responseCtr-num').html(responseNumber);
        var resUsers = [];
        responseUsers =  responseUsers.slice(0,30);
        $.each(responseUsers, function(index, user){
            var img = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
            resUsers.push([
                '<a class="u" data-userID="',user.id,'">',
                '<img src="',img,'">',
                '</a>'
            ].join(''));
        });
        $('#responseCtr-users').html(resUsers.join(''));
        $('#responseCtr').show();
    }, initWantDetails: function (data) {
        var me = wantJs;
        // 需求详情页面
        var  $p = $.mobile.activePage;

        var want = data.want;
        var responseNumber = want.responseNumber;
        var responseUsers = data.responseUsers || [];
        me._data.responseNumber = responseNumber;
        me._data.responseUsers = responseUsers;

        var categoryId = want.category.id;
        var wantName = want.wantName;
        var wantDesc = want.wantDesc;
        var price = want.price;
        var user = want.user;
        var store = data.store;
        document.title = wantName;
		var catId = want.category.category.id;
		var preTitle = "需求";
		if(catId==5){
			preTitle = "问题";
		} else if(catId==7){
			preTitle = "招聘";
		}
		$p.find('.prePageTitle').html(preTitle);
        var $store = $('.btn-store');
        if(store != 0){
            $store.addClass('cancel');
        } else {
            $store.removeClass('cancel');
        }
        me.setRespondUser(responseNumber, responseUsers);
        dmJs.findCatById(categoryId, function (cat) {

            $p.find('.ct').empty();
            // 需求
            $p.find('#svrName').html(wantName);
            $p.find('.sec1 .ct').html([
                '<table>',
                '<tr>',
                '<th>分&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;类：</th>',
                '<td class="font-gray">',
                cat.categoryName,
                '</td>',
                '</tr>',
                '<tr>',
                '<th>预&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;算：</th>',
                '<td class="font-gray">',
                price,
                '元'+((want.unit==undefined || want.unit=='')?'':('/'+want.unit))+'</td>',
                '</tr>',
                '<tr>',
                '<th>发布时间：</th>',
                '<td class="font-gray">',
                want.creTime,
                '</td>',
                '</tr>',
                '</table>'
            ].join(''));
            // 需求描述
            $p.find('.sec2 .ct').html(me.typesetting(wantDesc));
            // 需求方
            var profileImageUrl = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
            var userType = user.type;
            var isMoneyGuaranteed = user.isMoneyGuaranteed;
            var isIdcardValidated = user.isIdcardValidated;
            var userTags = user.userTags;
            var realname = user.realname;
            var sex = viewJs.setSexMarkCls(user);
            var userType = user.type;
            var userTags = user.userTags;
            var tagHtmls = [];
            var contactPhone = user.contactPhone;
            // 服务指数
            var l = userTags.length;
//            创新学堂贷款
            var bLoad;
            if (l != 0) {
                var tag, i = 0, tagHtmls = [];
                for (; i < l; i++) {
                    tag = userTags[i];
                    if($.trim(tag.tagName) == "北大创新"){
                        continue;
                    }
                    if(viewJs.bLoan(tag)){
                        bLoad = true;
                    }
                    tagHtmls.push(['<span class="vtd"><span class="tag name">', tag.tagName, '</span>', '<span class="tag value">', Math.floor(tag.prvalue), '</span></span>'].join(''));
                }
            }
            var instanceBtn = $p.find('.instant-service');
            if(bLoad){
                instanceBtn.html('立即申请');
            } else {
                instanceBtn.html('立即响应');
            }
            instanceBtn.show();
            var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
                ,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
                "六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
            var rank = rankArr[user.rank];
            var idcardValidated = 'empty';
            if(user.type == 2){
                idcardValidated = user.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
                var rank = "";
                for(var i=0;i<parseInt((user.rank-1)/5);i++){
                    rank+='<img src="resource/images/icon_diamond_img.png"/>';
                }
                for(var i=0;i<parseInt((user.rank-1)%5);i++){
                    rank+='<img src="resource/images/icon_star_img.png"/>';
                }
            } else if(user.isTeacherValidated == 1 || user.type == 3){
                idcardValidated = user.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
                var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
                    "七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
                    "五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
                rank = rankTeacherArr[user.rank];
            }else if(user.isIdcardValidated == 1){
                idcardValidated = 'person';
            }
            var html = [
                '<a data-userId="', user.id, '" class="vbt vr icon-right user">',
                '<img class="userImg"src="', profileImageUrl, '">',
                '<div class="block right">',
                '<div class="line1 "><span class="ellipsis" style="display: inline-block;max-width:200px;">', realname , '</span><span class="mark sex ',
                sex ,
                '"></span><span class="mark idcardValidated ', idcardValidated, '"></span>',
                '</span>',
                '</div>',
                '<div class="user-rank">',rank,'</div>',
                '<div class="line2">', tagHtmls.join(''), '</div>',
                '</div>',
                '</a>'
            ];
            $p.find('.sec3 .ct').html(html.join(''));
            // 联系人脚
            var $f = $p.find('.svrUserFooter');

            me.initConcatFooter($f, realname, contactPhone);
            me.setupInstantService(want);
        });
    }, typesetting: function (str) {
        if (str == null) {
            return '';
        }
        return '&nbsp;&nbsp;&nbsp;' + (str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
    }, loadData: function (params) {
        // 需求详情
        dmJs._ajax({id: 'getUserWants', params: params, url: '/urming_quan/want/getWantByID', callback: this.initWantDetails});
    }, initConcatFooter: function ($f, realname, contactPhone) {
        if(true){//!dmJs.hasLogin()
            $f.hide();
            return;
        } else {
            $f.show();
        }
        var dispPhone = $.trim(contactPhone);
        dispPhone = dispPhone.substring(0, dispPhone.length-4)+'****';
        var info = {realname:realname,contactPhone:dispPhone};
        if(dmJs.isAndroid){
            info.phoneScheme = "wtai://wp/mc;"+contactPhone;
        } else{
            info.phoneScheme = "callto:"+contactPhone;
        }
        var tpl = $('#contract_footer_tpl').html();
        $f.html(viewJs.applyTpl(tpl, info));
        setTimeout(function(){
            $f.find('.usePhone').css('display', 'inline-block');
        },500);
        return;
    }, toWantResponses:function(){
        var $p = $.mobile.activePage;
        var btn = $p.find('.instant-service.ui-btn');
        if(btn.html()=="编辑"){
            viewJs.navigator.next({
                next: {url: './wantResponses.html', id: 'wantResponses',
                    options:{
                        data:{wantID:mainJs.parseUrlSearch().wantID}
                    }},
                lastAuto: true
            });
        }
    }
};