function Room(host, slots, id){
    this.users = new Array();
    this.id = id;
    this.host = host;
    this.slots = slots;
    this.users.push(this.host);

    this.addUserToRoom = function(user){
        this.users.push(user);
    }

    this.getId = function(){
        return this.id;
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
}

module.exports = Room;