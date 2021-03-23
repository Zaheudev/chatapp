function User(ws, name){
    this.ws = ws;
    this.name = name;

    this.getWs = function(){
        return this.ws;    
    }

    this.getName = function(){
        return this.name;
    }
}

module.exports = User;