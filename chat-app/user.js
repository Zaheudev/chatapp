function User(ws, name, id, roomId, role){
    this.ws = ws;
    this.name = name;
    this.id = id;
    this.roomId = roomId;
    this.role = role;

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

    this.getRoomId = function(){
        return this.roomId;
    }

    this.getRole = function(){
        return this.role;
    }

    this.setRole = function(role){
        this.role = role;
    }
}

module.exports = User;