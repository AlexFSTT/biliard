function CDifficutlyMenu() {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFullscreen;

    var _oBg;

    var _oAudioToggle;
    var _oButExit;
    var _oFade;
    var _oButFullscreen;

    var _oButEasy;
    var _oButMedium;
    var _oButHard;

    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');
        if (!oSpriteExit) {
            console.error("Missing sprite: but_exit");
            return;
        }

        _pStartPosExit = { x: CANVAS_WIDTH - (oSpriteExit.width / 2) - 10, y: 10 };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_DOWN, this._onMouseDownButExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _pStartPosAudio = { x: _pStartPosExit.x - (oSprite.width / 2) - 10, y: _pStartPosExit.y };
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled) {
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = { x: (oSprite.width / 4) + 10, y: (oSprite.height / 2) + 10 };
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        var iOffsetY = 200;

        var pStartButEasy = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - iOffsetY };
        _oButEasy = new CTextButton(pStartButEasy.x, pStartButEasy.y, s_oSpriteLibrary.getSprite('but_text'), TEXT_EASY, FONT_GAME, "#fff", 60, "center", s_oStage);
        _oButEasy.setTextOffsetX(10);
        _oButEasy.setTextOffsetY(10);
        _oButEasy.addEventListenerWithParams(ON_MOUSE_DOWN, this._onPressDownButDifficulty, this, EASY);

        var pStartButMedium = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
        _oButMedium = new CTextButton(pStartButMedium.x, pStartButMedium.y, s_oSpriteLibrary.getSprite('but_text'), TEXT_MEDIUM, FONT_GAME, "#fff", 60, "center", s_oStage);
        _oButMedium.setTextOffsetX(10);
        _oButMedium.setTextOffsetY(10);
        _oButMedium.addEventListenerWithParams(ON_MOUSE_DOWN, this._onPressDownButDifficulty, this, MEDIUM);

        var pStartButHard = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + iOffsetY };
        _oButHard = new CTextButton(pStartButHard.x, pStartButHard.y, s_oSpriteLibrary.getSprite('but_text'), TEXT_HARD, FONT_GAME, "#fff", 60, "center", s_oStage);
        _oButHard.setTextOffsetX(10);
        _oButHard.setTextOffsetY(10);
        _oButHard.addEventListenerWithParams(ON_MOUSE_DOWN, this._onPressDownButDifficulty, this, HARD);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({ alpha: 0 }, 1000, createjs.Ease.cubicOut);

        sizeHandler();

        _oButEasy.changeText(TEXT_EASY);
        _oButMedium.changeText(TEXT_MEDIUM);
        _oButHard.changeText(TEXT_HARD);
    };

    this._onPressDownButDifficulty = function (iDifficultyChoose) {
        s_iGameDifficulty = iDifficultyChoose;
        this._onExit(function () {
            s_oDifficultyMenu.unload();
            s_oMain.gotoGame();
            $(s_oMain).trigger("start_session");
        });
    };

    this._onMouseDownButExit = function () {
        this._onExit(function () {
            s_oDifficultyMenu.unload();
            s_oMain.gotoMenu();
        });
    };

    this._onExit = function (oCbCompleted) {
        _oFade.on("click", function () { });
        _oFade.visible = true;
        createjs.Tween.get(_oFade).to({ alpha: 1 }, 1000, createjs.Ease.cubicOut).call(oCbCompleted);
    };

    this.unload = function () {
        _oButEasy.unload();
        _oButMedium.unload();
        _oButHard.unload();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            if (_oAudioToggle) {
                _oAudioToggle.unload();
                _oAudioToggle = null;
            }
        }

        if (_fRequestFullScreen && screenfull.isEnabled && _oButFullscreen) {
            _oButFullscreen.unload();
        }

        _oFade.removeAllEventListeners();
        s_oStage.removeAllChildren();
        s_oDifficultyMenu = null;
    };

    this.refreshButtonPos = function () {
        if (_oAudioToggle) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX, s_iOffsetY + _pStartPosAudio.y);
        }

        if (_fRequestFullScreen && screenfull.isEnabled && _oButFullscreen) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        }

        if (_oButExit) {
            _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX, _pStartPosExit.y + s_iOffsetY);
        }
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this.resetFullscreenBut = function () {
        if (_fRequestFullScreen && screenfull.isEnabled && _oButFullscreen) {
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onFullscreenRelease = function () {
        if (s_bFullscreen) {
            _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }

        sizeHandler();
    };

    s_oDifficultyMenu = this;
    this._init();
}

var s_oDifficultyMenu = null;