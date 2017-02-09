/**
 * Created by lchysh on 2014/8/28.
 */
// ▲★◆◇→＾♀♂□●○★☆№■※□◇―￣＼＠＃○＿＾■№△§§△→→←＿＿＿
validCardJs = {
    _cardIssuers:[{"issuer":"JCB","IINs":"3528-3589","IIN_length":4,"cardLength":"16","validMethod":"luhn"},{"issuer":"VISA_ELECTRON","IINs":"4026,417500,4508,4844,4913,4917","IIN_length":4,"cardLength":"16","validMethod":"luhn"},{"issuer":"DINERS_CLUB_ENROUTE","IINs":"2014,2149","IIN_length":4,"cardLength":"15","validMethod":"no validation"},{"issuer":"DISCOVER_CARD","IINs":"6011,622126-622925,644-649,65","IIN_length":4,"cardLength":"16","validMethod":"luhn"},{"issuer":"BANKCARD","IINs":"5610,560221-560225","IIN_length":4,"cardLength":"16","validMethod":"luhn"},{"issuer":"SWITCH","IINs":"4903,4905,4911,4936,564182,633110,6333,6759","IIN_length":4,"cardLength":"16,18,19","validMethod":"luhn"},{"issuer":"LASER","IINs":"6304,6706,6771,6709","IIN_length":4,"cardLength":"16-19","validMethod":"luhn"},{"issuer":"MAESTRO","IINs":"5018,5020,5038,6304,6759,6761,6762,6763","IIN_length":4,"cardLength":"12-19","validMethod":"luhn"},{"issuer":"SOLO","IINs":"6334,6767","IIN_length":4,"cardLength":"16,18,19","validMethod":"luhn"},{"issuer":"DINERS_CLUB_CARTE_BLANCHE","IINs":"300-305","IIN_length":3,"cardLength":"14","validMethod":"luhn"},{"issuer":"INSTAPAYMENT","IINs":"637-639","IIN_length":3,"cardLength":"16","validMethod":"luhn"},{"issuer":"AMERICAN_EXPRESS","IINs":"34,37","IIN_length":2,"cardLength":"15","validMethod":"luhn"},{"issuer":"MASTERCARD","IINs":"51-55","IIN_length":2,"cardLength":"16","validMethod":"luhn"},{"issuer":"CHINA_UNIONPAY","IINs":"62","IIN_length":2,"cardLength":"16-19","validMethod":"no validation"},{"issuer":"DINERS_CLUB_INTERNATIONAL","IINs":"36","IIN_length":2,"cardLength":"14","validMethod":"luhn"},{"issuer":"DINERS_CLUB_UNITED_STATES_&_CANADA","IINs":"54,55","IIN_length":2,"cardLength":"16","validMethod":"luhn"},{"issuer":"VISA","IINs":"4","IIN_length":1,"cardLength":"13,16","validMethod":"luhn"}],
    valid:function(cardId){
        var cardId = $.trim(cardId);
        var me = validCardJs;
        var issuers = me._cardIssuers;
        var ret = false;
        var issuerCount = 0;
        $.each(issuers, function(index, issuer){
            var tmpRet = false;
            ret = me._validITN(issuer.IINs, cardId);
            if(ret){
                issuerCount++;
            }
            if(ret){
                ret = me._validLength(issuer.cardLength, cardId);
                if(!ret){
                    console.log(['银行卡格式长度不正确 ','发行者:',issuer.issuer,'长度要求：',issuer.cardLength,'银行卡：',cardId].join('  '));
                }
            }
            if(ret){
                if(ret.validMethod == 'luhn'){
                    if(cardId.search(/\D/)> -1){
                        ret =  false;
                        console.log(['银行卡格式不正确 ','发行者:',issuer.issuer,'验证方式 Luhn算法 要求数字','银行卡：',cardId].join('  '));
                    } else {
                        ret = me._chkLuhn(cardId);
                        if(!ret){
                            console.log(['银行卡格式不正确 ','发行者:',issuer.issuer,'验证方式 Luhn算法','银行卡：',cardId].join('  '));
                        }
                    }
                } else {
                    console.log(['银行卡格式正确 ','发行者:',issuer.issuer,'无验证算法','银行卡：',cardId].join('  '));
                }
            }
            if(ret){
                return false;
            }
        });
        if(!ret){
            console.log(['银行卡格式不正确 ','找到符合格式发行者数量:',issuerCount,'银行卡：',cardId].join('  '));
        }
        return ret;
    },_chkLuhn:function(cardId){
        var ret = false;
        var arr = cardId.split('').reverse();
        var sum = 0;
        $.each(function(index, strNum){
            var num;
            if(index%2 == 1){
                num = Number(strNum)*2;
                if(num > 9){
                    num = (num -10) + Math.floor(num/10)
                }
            }
            sum += num;
        });
        ret = 10 - sum%10 == arr[0];
        return ret;
    },_validLength:function(length, cardId){
        return this._validBasic(length, cardId.length);
    },_validITN:function(IINs, cardId){
       return this._validBasic(IINs, cardId, true);
    },_validBasic:function(validStrs, strVal, bPre){
        var ret = false;
        $.each(validStrs.split(','), function(index, validStr){
            var arr = validStr.split('-');
            var l = arr.length;
            var sValidStr = arr[0]+'';
            var chkVal = Number(bPre ? strVal.substring(0, sValidStr.length) : strVal);
            if(l == 1){
                if(chkVal == sValidStr){
                    ret = true;
                    return false;
                }
            } else {
                var min = Number(sValidStr);
                var max = Number(arr[1]);
                if(chkVal >= min && chkVal <= max){
                    ret = true;
                    return false;
                }
            }
        });
        return ret;
    }
};