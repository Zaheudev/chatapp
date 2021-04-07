function User(ws, name, id, roomId){
    this.ws = ws;
    this.name = name;
    this.id = id;
    this.roomId = roomId;

    this.getWs = function(){
        return this.ws;    
    }

    this.setWs = function(ws){
        this.ws = ws;
    }

    this.getName = function(){
        return this.name;
    }

    this.getId = function(){
        return this.id;
    }

    this.getId = function(){
        return this.roomId;
    }
}

module.exports = User;