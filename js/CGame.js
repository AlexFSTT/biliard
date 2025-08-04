function CGame(){
    var _bUpdate = false;
    var _oGameState;
    
    var _oScenario;
    var _oGameOverPanel;
    var _oPlayer1;
    var _oPlayer2;
    var _oInterface;
    var _oTable;
    var _oContainerGame;
    var _oBg;
    var _oContainerTable;
    var _oContainerInterface;
    
    var _oInteractiveHelp;
    
    var _oContainerInputController;
    var _oInputController;
    var _oShotPowerBar;
    var _oContainerShotPowerBar;
    var _oCointainerShotPowerBarInput;
    var _bHoldStickCommand;
    var _iDirStickCommand;
    var _iDirStickSpeedCommand;
    var _aPottedBallsBeforeAssign;
    var _iTurnTime;
    var _oTimerText;
    var _oTurnTimerInterval;
    
    this._init = function(){
        _oGameState = new GameState();
        _bHoldStickCommand = false;
        _iDirStickCommand = 1;
        _iDirStickSpeedCommand = COMMAND_STICK_START_SPEED;
        _aPottedBallsBeforeAssign = _oGameState.getPottedBallsBeforeAssign();
        
        switch(s_iGameMode) {
            case GAME_MODE_NINE: {
                    BALL_NUMBER = 9;
                    break;
            }
            case GAME_MODE_EIGHT: {
                    BALL_NUMBER = 15;
                    break;
            }
            case GAME_MODE_TIME: {
                    BALL_NUMBER = 15;
                    break;
            }
        }
        
        RACK_POS = STARTING_RACK_POS[s_iGameMode];
        
        _oContainerGame = new createjs.Container();
        s_oStage.addChild(_oContainerGame);

        var oSpriteBg = s_oSpriteLibrary.getSprite("bg_game");
        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width/2;
        _oBg.regY = oSpriteBg.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        _oContainerGame.addChild(_oBg);

        _oContainerTable = new createjs.Container();
        _oContainerGame.addChild(_oContainerTable);
        
        _oContainerInterface = new createjs.Container();
        s_oStage.addChild(_oContainerInterface);
        
        _oInterface = new CInterface(_oContainerInterface);
        _oScenario = new CScene();

        _oTable = new CTable(_oContainerTable);
        _oTable.addEventListener(ON_LOST,this.gameOver,this);
        _oTable.addEventListener(ON_WON,this.showWinPanel,this);
        
        var iY = 40;
        
        _oPlayer1  = new CPlayerGUI(CANVAS_WIDTH/2 - 400, iY,TEXT_PLAYER1,s_oStage);
        _oPlayer2  = new CPlayerGUI(CANVAS_WIDTH/2 + 400, iY,TEXT_PLAYER2,s_oStage);

        if (_oGameState.getCurTurn() === 1) {
                _oPlayer1.highlight();
                _oPlayer2.unlight();
        }else {
                _oPlayer2.highlight();
                _oPlayer1.unlight();
        }

        _oTimerText = new CTLText(s_oStage,
                    CANVAS_WIDTH/2 - 50, iY, 100, 40,
                    30, "center", "#fff", FONT_GAME, 1,
                    0, 0,
                    "20",
                    true, true, false,
                    false );
        
        if(s_iGameMode === GAME_MODE_NINE){
            this.setNextBallToHit(1);
        }
        
        _oContainerInputController = new createjs.Container();
        s_oStage.addChild(_oContainerInputController);
        
        _oInputController = new CInputController(_oContainerInputController);
        _oInputController.addEventListener(ON_PRESS_DOWN_BUT_ARROW_LEFT, this._onPressDownStickCommand, this, -1);
        _oInputController.addEventListener(ON_PRESS_UP_BUT_ARROW_LEFT, this._onPressUpStickCommand, this);
        
        _oInputController.addEventListener(ON_PRESS_DOWN_BUT_ARROW_RIGHT, this._onPressDownStickCommand, this, 1);
        _oInputController.addEventListener(ON_PRESS_UP_BUT_ARROW_RIGHT, this._onPressUpStickCommand, this);
    
        _oContainerShotPowerBar = new createjs.Container();
        s_oStageUpper3D.addChild(_oContainerShotPowerBar);
        
        _oCointainerShotPowerBarInput = new createjs.Container();
        s_oStage.addChild(_oCointainerShotPowerBarInput);
        
        if(s_bMobile){
            _oShotPowerBar = new CShotPowerBar(_oContainerShotPowerBar, 123, 260, _oCointainerShotPowerBarInput);

            //_oShotPowerBar.hide(0);
        }
        
        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); 
        s_oStageUpper3D.addChild(oFade);
        
        tweenVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME, 1000);
        
        _oGameOverPanel = new CGameOverPanel(s_oStageUpper3D);
        _oGameOverPanel.addEventListener(ON_EXIT_GAME,this.onExit,this);
        _oGameOverPanel.addEventListener(ON_RESTART,this.restartGame,this);
   
        //s_oGame.gameOver( sprintf(TEXT_PLAYER_NAME_WON,  s_oGame.getPlayer2Name()), 9999);
        
        _oInteractiveHelp = null;
        if(s_bInteractiveHelp){
            _oInteractiveHelp = new CInteractiveHelp(s_oStageUpper3D);
            _oInteractiveHelp.addEventListener(ON_END_TUTORIAL, this._onEndTutorial,this);
            $("#canvas_upper_3d").css("pointer-events", "initial");
            s_bInteractiveHelp = false;
        }else{
            this._onEndTutorial();
        }
                
        createjs.Tween.get(oFade)
                       .to({alpha:0}, 1000, createjs.Ease.cubicIn)
                       .call(function(){
                           s_oStageUpper3D.removeChild(oFade);
                           s_oGame._startInteractiveHelp();
                       });  
        
        this.refreshButtonPos();
        
        sizeHandler();
        createjs.Tween.get(_oScenario).wait(s_iTimeElaps).call( _oScenario.update, null, _oScenario);
    };
    
    this._startInteractiveHelp = function(){
         if(!_oInteractiveHelp){
             return;
         }
         
        if(s_bMobile){
            _oInteractiveHelp.startTutorial({
                                                tutorial: TUTORIAL_MOVE_STICK_MOBILE,
                                                info: {
                                                        movement: false,
                                                        on_show_tutorial: undefined
                                                      }
                                            });
            _oInteractiveHelp.startTutorial({
                                                tutorial:  TUTORIAL_SHOT_MOBILE,
                                                info: {
                                                        movement: false,
                                                        on_show_tutorial: undefined,
                                                        param: _oShotPowerBar
                                                      }
                                            });
            _oInteractiveHelp.startTutorial({
                                                tutorial: TUTORIAL_MOVE_STICK_BUTTONS,
                                                info: {
                                                        movement: false,
                                                        on_show_tutorial: undefined
                                                      }
                                            });
        }else{
            _oInteractiveHelp.startTutorial({
                                                tutorial: TUTORIAL_SHOT_DESKTOP,
                                                info: {
                                                        movement: false,
                                                        on_show_tutorial: undefined,
                                                        param: _oShotPowerBar
                                                      }
                                            });
        }  
        
        _oInteractiveHelp.startTutorial({
                                            tutorial: TUTORIAL_CUE_EFFECT,
                                            info: {
                                                    movement: false,
                                                    on_show_tutorial: undefined
                                                  }
                                        });
                                        
        _oInteractiveHelp.startTutorial({
                                            tutorial: TUTORIAL_RESPOT_CUE,
                                            info: {
                                                    movement: false,
                                                    on_show_tutorial: undefined
                                                  }
                                        });
    };
    
    this._onMouseDownPowerBar = function(){
  
        s_oTable.startToShot();
    };
    
    this._onPressMovePowerBar = function(iOffset){

        
        s_oTable.holdShotStickMovement(iOffset);
    };
    
    this._onPressUpPowerBar = function(){

        if(s_oTable.startStickAnimation()){
           _oShotPowerBar.setInput(false);
        }
    };
    
    this.hideShotBar = function(){
        if(s_bMobile){
            _oShotPowerBar.hide();
        }
    };

    this.showShotBar = function(){
        if(s_bMobile){
            _oShotPowerBar.show();
        }
        this.startTurnTimer();
    };

    this.startTurnTimer = function(){
        _iTurnTime = 20;
        if(!_oTimerText){
            return;
        }
        _oTimerText.refreshText(_iTurnTime);
        if(_oTurnTimerInterval){
            clearInterval(_oTurnTimerInterval);
        }
        _oTurnTimerInterval = setInterval(function(){
            _iTurnTime--;
            _oTimerText.refreshText(_iTurnTime);
            if(_iTurnTime <= 0){
                s_oGame.stopTurnTimer();
                s_oGame.changeTurn(false);
            }
        },1000);
    };

    this.stopTurnTimer = function(){
        if(_oTurnTimerInterval){
            clearInterval(_oTurnTimerInterval);
            _oTurnTimerInterval = null;
        }
    };

    this._onEndTutorial = function(){
        $("#canvas_upper_3d").css("pointer-events", "none");
        _bUpdate = true;
        
        if(s_bMobile){
            _oShotPowerBar.initEventListener();
            _oShotPowerBar.addEventListener(ON_MOUSE_DOWN_POWER_BAR, this._onMouseDownPowerBar, this);
            _oShotPowerBar.addEventListener(ON_PRESS_MOVE_POWER_BAR, this._onPressMovePowerBar, this);
            _oShotPowerBar.addEventListener(ON_PRESS_UP_POWER_BAR, this._onPressUpPowerBar, this);
            _oShotPowerBar.show();

        }

         if(_oInteractiveHelp){
            _oInteractiveHelp.unload();
            _oInteractiveHelp = null;
         }
        this.startTurnTimer();
    };
    
    this._onPressDownStickCommand = function(iDir){
        _iDirStickCommand = iDir;
        _bHoldStickCommand = true;
        _iDirStickSpeedCommand = COMMAND_STICK_START_SPEED ;
    };
    
    this._onPressUpStickCommand = function(){
        _bHoldStickCommand = false;
    };
    
    this.unload = function(oCbCompleted = null, oCbScope){
        _bUpdate = false;
        this.stopTurnTimer();

        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); 
        oFade.alpha = 0;
        s_oStageUpper3D.addChild(oFade);
        
        createjs.Tween.get(oFade)
                       .to({alpha:1}, 700, createjs.Ease.cubicIn)
                       .call(function(){
                            _oTable.unload();
                            _oInterface.unload();
                            _oScenario.unload();
                            _oGameOverPanel.unload();

                            s_oStageUpper3D.removeAllChildren();
                            s_oStage.removeAllChildren();
                            
                            if(oCbCompleted !== null){
                                oCbCompleted.call(oCbScope);
                            }
                       });  
    };
    
    this.reset = function(){
        _oGameState.reset();
    };
    
    this.refreshButtonPos = function(){
        _oBg.x = CANVAS_WIDTH/2 + s_iOffsetX;
        _oBg.y = CANVAS_HEIGHT/2 + s_iOffsetY;

        _oInterface.refreshButtonPos();
        _oPlayer1.refreshButtonPos();
        _oPlayer2.refreshButtonPos();
        _oInputController.refreshOffsetPos();

        _oCointainerShotPowerBarInput.x = _oContainerShotPowerBar.x = s_iOffsetX * 0.5;

        if(_oInteractiveHelp){
            _oInteractiveHelp.refreshButtonsPos();
        }
    };
    
    //set the lowest ball currently on the table in the player interface
    this.setNextBallToHit = function(iNextBall) {
        if (_oGameState.getCurTurn() === 1) {
                _oPlayer2.setBallVisible(false);
                _oPlayer1.setBall(iNextBall);
        }else {
                _oPlayer1.setBallVisible(false);
                _oPlayer2.setBall(iNextBall);
        }
    };
    
    //change player turn
    this.changeTurn = function(bFault) {
            _oGameState.changeTurn();

            if (_oGameState.getCurTurn() === 1) {
                    _oPlayer1.highlight();
                    _oPlayer2.unlight();
                    s_oGame.showShotBar();
            }else {
                    _oPlayer2.highlight();
                    _oPlayer1.unlight();
                    s_oGame.showShotBar();
            }
            s_oInterface.resetSpin();

            if(bFault){
                new CEffectText(TEXT_FAULT, s_oStageUpper3D);
            }else{
                new CEffectText(TEXT_CHANGE_TURN, s_oStageUpper3D);
            }
    };
    
    this.assignSuits = function(iBallNumber) {
        _oGameState.assignSuits(iBallNumber);
        this.setBallInInterface(_oGameState.getSuitForPlayer(1));

        for(var i=0; i<_aPottedBallsBeforeAssign.length; i++){
            this.ballPotted(_aPottedBallsBeforeAssign[i]);
        }
        _aPottedBallsBeforeAssign = [];
        _oGameState.clearPottedBallsBeforeAssign();
    };

    this.setBallInInterface = function(szSuites1) {
            if (szSuites1 == "solid") {
                    _oPlayer1.setBall(2);
                    _oPlayer2.setBall(15);
                    _oPlayer1.setSuit("solid");
                    _oPlayer2.setSuit("stripes");
            }else {
                    _oPlayer1.setBall(15);
                    _oPlayer2.setBall(2);
                    _oPlayer1.setSuit("stripes");
                    _oPlayer2.setSuit("solid");
            }
    };

    this.ballPotted = function(iBall){
        if(!_oGameState.isSuitAssigned()){
            _aPottedBallsBeforeAssign.push(iBall);
            _oGameState.addPottedBallBeforeAssign(iBall);
            return;
        }

        var szSuit1 = _oGameState.getSuitForPlayer(1);
        if ((szSuit1 === "solid" && iBall < 8) || (szSuit1 === "stripes" && iBall > 8)) {
            _oPlayer1.removeBall(iBall);
        } else if (iBall !== 8) {
            _oPlayer2.removeBall(iBall);
        }
    };
    
    this.isLegalShotFor8Ball = function(iBall,iNumBallToPot) {
        return _oGameState.isLegalShotFor8Ball(iBall, iNumBallToPot);
    };
    
    this.increaseWinStreak = function(){
            _oGameState.increaseWinStreak();
            //oWinStreak.text = "Win Streak: "+CAppBiliardo.m_iWinStreak;
    };

    this.resetWinStreak = function() {
        _oGameState.resetWinStreak();
        //oWinStreak.text = "Win Streak: "+_oGameState.toJSON().winStreak;
    };

    this.updateScore = function(iVal){
        _oGameState.updateScore(iVal);
    };
      
    this.gameOver = function(szText){
        _oGameOverPanel.show(szText);
        $("#canvas_upper_3d").css("pointer-events", "initial");
        _bUpdate = false;
    };
    
    this.showWinPanel = function(szText){
        _oGameOverPanel.show(szText);
        $("#canvas_upper_3d").css("pointer-events", "initial");
        _bUpdate = false;
    };
    
    this.onExit = function(){
        _oScenario.update();
        tweenVolume("soundtrack", SOUNDTRACK_VOLUME_DEFAULT, 1000);
        this.unload(s_oMain.gotoMenu, s_oMain);
        
	$(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
    };
    
    this.restartGame = function(){
       _oScenario.update();
       this.unload(s_oMain.gotoGame, s_oMain);
       
       $(s_oMain).trigger("show_interlevel_ad");
       $(s_oMain).trigger("end_session");
    };
    
    this.getCurTurn = function(){
        return _oGameState.getCurTurn();
    };

    this.getNextTurn = function() {
        return _oGameState.getNextTurn();
    };

    this.getSuiteForCurPlayer = function() {
        return _oGameState.getSuitForCurPlayer();
    };

    this.isSuiteAssigned  = function(){
        return _oGameState.isSuitAssigned();
    };
    
    this.getPlayer1Name = function(){
        return _oPlayer1.getPlayerName();
    };
    
    this.getPlayer2Name = function(){
        return _oPlayer2.getPlayerName();
    };

    this.getGameState = function(){
        return _oGameState;
    };

    this.toJSON = function(){
        return _oGameState.toJSON();
    };

    this.applyAction = function(oAction){
        _oGameState.applyAction(oAction);
    };
    
    this._updateInput = function(){
        if(!_bHoldStickCommand){
            return;
        }
        
        _oTable.rotateStick(_iDirStickCommand * _iDirStickSpeedCommand);
        _iDirStickSpeedCommand += COMMAND_STICK_SPEED_INCREMENT;
        
        if(_iDirStickSpeedCommand >= COMMAND_STICK_MAX_SPEED){
            _iDirStickSpeedCommand = COMMAND_STICK_MAX_SPEED;
        }
    };

    this.update = function(){
        //_oFpsText.refreshText(s_iCurFps+ " FPS")
        if(_bUpdate === false){
            return;
        }
        
        this._updateInput();
        
        _oTable.update();
        _oScenario.update();
    };
    
    s_oGame = this;

        
    this._init();
}

var s_oGame = null;
