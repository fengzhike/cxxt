userRankDescribeJs = {
	init:function(){
		this.toggleEvents(true);
		this.fetchData();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = userRankDescribeJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
			}, 500);

		}
	},fetchData:function(evt){
		var me = userRankDescribeJs;
		$(".ui-footer").remove();
		var params = mainJs.parseUrlSearch();
		params.id=params.userId;
		dmJs._ajax({
			method:'POST',
			id:'getUserCertificate',
			url:'/urming_quan/user/getUserCertificate',
			params:params,
			callback:function(data){
				me.initUserRank(data);
			}
		});
		$.get(mainJs.getApiUrl('/urming_quan/user/getWxJsApi'), {url:location.href.split('#')[0],random:Math.random()}, function(data){
			var r = $.parseJSON(data);
			wx.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: 'wx3b462eee381207f3', // 必填，公众号的唯一标识
				timestamp: r.timestamp , // 必填，生成签名的时间戳
				nonceStr: r.noncestr, // 必填，生成签名的随机串
				signature: r.signature,// 必填，签名，见附录1
				jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			wx.ready(function(){
				wx.onMenuShareAppMessage({
					title: '创新创业 我能！', // 分享标题
					desc: '我在创新学堂进行了创新创业里评测，获得了'+$("#rank").html()+'级评价，你也快来试试吧！', // 分享描述
					link: location.href.split('#')[0], // 分享链接
					imgUrl: 'http://m.edu.euming.com/resource/images/userRankDescribe-bg.jpg', // 分享图标
					type: 'link', // 分享类型,music、video或link，不填默认为link
					dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
					success: function () {
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});
				wx.onMenuShareTimeline({
					title: '创新创业 我能！', // 分享标题
					link: location.href.split('#')[0], // 分享链接
					imgUrl: 'http://m.edu.euming.com/resource/images/userRankDescribe-bg.jpg', // 分享图标
					success: function () {
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});
				wx.error(function(res){
					//alert(res);
					// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
				});
			});
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},initUserRank:function(data){
		var $p = $.mobile.activePage;
		var userRank = data.data;
		var rank = '';
		var assess = '';
		if(userRank.rank<4){
			rank = 'D';
			assess = '你资历尚浅，目前距离创业还有很长的路要走，目前应继续以学习和实践为主，相信通过你的努力，有朝一日你定会有所作为。';
		}else if(userRank.rank<7){
			rank = 'C';
			assess = '你天资聪慧，已经具备一定的创业者素质，可以从小事着手开始创业演练，夯实理论基础，同时积极参加实践项目，不日便可独挡一方天地。';
		}else if(userRank.rank<9){
			rank = 'B';
			assess = '你有很强的实干精神，已经基本掌握了有关创业的理论知识，实践证明你已经积累了有关创业的相关实操经验，此刻的你，已然在路上了，整合身边可以利用的一切资源，向着自己的梦想迸发吧！';
		}else{
			rank = 'A';
			assess = '你的才华已经无法被任何东西遮挡，你的面前是光明大道，所有的障碍只剩下你自己。创业靠的是意志力，此时的你十分清楚这点，你就像个天生的创业者，注定不会去走寻常路。';
		}
		$p.find("#realname").html(userRank.realname);
		$p.find("#serviceCount").html(userRank.serviceCount);
		$p.find("#wantCount").html(userRank.wantCount);
		$p.find("#questionCount").html(userRank.questionCount);
		$p.find("#answerCount").html(userRank.answerCount);
		$p.find("#orderCount").html(userRank.orderCount);
		$p.find("#soldMoney").html(userRank.soldMoney);
		$p.find("#rank").html(rank);
		$p.find("#assess").html(assess);
	}
};