function Room(host, slots, code, acces){
    this.users = new Array();
    this.code = code;
    this.host = host;
    this.slots = slots;
    this.acces = acces;
    this.users.push(this.host);

    this.addUserToRoom = function(user){
        this.users.push(user);
    }

    this.getAvailableSlots = function(){
        return this.getSlots() - this.getUsers().length;
    }

    this.getSlotsFormat = function(){
        return this.getUsers().length + "/" + this.getSlots();  
    }

    this.getAccesFormat = function(){
        return this.acces ? "public" : "private";
    }

    this.getCode = function(){
        return this.code;
    }

    this.getHost = function(){
        return this.host;
    }

    this.getSlots = function(){
        return this.slots;
    }

    this.getUsers = function(){
        return this.users;
    }

    this.getAcces = function(){
        return this.acces
    }

    this.setAcces = function(boolean){
        this.acces = boolean;
    }
}

module.exports = Room;