/**
 * Created by lchysh on 2014/8/26.
 */
followJs = {
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
        var me = followJs;
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
        var me = followJs;
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me.fetchData.apply($el, arguments);
                break;
            case 'userDetail':
                me.toUserPage.call($el, arguments);
        }
    },toUserPage:function(){
        var $el = $(this);
        var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
        viewJs.navigator.next({next:{url:'./u.html',id:'u',options:{data:param}}, lastAuto:true});
    },filterList:function(){
        var $el = $(this);
        var me = followJs;
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
                var me = followJs;
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
        var me = followJs;
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
            url:'/urming_quan/friend/getFollowing',
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
        var list =  data.users;
        //console.log(list)
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
        var $list = $p.find('.friendList');
        if(total > 0){
            var tpl = $p.find('#follow-tpl').html();
            var item,info;
            for(var i = 0; i < l; i++){
                item = list[i];

                var idcardValidated = 'empty';
                var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
                    ,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
                    "六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
                //$u.find('.user-rank').text(rankArr[item.rank]);
                if(item.type == 2){
                    idcardValidated = item.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
                    var rankArr = "";
                    for(var i=0;i<parseInt((item.rank-1)/5);i++){
                        rankArr+='<img src="resource/images/icon_diamond_img.png"/>';
                    }
                    for(var i=0;i<parseInt((item.rank-1)%5);i++){
                        rankArr+='<img src="resource/images/icon_star_img.png"/>';
                    }
                    //$u.find('.user-rank').html(rankArr);
                } else if(item.isTeacherValidated == 1 || item.type == 3){
                    idcardValidated = item.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
                    var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
                        "七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
                        "五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
                    //$u.find('.user-rank').text(rankTeacherArr[item.rank]);
                }else if(item.isIdcardValidated == 1){
                    idcardValidated = 'person';
                }

                info = {id:item.id};
                info.userType = idcardValidated;
                info.sexWord = viewJs.setSexMarkCls(item);
                info.avatar = mainJs.getProfilePicUrl({sex:item.sex,url:item.profileImageUrl});
                info.realname = item.realname;
                info.followCls = item.isFriend == 1 ? 'follow-each-other' :'';
                html.push(viewJs.applyTpl(tpl, info));
            }
            var tmp = viewJs.applyTpl(paperTpl, pageInfo);
            $paper.html(tmp);
        }else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div></div>'];
            $p.find(".friendList").css("background-color","transparent");
        }
        $list.html(html.join(''));
    }
};