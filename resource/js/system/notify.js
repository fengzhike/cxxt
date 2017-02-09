notifyJs = {
	init:function(){
		var me  = notifyJs;
		me.sync();
		$.mobile.document.on( 'pagebeforeshow', '*', function() {
			if(!mainJs.isPageBeforeShow(this)){return;}
			me.sync();
		});
		
	},sync:function(){
		var me  = this;
		if(me.busy){
			return;
		}
        $('#msg_num_show').remove();
		var $p = $.mobile ? $.mobile.activePage : null;
		if(!$p || $p.is('#sysMessage')){return;}
		var userInfo =  dmJs.sStore.getUserInfo();
		if(userInfo == null){return;}
		var userId = userInfo.user.id;
		var accessToken = userInfo.accessToken;
		me.busy = true;
        setTimeout(function(){
            me.busy = false;
        }, 800);

		dmJs._ajax({id:'syncNotify',url:'/urming_quan/message/getNewNotify',params:{accessToken:accessToken}
			,callback:function(data){
				var newNotify = data.notify;
				var oldNotifyKey = 'oldNotify-' + userId;
				var alreadyReadKey = 'reayNotify-' + userId;
				var oldNotify = dmJs.lStore.get(oldNotifyKey) || [];
				var notifyLimit = 20;
				var notify = newNotify.concat(oldNotify).splice(0, notifyLimit-1);
                viewJs.fSyncVeryUserStatus(newNotify);
				dmJs.lStore.save(oldNotifyKey, notify);
				var i = 0, l = notify.length;
				var bubble = $('#msg_num,#startPage_msg_num');

				if(bubble.length == 0) {
                    return;
                }
				if(l == 0){
					me.busy = false;
					return;
				}
				var num1 = Number(dmJs.lStore.get(alreadyReadKey));
				if(num1 >= Number(notify[0].id)){
					me.busy = false;
					return;
				}
				var notReadNum = 0;
				if(num1 == 0){
					notReadNum = l;
				} else{
					for(; i < l; i++){
						if(Number(notify[i].id) <= num1){
							break;
						}
						notReadNum++;
					}
				}
                if(notReadNum > 99){
                    notReadNum = '..';
                }
                $('<style id="msg_num_show">body.login #msg_num,#startPage_msg_num{display:inline-block;}</style>>').appendTo(document.head);
				bubble.text(notReadNum);
				me.busy = false;
			}
		});
	}
};