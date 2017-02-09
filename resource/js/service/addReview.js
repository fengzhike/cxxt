addReviewJs = {
	init:function(){
		var me = addReviewJs;
		if(!me.chkLogin()){return;}
		me.initAddReview();
		me.toggleEvents(true);
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
		var me = addReviewJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.starImg', 'tap', me.editStar);
//				$p.delegate('.vbt.submit', 'vclick', me.submitReview);
//                $p.delegate('.anonymousCtr', 'vclick', me.toggleCheck);
                $p.delegate('[action]', 'vclick', me.doAction);
			}, 500);
		}
	},doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = addReviewJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        switch(sAction){
            case 'cancel':
                me.cancel();
                break;
            case 'submit':
                me.submitReview();
                break;
            case 'check':
                me.toggleCheck.apply($el);
                break;
            case 'service':
                me.showSvrDetail.apply($el);
                break;
        }
    },toggleCheck:function(){
        $('.reviewContent').blur();
        $(this).find('.vcheck').toggleClass('sel');
    },cancel:function(){
		var me = addReviewJs;
		viewJs.dialogPop('<p>取消评价？</p><div class="vct">已填写的内容将不会保存。</div>'
			,function(isOK){
				if(isOK){
					me.pre();
				}
			}
		);
	},showSvrDetail:function(){
		var $m = $(this);
		var serviceID = $m.attr('data-id');
		if(serviceID != null && serviceID != ''){	
			var params = {serviceID:serviceID};
            console.log(params)
			if($m.attr('data-catId')==3){
				viewJs.navigator.next({
					next:{url:'./course.html', id:'course',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./service.html', id:'service',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}
		}
	},editStar:function(){
		var $el = $(this);
        $el.removeClass('empty').addClass('full');
        $el.prevAll().removeClass('empty').addClass('full');
        $el.nextAll().removeClass('full').addClass('empty');
	},initAddReview:function(){
		var params = mainJs.parseUrlSearch();
        var $p = $.mobile.activePage;
        var tpl = $p.find('#review-tpl').html();
        var $ct = $p.find('.ui-content');
        var info = {};
        info.name = params.serviceName;
        info.id = params.serviceID;
        info.catId = params.catId;
        if(params.type == '2'){
            info.anonymousCls = 'no-anonymous';
        }
        $ct.html(viewJs.applyTpl(tpl, info));
	},submitReview:function(){
		var me = addReviewJs;
        var initParam = mainJs.parseUrlSearch();
		var params = {};
        params.serviceOwnID = $.trim(initParam.serviceOwnID);
		var $p = $.mobile.activePage;
        params.isAnonymous = $p.find('.anonymousCtr .vcheck.sel').length;
		params.score = $p.find('.starImg.full').length;
        params.type = $.trim(initParam.type);
		params.reviewContent = $.trim($p.find('.reviewContent').val());
        if(params.reviewContent == ''){
            viewJs.showPopMsg('评价内容不能为空');
            return;
        }
		params.accessToken = dmJs.getAccessToken();
		dmJs._ajax({
			method:'POST',
			id:'submitReview',
			url:'/urming_quan/service/addReview',
			params:params,
			callback:me.pre
		});
	},pre:function(){
		var params = mainJs.parseUrlSearch();
		if(params.lastAuto){
			viewJs.navigator.pre();
			return;
		}
		if(params.type == '1'){
			viewJs.navigator.next({next:{url:'./buyorder.html', id:'buyorder', options:{data:{type:0,userType:1}}},lastAuto:false});
		} else if(params.type == '2'){
			viewJs.navigator.next({next:{url:'./buyorder.html', id:'buyorder', options:{data:{type:0,userType:2}}},lastAuto:false});
		} else {
			viewJs.navigator.pre();
		}
	}
};