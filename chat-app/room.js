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

    this.removeUser = function(user){
        for(i=0; i <= this.users.length; i++){
            if(user === this.users[i]){
                this.users.splice(i, 1);
            }
        }
    }

    this.getUser = function(name){
        this.users.forEach(e => {
            if(e.name === name){
                return e;
            }
        });
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

    this.setHost = function(host){
        this.host = host;
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