function CMenu(){
    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    var _aCardStartPos;
    var _cardW = 400;
    var _cardH = 180;

    var _oBg;
    var _oButPractice;
    var _oButOffline;
    var _oButOnline;
    var _oButTournament;
    var _oAudioToggle;
    var _oButCredits;
    var _oFade;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function(){
        // Background
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        // Card layout buttons
        var spacingX = 50;
        var spacingY = 40;
        var totalWidth = _cardW * 2 + spacingX;
        var totalHeight = _cardH * 2 + spacingY;
        // Center the first card horizontally and anchor the grid near the bottom
        var startX = (CANVAS_WIDTH - totalWidth) / 2 + _cardW / 2;
        var startY = CANVAS_HEIGHT - totalHeight - 100 + _cardH / 2;

        _aCardStartPos = [
            {x: startX, y: startY},
            {x: startX + _cardW + spacingX, y: startY},
            {x: startX, y: startY + _cardH + spacingY},
            {x: startX + _cardW + spacingX, y: startY + _cardH + spacingY}
        ];

        _oButPractice = this._createCardButton(_aCardStartPos[0].x, _aCardStartPos[0].y, "SOLO PRACTICE", this._onButPractice);
        _oButOffline = this._createCardButton(_aCardStartPos[1].x, _aCardStartPos[1].y, "1V1 OFFLINE", this._onButOffline);
        _oButOnline = this._createCardButton(_aCardStartPos[2].x, _aCardStartPos[2].y, "1V1 ONLINE", this._onButOnline);
        _oButTournament = this._createCardButton(_aCardStartPos[3].x, _aCardStartPos[3].y, "TOURNAMENTS", this._onButTournament);

        // Audio toggle
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2) - 10, y: (oSprite.height/2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        // Credits button
        var oSpriteCredits = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosCredits = {x: (oSpriteCredits.width/2) + 10, y: (oSpriteCredits.height/2) + 10};
        _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSpriteCredits, s_oStage);
        _oButCredits.addEventListener(ON_MOUSE_UP, this._onButCreditsRelease, this);

        // Fullscreen button
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            var oSpriteFullscreen = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosCredits.x + oSpriteFullscreen.width/2 + 10, y: _pStartPosCredits.y};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSpriteFullscreen, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        // Fade-in effect
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade)
            .to({alpha: 0}, 1000, createjs.Ease.cubicOut);

        // LocalStorage error panel
        if(!s_oLocalStorage.isUsed()){
            var oMsgBoxPanel = new CAreYouSurePanel();
            oMsgBoxPanel.changeMessage(TEXT_ERR_LS, -170);
            oMsgBoxPanel.setOneButton();
        }

        $("#canvas_upper_3d").css("pointer-events", "none");
        sizeHandler();
    };

    this._onExit = function(oCbCompleted){
        _oFade.on("click", function(){});
        _oFade.visible = true;
        createjs.Tween.get(_oFade)
            .to({alpha: 1}, 1000, createjs.Ease.cubicOut)
            .call(oCbCompleted);
    };

    this.unload = function(){
        _oButCredits.unload();
        _oButPractice.removeAllEventListeners();
        _oButOffline.removeAllEventListeners();
        _oButOnline.removeAllEventListeners();
        _oButTournament.removeAllEventListeners();
        s_oStage.removeChild(_oButPractice);
        s_oStage.removeChild(_oButOffline);
        s_oStage.removeChild(_oButOnline);
        s_oStage.removeChild(_oButTournament);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }

        _oFade.removeAllEventListeners();
        s_oStage.removeAllChildren();
        s_oMenu = null;
    };

    this.refreshButtonPos = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX, s_iOffsetY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        }
        _oButCredits.setPosition(_pStartPosCredits.x + s_iOffsetX, _pStartPosCredits.y + s_iOffsetY);
    var aCards = [_oButPractice, _oButOffline, _oButOnline, _oButTournament];
    for (var i = 0; i < _aCardStartPos.length; i++) {
        aCards[i].x = _aCardStartPos[i].x + s_iOffsetX;
        aCards[i].y = _aCardStartPos[i].y + s_iOffsetY;
    }
    };

    this._createCardButton = function(iX, iY, szLabel, cb){
        var oContainer = new createjs.Container();
        oContainer.x = iX;
        oContainer.y = iY;
        oContainer.regX = _cardW / 2;
        oContainer.regY = _cardH / 2;

        var oBg = new createjs.Shape();
        oBg.graphics.beginFill('#1e1e1e').drawRoundRect(-_cardW/2, -_cardH/2, _cardW, _cardH, 20);

        var oText = new createjs.Text(szLabel, '40px ' + FONT_GAME, '#fff');
        oText.textAlign = 'center';
        oText.textBaseline = 'middle';

        oContainer.addChild(oBg, oText);
        oContainer.cursor = 'pointer';
        oContainer.on('mousedown', function(){ oContainer.scaleX = oContainer.scaleY = 0.95; });
        oContainer.on('pressup', function(){ oContainer.scaleX = oContainer.scaleY = 1; playSound('click',1,false); cb.call(s_oMenu); });

        s_oStage.addChild(oContainer);
        return oContainer;
    };

    this._onButPractice = function(){
        s_iPlayerMode = PLAYER_MODE_PRACTICE;
        s_iGameMode = GAME_MODE_EIGHT;
        this._onExit(function(){
            s_oMenu.unload();
            s_oMain.gotoGame();
            $(s_oMain).trigger("start_session");
        });
    };

    this._onButOffline = function(){
        s_iPlayerMode = PLAYER_MODE_TWO;
        s_iGameMode = GAME_MODE_EIGHT;
        this._onExit(function(){
            s_oMenu.unload();
            s_oMain.gotoGame();
            $(s_oMain).trigger("start_session");
        });
    };

    this._onButOnline = function(){
        alert("Online mode coming soon!");
    };

    this._onButTournament = function(){
        alert("Tournament mode coming soon!");
    };

    this._onButCreditsRelease = function(){
        new CCreditsPanel();
    };

    this._onAudioToggle = function(bActive){
        s_bAudioActive = bActive;
        Howler.mute(!s_bAudioActive);
    };

    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) {
            _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }
        sizeHandler();
    };

    s_oMenu = this;
    this._init();
}

var s_oMenu = null;
