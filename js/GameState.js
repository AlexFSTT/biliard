function GameState(){
    var _iCurTurn;
    var _bSuitAssigned;
    var _aSuitePlayer;
    var _iScore;
    var _iWinStreak;

    this.reset = function(){
        _iCurTurn = 1;
        _bSuitAssigned = false;
        _aSuitePlayer = [];
        _iScore = 0;
        _iWinStreak = 0;
    };

    this.changeTurn = function(){
        _iCurTurn = _iCurTurn === 1 ? 2 : 1;
    };

    this.assignSuits = function(iBallNumber){
        _aSuitePlayer = [];
        if(iBallNumber < 8){
            if(_iCurTurn === 1){
                _aSuitePlayer[0] = "solid";
                _aSuitePlayer[1] = "stripes";
            }else{
                _aSuitePlayer[0] = "stripes";
                _aSuitePlayer[1] = "solid";
            }
        }else{
            if(_iCurTurn === 1){
                _aSuitePlayer[0] = "stripes";
                _aSuitePlayer[1] = "solid";
            }else{
                _aSuitePlayer[0] = "solid";
                _aSuitePlayer[1] = "stripes";
            }
        }
        _bSuitAssigned = true;
    };

    this.isLegalShotFor8Ball = function(iBall, iNumBallToPot){
        if(_bSuitAssigned){
            if((_aSuitePlayer[_iCurTurn-1] === "solid") && (iBall < 8)){
                return true;
            }else{
                if((_aSuitePlayer[_iCurTurn-1] === "stripes") && (iBall > 8)){
                    return true;
                }else if((iBall === 8) && (iNumBallToPot === 0)){
                    return true;
                }else{
                    return false;
                }
            }
        }else{
            if(iBall !== 8){
                return true;
            }else{
                return false;
            }
        }
    };

    this.increaseWinStreak = function(){
        _iWinStreak++;
    };

    this.resetWinStreak = function(){
        _iWinStreak = 0;
    };

    this.updateScore = function(iVal){
        var iNewScore = _iScore + iVal;
        _iScore = iNewScore < 0 ? 0 : iNewScore;
    };

    this.getScore = function(){
        return _iScore;
    };

    this.getCurTurn = function(){
        return _iCurTurn;
    };

    this.getNextTurn = function(){
        return _iCurTurn === 1 ? 2 : 1;
    };

    this.getSuitForCurPlayer = function(){
        return _aSuitePlayer[_iCurTurn-1];
    };

    this.getSuitForPlayer = function(iPlayer){
        return _aSuitePlayer[iPlayer-1];
    };

    this.isSuitAssigned = function(){
        return _bSuitAssigned;
    };

    this.toJSON = function(){
        return {
            curTurn: _iCurTurn,
            suitAssigned: _bSuitAssigned,
            suites: _aSuitePlayer,
            score: _iScore,
            winStreak: _iWinStreak
        };
    };

    this.applyAction = function(oAction){
        switch(oAction.type){
            case "changeTurn":
                this.changeTurn();
                break;
            case "assignSuits":
                this.assignSuits(oAction.ball);
                break;
            case "updateScore":
                this.updateScore(oAction.value);
                break;
            case "reset":
                this.reset();
                break;
        }
    };

    this.reset();
}
