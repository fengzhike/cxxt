foundJs = {
    _tmpData:{},
    offset:0,
    init:function(){
        this.resetData(true);
        this.toggleEvents(true);
        this.initPage();
    },initPage:function(){
        var params = mainJs.parseUrlSearch();
        var $p = $.mobile.activePage;
        //this.getCount();
        var initTab = params.tab ? params.tab : 'course';
        initTab = $p.find('[tab="'+initTab+'"]').addClass('sel');
            this.setRemindTips()

        this._fetchData(this._getOpt());
    },_getOpt:function(){
        var $p = $.mobile.activePage;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
        var ret = {
            $num:$p.find('.btn-tab[tab="'+tab+'"]  .num'),
            domain:this._tmpData[tab],
            $content:$p.find('.tabContent>[tab="'+tab+'"]')
        }
        if(!ret.domain){
        }
        switch(tab){
            case 'course':
                ret.url = '/urming_quan/search/getServices';
                ret.catId = '3';
                ret.categoryParentId = '3';
                ret.searchKind = 'course';
                break;
            case 'service':
                ret.url = '/urming_quan/search/getServices';
                ret.catId = '1';
                ret.categoryParentId = '1';
                ret.searchKind = 'service';
                break;
            case 'activity':
                ret.url = '/urming_quan/search/getServices';
                ret.catId = '4';
                ret.categoryParentId = '4';
                ret.searchKind = 'activity';
                break;
            case 'want':
                ret.url = '/urming_quan/search/getWants';
                ret.catId = '2';
                ret.categoryParentId = '2';
                ret.searchKind = 'want';
                break;
            case 'question':
                ret.url = '/urming_quan/search/getWants';
                ret.catId = '5';
                ret.categoryParentId = '5';
                ret.searchKind = 'question';
                break;
            case 'users':
                ret.url = '/urming_quan/search/getUsers';
                ret.searchKind='users';
                break;
        }

        return ret;
    },getCount:function(){
        /*
        dmJs._ajax({
            url:'/urming_quan/activityr/getUserPageByAccessToken',
            id:'getUserPageByAccessToken',
            params:{type:1,accessToken:dmJs.getAccessToken(),parentCategoryId:mainJs.parseUrlSearch().catId},
            callback:function(data){
                var $p = $.mobile.activePage;
                $p.find('.btn-tab[tab="service"] .num').html(data.waitToPayServiceNumber)
				.toggleClass('show', data.waitToPayServiceNumber != 0);
                $p.find('.btn-tab[tab="course"]  .num').html(data.waitToReviewServiceNumber)
				.toggleClass('show', data.waitToReviewServiceNumber != 0);
                $p.find('.btn-tab[tab="activity"] .num').html(data.waitToUseServiceNumber)
				.toggleClass('show', data.waitToUseServiceNumber != 0);
            }
        });
        */
    },resetData:function(bInit){
        if(bInit){
            this._tmpData = {};
            this._tmpData.service = {key:'service',tpl:$('#service_item_tpl').html()};
            this._tmpData.activity = {key:'activity',tpl:$('#activity_item_tpl').html()};
            this._tmpData.course = {key:'course',tpl:$('#course_item_tpl').html()};
            this._tmpData.want = {key:'want',tpl:$('#want_item_tpl').html()};
            this._tmpData.question = {key:'want',tpl:$('#question_item_tpl').html()};
            this._tmpData.users = {key:'users',tpl:$('#users_item_tpl').html()};
        } else {
            this._tmpData = null;
        }

    },chkLogin:function(){
        var activityr = dmJs.sStore.getUserInfo();
        if(activityr == null){
            viewJs.dialogPop('请先登录！', function(){
                viewJs.navigator.pre();
            }, '错误', {onlyBtnOk:true});
            return;
        }
        return activityr;
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = foundJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
                me.resetData();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.tab-bar [action]', 'vclick', me.doAction)
                    .delegate('.tabContent [action]', 'vclick', me.toPage)
                    .delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
                $p.delegate('[action]', 'vclick', me.pageNav);

            }, 500);
        }
    },pageNav:function(e){
        var me = foundJs;
        if($(this).is('.disabled')){
            return;
        }
        var sAction = $.trim($(this).attr('action'));
        if(sAction == "pageNav"){
            foundJs.offset = ($(this).attr('data-page-num')-1)*20;
            me._fetchData(me._getOpt());
        }
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = foundJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        me.offset =0;
        if(sAction=='tab'){
            me.toggleTab.call($el);
        }
            me.setRemindTips()

    },toggleTab:function(){
        var $el = $(this);
        if($el.is('.sel')){
            return;
        }
        var $p = $.mobile.activePage;
        $p.find('[tab].sel').removeClass('sel');
        $p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
        var me = foundJs;
        me._fetchData(me._getOpt());
    },_fetchData:function(opt){


        var _self = opt.domain;
        var evt = opt.evt;
        var me = foundJs;
        /*if(_self.busy){
            return;
        }
        _self.busy = true;*/
        var currentUser = dmJs.sStore.getUserInfo();
        var me = foundJs;
        var params = {};
        if(currentUser && currentUser.accessToken){
            params.accessToken = currentUser.accessToken;
        }
        params.longitude = dmJs.params.geolocation.longitude;
        params.latitude = dmJs.params.geolocation.latitude;
        params.distance = 5000;
        params.searchKind = opt.searchKind;
        params.orderType = 1;
        params.area1area1 = '中国';
        params.pageSize = '20';
        params.offset = me.offset;

        if(opt.searchKind !='users'){
            params.orderType = 4;
            params.catId =opt.catId;
            params.categoryParentId =opt.categoryParentId;
        }
        //console.log(params)
        dmJs._ajax({
            id:'fetchData_'+_self.key,
            url:opt.url,
            params:params,
            callback:function(data){
                me.parseList(data, $.extend(opt,params));
            },accessInvalid:function(){
                dmJs.sStore.toLogin({href:'./found.html',options:{data:{tab:_self.key}}});
            },error:function(){
                viewJs.showPopMsg('网络错误');
            }
        })
    },parseList:function(data, opt){
        viewJs.top()
        var me = foundJs;
        var list = data.datas;
        var l = list.length;
        var $p = $.mobile.activePage;
        var $c = opt.$content.empty();
        var html = [];

		if(l > 0){
			var i=0,item;
			var tpl = opt.domain.tpl || $('#service_item_tpl').html();
			for(; i < l; i++){
				item = list[i];
				html.push(viewJs.applyTpl(tpl, me.formatInfo(item,opt.domain)));
			}
		} else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div></div>'];
        }
        $c.html(html.join(''));
        var lPage =data.total
        var paperTpl = $p.find('#paper_tpl').html();
        var htlPage = [];
        if(lPage>20){
            var _PAGE_SIZE = mainJs.PAGE_SIZE;
            var pageInfo = {};
            pageInfo.hasPre = me.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (me.offset+_PAGE_SIZE) < lPage ? '' : 'disabled';
            var pageCurrent = Math.ceil(me.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = lPage < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(lPage/_PAGE_SIZE)].join('/');
            htlPage.push(viewJs.applyTpl(paperTpl, pageInfo));
        }
        $c.append(htlPage.join(''));

    },setRemindTips:function(){
        //fsk红点提醒
        var $p = $.mobile.activePage;
        var params = {
            accessToken : dmJs.sStore.getUserInfo()?dmJs.sStore.getUserInfo().accessToken:'',
            distance:5000,
            longitude: dmJs.params.geolocation.longitude,
            latitude: dmJs.params.geolocation.latitude

        }

        dmJs._ajax({
            id:'getAroundHints',
            url:'/urming_quan/system/getAroundHints',
            params:params,
            callback:function(data){
                if(data.courseHint){
                    $p.find('.tab-bar div[tab="course"] .remind').show()
                }
                if(data.serviceHint){
                    $p.find('.tab-bar div[tab="service"] .remind').show()
                }
                if(data.wantHint){
                    $p.find('.tab-bar div[tab="want"] .remind').show()
                }
                if(data.questionHint){
                    $p.find('.tab-bar div[tab="question"] .remind').show()
                }
                if(data.activityHint){
                    $p.find('.tab-bar div[tab="activity"] .remind').show()
                }

                $('.sel .remind').hide()

            }
        });
    },formatInfo:function(item, typeInfo){
        var info = {},svrVer,activityrByUserId;
        if(typeInfo){
            info.id = item.id;
            info.price = item.newPrice;
            var typePic = {1:mainJs.getSvrPicUrl,3:mainJs.getCoursPicUrl,4: mainJs.getActPicUrl};
            switch (typeInfo.key){
                case 'service':case 'course':case 'activity':
                info.img = typePic[item.categoryParentId]({url:item.picUrl,size:1});
                info.serviceName = item.serviceName;
                //info.soldCount = item.soldCount;
                info.viewCount = item.realViewCount;
                info.category = item.categoryName;
                break;
                case 'want':case 'question':
                    info.price = item.price;
                    info.realname = item.username;
                    info.userId = item.userID;
                    info.profileImageUrl = mainJs.getProfilePicUrl({url:item.profileImageUrl, sex:item.sex});
                    info.title = item.wantName;
                    info.content = item.wantDesc;
                    info.creTime = item.creTime;
                    break;
                case 'users':
                    var info = {};
                    info.sex = viewJs.setSexMarkCls(item);
                    var idcardValidated = 'empty';
                    if(item.type == 2){
                        idcardValidated = item.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
                        if(item.isGroup){
                            idcardValidated = 'project'
                        }
                    } else if(item.isTeacherValidated == 1 || item.type == 3){
                        idcardValidated = item.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
                    }else if(item.isIdcardValidated == 1){
                        idcardValidated = 'person';
                    }
                    info.userType= idcardValidated;
                    info.idcardValidated = 'idcardValidated';
                    /*
                     info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
                     info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
                     */
                    var userTags = item.userTags;
                    var tagHtmls = [];
                    var i = 0 , l = userTags.length,tagItem;
                    for(; i < l; i++){
                        tagItem = userTags[i];
                        if($.trim(tagItem.tagName) == "北大创新"){
                            continue;
                        }
                        tagHtmls.push([
                            '<div class="tagItem">',
                            '<span class="tagName">',tagItem.tagName,
                            '</span><span class="prvalue font-blue">',
                            tagItem.prvalue == null ? '' : Math.floor(tagItem.prvalue),
                            '</span>',
                            '</div>'
                        ].join(''));
                    }
                    info.id = item.id;
                    info.prvalue = Math.floor(item.prvalue);
                    info.userName = item.realname;
                    if(item.institutionUserName){
                        info.institutionUserName = "所属公众号: "+item.institutionUserName;
                    }
                    info.img =  mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex});
                    info.tag = tagHtmls.join('');
            }
        }
        return info;
    },toPage:function(){
        var $m = $(this);
        var id = $.trim($m.attr('data-id'));
        var param = {};
        var sAction = $.trim($m.attr('action'));
        if(id != ''){
            var $p = $.mobile.activePage;
            var tab = $.trim($p.find('.tab-bar>[tab].sel').attr('tab'));
            tab == '' ? 'service' : tab;
            var next;
            switch(sAction){
                case 'service':case 'activity':
                    param.serviceID = id;
                    next = {
                        url:'./service.html',
                        id:'service',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'course':
                    param.serviceID = id;
                    next = {
                        url:'./course.html', id:'course',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'want':
                    param.wantID = id;
                    next = {
                        url:'./want.html', id:'want',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'question':
                    param.wantID = id;
                    next = {
                        url:'./question.html', id:'question',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'addService':
                    param.wantID = id;
                    param.catId = 1;
                    next = {
                        url:'./addService.html', id:'addService',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'addAnswer':
                    param.wantID = id;
                    param.catId = 6;
                    next = {
                        url:'./addAnswer.html', id:'addAnswer',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'user':
                    param.userId = id;
                    next = {
                        url:'./u.html', id:'u',
                        options:{
                            data:param
                        }
                    };
                    break;
            }
            if(next){
                viewJs.navigator.next({
                    next:next,
                    last:{id:'found',url:'./found.html',options:{data:{tab:tab}}}
                });
            }
        }
    }
};