function CMenu(){
    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    var _pStartPosButPractice;
    var _pStartPosButOffline;
    var _pStartPosButOnline;
    var _pStartPosButTournament;

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

        // Mode buttons
        var oSpriteBtn = s_oSpriteLibrary.getSprite('but_text');
        var iStartY = CANVAS_HEIGHT/2 - 150;

        _pStartPosButPractice = {x: CANVAS_WIDTH/2, y: iStartY};
        _oButPractice = new CTextButton(_pStartPosButPractice.x, _pStartPosButPractice.y, oSpriteBtn, "SOLO PRACTICE", FONT_GAME, "#fff", 40, "center", s_oStage);
        _oButPractice.addEventListener(ON_MOUSE_UP, this._onButPractice, this);

        _pStartPosButOffline = {x: CANVAS_WIDTH/2, y: iStartY + 90};
        _oButOffline = new CTextButton(_pStartPosButOffline.x, _pStartPosButOffline.y, oSpriteBtn, "1V1 OFFLINE", FONT_GAME, "#fff", 40, "center", s_oStage);
        _oButOffline.addEventListener(ON_MOUSE_UP, this._onButOffline, this);

        _pStartPosButOnline = {x: CANVAS_WIDTH/2, y: iStartY + 180};
        _oButOnline = new CTextButton(_pStartPosButOnline.x, _pStartPosButOnline.y, oSpriteBtn, "1V1 ONLINE", FONT_GAME, "#fff", 40, "center", s_oStage);
        _oButOnline.addEventListener(ON_MOUSE_UP, this._onButOnline, this);

        _pStartPosButTournament = {x: CANVAS_WIDTH/2, y: iStartY + 270};
        _oButTournament = new CTextButton(_pStartPosButTournament.x, _pStartPosButTournament.y, oSpriteBtn, "TOURNAMENTS", FONT_GAME, "#fff", 40, "center", s_oStage);
        _oButTournament.addEventListener(ON_MOUSE_UP, this._onButTournament, this);

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
        _oButPractice.unload();
        _oButOffline.unload();
        _oButOnline.unload();
        _oButTournament.unload();

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
        _oButPractice.setPosition(_pStartPosButPractice.x, _pStartPosButPractice.y - s_iOffsetY);
        _oButOffline.setPosition(_pStartPosButOffline.x, _pStartPosButOffline.y - s_iOffsetY);
        _oButOnline.setPosition(_pStartPosButOnline.x, _pStartPosButOnline.y - s_iOffsetY);
        _oButTournament.setPosition(_pStartPosButTournament.x, _pStartPosButTournament.y - s_iOffsetY);
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
