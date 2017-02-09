/**
 * Created by lchysh on 2014/8/30.
 */
// ▲★◆◇→＾♀♂□●○★☆№■※□◇―￣＼＠＃○＿＾■№△§§△→→←＿＿＿
selectPublishJs = {
    init: function () {
        var me = selectPublishJs;
        var $p = $.mobile.activePage;
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
                '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }else{
            var user;
            if(!(user = viewJs.chkLogin())){
                return;
            }else{
                if(user.user.type == 2){
                    $p.find('.publish-type-funing').show();
                }
            }
        }
        //fsk红点提醒

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
                callback:me.setRemindTips
            });


    },setRemindTips:function(data){
        var $p = $.mobile.activePage;
        if(data.courseHint||data.serviceHint||data.wantHint||data.questionHint||data.activityHint){
            $p.find('.remind').show();
        }
        //console.log(111)
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = selectPublishJs;
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('.ui-content [action]', 'vclick', me.doAction)
                    .delegate('.h-menu [action]', 'vclick',headerFooterJs. _action)
                    .delegate('.protoco', 'vclick',me.protoco);
            }, 500);
        }
    },doAction:function(evt){
		var currentUser = dmJs.sStore.getUserInfo();
        /*
		if(typeof(currentUser.user.mobile) == 'undefined' || currentUser.user.mobile == ''){
			viewJs.dialogPop('绑定手机号才能发布！', function(res){
				if(res){
					viewJs.navigator.next({next:{url:'./bindMobile.html', id:'bindMobile'},lastAuto:true});
				}
			});
			return;
		}
		*/
        evt.preventDefault();
        evt.stopPropagation();
        var $el = $(this);
        var me = selectPublishJs;
        var action = $el.attr('action');
        var param = $el.attr('param');
        var next;
        if($.parseJSON(param).catId==8 && currentUser.user.isGroup==0 && currentUser.user.isIdcardValidated == 0){
            viewJs.dialogPop('完成认证才能发布众筹！', function(res){
                if(res){
                    next = {url:'./selectVeifyType.html',id:'selectVeifyType'};
                    viewJs.navigator.next({next:next,lastAuto:true});
                }
            },"提示",{okText:"去认证",noText:"暂不认证"});
            return;
        }else if($.parseJSON(param).catId==8){
            viewJs.dialogPop('<span>发布即视为同意：</span><br/><a class="protoco" href = "javascript:;" ><<创新学堂用户融资协议>></a> ', function(res){
                if(res){
                    next = {url:'./addService.html',id:'addService'};
                    if(param){
                        param = $.parseJSON(param);
                        next.options = {data:param};
                    }
                    viewJs.navigator.next({next:next,lastAuto:true});
                }
            },"提示",{okText:"发布融资",noText:"暂不参与"});
            return;
        }
        switch (action){
            case 'want':
                next = $.parseJSON(param).catId==5?{url:'./addQuestion.html',id:'addQuestion'}:{url:'./addWant.html',id:'addWant'};
				if(param){
                    param = $.parseJSON(param);
                    next.options = {data:param};
                }
                break;
            case 'service':
                next = {url:'./addService.html',id:'addService'};
                if(param){
                    param = $.parseJSON(param);
                    next.options = {data:param};
                }
                break;
        }
        if(next){
            //var user = dmJs.sStore.getUserInfo();
            //if(user.user.isIdcardValidated == 0){
                //viewJs.dialogPop('完成身份认证将大大提升您发布信息的可信度，获得更多点击呦！', function(res){
                //    if(res){
                //        next = {url:'./selectVeifyType.html',id:'selectVeifyType'};
                    //}
                    //viewJs.navigator.next({next:next,lastAuto:true});
                //},"提示",{okText:"去认证",noText:"知道了"});
            //}else{
                viewJs.navigator.next({next:next,lastAuto:true});
            //}
        }
    },protoco:function(){
        var $dlg =$('#protoco');
        if($dlg.length == 0){
            $dlg = $([
                '<div id="addServiceWantDesc" class="ui-page fullScreen vChild">',
                '<div data-role="header" >',
                '<a	class="ui-btn ui-icon-back vBack ui-btn-icon-notext">返回</a> ',
                '<h1>融资协议</h1>',
                '</div>',
                '<div class="content">',
                '创新学堂众创平台融资发起人协议<br>',
                '鉴于：<br>',
                '创新学堂众创平台融资是一个实现梦想的平台，发起人可以在创新学堂众创平台上发起创新项目的筹款需求。<br>',
                '为保护支持者的合法权益，规范发起人的行为，维护融资平台秩序，特制定本协议。<br>',
                '融资合作面向对象限于创新学堂经过认证的老师同学<br>',

                '<h4>第一条术语和定义</h4><br>',

                '除非本协议正文另有明确所指，在本协议中所用下列术语定义如下：<br>',
                '1.融资：指发起人在创新学堂众创平台融资上发起项目、支持者支付支持款、发起人发放回报的行为。<br>',
                '2.创新学堂众创平台融资：指域名为m.euming.com的融资信息服务平台。<br>',
                '3.创新学堂：指创新学堂众创平台融资的运营管理者及其关联公司。<br>',
                '4.发起人：指符合条件、在创新学堂众创平台融资上发起融资项目的自然人、法人或其他组织。<br>',
                '5.支持者：指出资支持融资项目，帮助发起人实现梦想的自然人、法人或其他组织。<br>',
                '6.项目价值：指融资项目的预估价值。<br>',
                '7.融资期限：指发起人确定的融资项目的募集时间。<br>',
                '8.融资募集成功：指融资期限届满且达到预定募集金额。<br>',
                '9.融资失败：发起人由于能力限制、市场风险、法律风险等各种因素，在融资期限届满前取消项目；<br>',

                '<h4>第二条签约主体</h4><br>',

                '1.本协议由创新学堂众创平台融http://m.euming.com）的运营管理者与发起人共同签署。本协议中提及的应由创新学堂行使的权利和履行的义务，可由创新学堂内部负责相应职能及业务范围的相关公司分别履行。<br>',
                '2.创新学堂仅为发起人与支持者之间的融资行为提供信息服务，用于创新教育为目的，创新平台融资产生的法律后果由发起人与支持者自行承担。<br>',

                '<h4>第三条协议生效和适用范围</h4><br>',

                '1.本协议包括协议内容以及创新学堂网站（包括但不限于m.euming.com及创新学堂众创平台融资等，下同）已经发布的或将来可能发布的各类规则、操作流程。所有规则为本协议不可分割的一部分，与协议正文具有同等的法律效力。<br>',
                '2.发起人在创新学堂众创平台融资发起项目时，即表示同意与创新学堂达成协议并接受本协议的全部约定内容。<br>',
                '3.创新学堂有权根据需要不时修改协议内容或各类规则、操作流程，如本协议有任何变更，创新学堂将在网站上以公示形式通知，且无需征得发起人的事先同意。修改后的协议内容及规则、流程一经公示即生效，成为本协议的一部分。如发起人继续登录或使用创新学堂众创平台融资的，即视为已阅读并接受修改后的协议。<br>',
                '4.发起人应该按照本协议约定行使权利并履行义务。如不能接受本协议的约定，包括但不限于不能接受修订后的协议及各类规则、操作流程，则应立即停止使用创新学堂众创平台融资提供的服务。如发起人继续使用服务，则表示同意并接受本协议及各类规则的约束。<br>',

                '<h4>第四条项目内容规范</h4><br>',

                '1.在创新学堂众创平台融资上发起的项目应为具有创新性质且具有可执行性的项目，且项目目标须是明确、具体、可衡量的，如制作一个实物、拍一部微电影或完成一件艺术创作等。<br>',
                '2.项目的内容必须包含“我想要做什么事情”、“项目风险”、“项目回报”、“为什么需要支持”等信息。<br>',
                '3.项目内容及发起人上传的相关项目信息（包含但不限于文字、图片、视频等）须为发起人原创，如非发起人原创，则发起人应已获得权利人的相应授权。<br>',
                '4.项目不允许将已经完成生产的商品进行销售，公益相关项目和特殊项目除外。<br>',
                '5.不允许在无实质项目内容的情况下纯粹为公益组织发起募捐或以发起类似“资助奖学金”、“资助我去旅游”等为满足发起人个人需求之目的筹款。<br>',
                '6.项目内容须符合法律法规及创新学堂网站的相关规定；创新学堂有权对项目提出特殊要求。<br>',
                '7.以下项目内容或相关项目信息不允许在本平台发布：<br>',
                '7.1违反国家法律规定的违禁品，如毒品、枪支弹药及管制刀具相关；<br>',
                '7.2色情、赌博、暴力、恐怖、反动、政治与宗教相关；<br>',
                '7.3彩票、博彩相关；<br>',
                '7.4开办公司、网站、店铺等相关；<br>',
                '7.5其他国家法律规定和创新学堂网站规定的禁限售等违禁品信息。<br>',
                '8.发起人授权创新学堂自行选择并决定其他线上平台和线下门店展示融资项目信息。<br>',

                '<h4>第五条发起人资格</h4><br>',

                '1.发起人应为创新学堂平台的注册用户，并且仅支持公众号、项目号用户发布。<br>',

                '<h4>第六条发起人行为规范</h4><br>',

                '1.发起人应提交真实、准确的项目信息（项目信息如有任何更新，应及时向创新学堂众创平台融资提交更新后的信息），并自主上传、发布项目。发起人应妥善保管创新学堂的账号和密码，任何情况下发起人须对在该账号下发生的所有活动（包括但不限于信息披露、发布信息、上传图片或视频、网上点击同意或提交各类规则协议等）承担法律责任。<br>',
                '2.发起人授权创新学堂及创新学堂的关联公司在创新学堂网站及创新学堂关联公司的其他官方网站及线下媒体出于宣传创新学堂的目的而进行永久的免费宣传、推广、使用项目信息；并授权创新学堂就其项目信息推广与第三方进行合作，由创新学堂为推广提供信息撮合、技术支持等居间服务。项目信息非发起人原创的，发起人承诺已就前述授权取得权利人同意。<br>',
                '3.发起人应自行承担准备或发布、完成项目而发生的费用，自行缴纳因从事本协议项下行为而产生的相应税款。<br>',
                '4.项目开始融资后，发起人除非存在保护支持者利益等特殊理由，否则不得修改项目页面的实质内容。<br>',
                '5.发起人不得在项目发起、中期宣传、后期回报发放等任何阶段，在项目页面、推广宣传和发放回报中，使用任何其他平台或与其他平台标识相混淆的标识，该标识包括但不限于其他平台及平台商家的名称、商标、专属符号和图像、二维码、包装、装潢。<br>',
                '6.发起人了解并同意，不得从事任何违反法律法规或侵犯任何第三方权利的行为，包含但不限于不得自行或允许任何第三方使用发起人的账号通过创新学堂众创平台融资从事与下述相关的行为或发布与下述相关的信息：<br>',
                '6.1侵犯任何第三方的专利、商标、著作权、商业秘密或其他合法权利，或违反任何法律或合同的；<br>',
                '6.2发起人的行为或项目信息是虚假的、误导性的、不准确的；<br>',
                '6.3发起人的行为或项目信息涉嫌非法、威胁、辱骂、骚扰、诽谤、中伤、欺骗、欺诈、侵权、淫秽、冒犯、亵渎或侵犯他人隐私的；<br>',
                '6.4未经接收方允许而向接收方发布任何邮件、宣传材料或广告信息；<br>',
                '6.5进行任何危害信息网络安全的行为，故意传播恶意程序或病毒以及其他破坏、干扰正常网络信息服务的行为。<br>',
                '7.对于发起人通过创新学堂众创平台融资发布的涉嫌违法或涉嫌侵犯他人合法权利或违反本协议的信息，创新学堂有权依据创新学堂的判断不经通知发起人即予以修改、编辑、删除等。<br>',
                '8.发起人违反上述行为规范对任意第三方造成损害的，发起人均应当以自己的名义独立承担所有的法律责任，并应确保创新学堂免于因此产生损失或增加费用。<br>',
                '9.创新学堂不对融资项目的回报质量进行任何的担保，若支持者因回报质量问题与发起人产生的纠纷，创新学堂不承担连带责任，发起人应与支持者友好协商并妥善处理。<br>',
                '10.发起人应当尽其最大可能进行纠纷处理。<br>',

                '<h4>第七条违规处理和违约责任</h4><br>',

                '1.对于违反本协议或创新学堂网站规则的发起人，创新学堂有权对是否涉嫌违规做出单方认定，并根据单方认定结果中止、终止对发起人的使用许可或采取其他限制措施。<br>',
                '2.发起人严重违反本协议、创新学堂网站规则或违反国家法律法规规定的，创新学堂将终止与发起人在现阶段和未来的一切合作，涉嫌犯罪的创新学堂将移送司法机关处理。<br>',
                '3.发起人涉嫌违反有关法律或者本协议之约定，使创新学堂及/或创新学堂的关联公司遭受任何损失，或受到任何第三方的索赔，或受到任何行政管理部门的处罚，发起人应当赔偿创新学堂因此遭受的损失及/或发生的费用，包括但不限于创新学堂对终端客户的赔偿、行政罚款、为避免损失扩大的支出费用如律师费、交通费、工作人员薪资、名誉损失及创新学堂为主张这些权利而发生的全部费用。<br>',
                '4.除本协议另有约定外，任何一方违反其于本协议项下的陈述、保证或承诺，而使另一方遭受任何诉讼、纠纷、索赔、处罚等的，违约方应负责解决，使另一方发生任何费用、额外责任或遭受经济损失的，应当负责赔偿。如一方发生违约行为，守约方可以书面通知方式要求违约方在指定的时限内停止违约行为，要求其消除影响。<br>',
                '<h4>第八条知识产权</h4><br>',

                '1.发起人承诺通过创新学堂众创平台融资发布、上传的所有内容拥有合法权利，不侵犯任何第三方的肖像权、隐私权、专利权、商标权、著作权等合法权利及其他合同权利。<br>',
                '2.发起人通过创新学堂众创平台融资发布、上传的任何内容，发起人授予创新学堂及其关联公司非独家的、可转授权的、不可撤销的、全球通用的、永久的、免费的许可使用权利，并可对上述内容进行修改、改写、改编、发行、翻译、创造衍生性内容及/或可以将前述部分或全部内容加以传播、表演、展示，及/或可以将前述部分或全部内容放入任何现在已知和未来开发出的以任何形式、媒体或科技承载的作品当中。<br>',
                '3.创新学堂向发起人提供的服务含有受到相关知识产权及其他法律保护的专有保密资料或信息，亦可能受到著作权、商标、专利等相关法律的保护。未经创新学堂或相关权利人书面授权，发起人不得修改、出售、传播部分或全部该等信息，或加以制作衍生服务或软件，或通过进行还原工程、反向组译及其他方式破译原代码。<br>',

                '<h4>第九条协议终止及争议解决</h4><br>',

                '1.在下列情况下，创新学堂可以随时无须承担任何义务和责任地全部或部分中止或终止履行本协议的义务或提供本协议项下的服务，直至解除本协议，且无须征得发起人的同意。<br>',
                '1.1发起的项目违反法律法规、监管政策或其他规定；<br>',
                '1.2发起的项目将引发或可能引发创新学堂运营的重大风险；<br>',
                '1.3发起的项目存在或可能存在明显危害支持者利益的风险；<br>',
                '2.如发起人在线签署的《创新学堂用户注册协议》因任何原因终止，则本协议将同时终止。<br>',
                '3.因不可归责于创新学堂的原因造成协议终止，在协议终止前的行为所导致的任何赔偿和责任，发起人必须完全且独立地承担责任。<br>',
                '4.无论本协议因何种原因终止，并不影响本协议终止前已经筹款成功项目的效力，发起人均应将筹款成功的项目履行完毕，或依照约定或本协议的规定对支持者承担责任。<br>',
                '5.本协议及本协议项下的所有行为均适用中华人民共和国法律。<br>',
                '6.协议双方因本协议的签订、履行或解释发生争议的，各方应努力友好协商解决。如协商不成，任何一方均应向创新学堂住所地有管辖权的人民法院起诉。',
                '</div>','</div>'].join('')).hide().enhanceWithin();
        }
        var $p = $.mobile.activePage;
        $p.append($dlg);
        $dlg.show();
        $p.find('#dialogPopMsg').hide()
        $p.find('.vChild .vBack').click(function(){
            $(this).parents('.vChild').hide();
            $p.find('.fullScreen.vChild').css({
                'min-height':($p.height())+'px'
            });
        });
    }
};