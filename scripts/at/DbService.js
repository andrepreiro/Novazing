
var DbService = function () {
    this.initialized = false;
    this.withSamples = false;
};

DbService.prototype.init = function(callback) {
    if (!this.initialized) {
        this.initialized = true;
        var db = new ATDbContext(this.withSamples);
        try {
            db.init(callback);
        } catch(ex) {
            alert(ex);
        }
    } else {
        callback();
    }
};

DbService.prototype.saveTarget = function(target, callback) {
    var db = new ATDbContext();
    target.updateYear();
    if (target.id == 0) {
        db.targets.add(target);
    } else {
        db.targets.update(target);
    }
    db.saveChanges(callback);
};

DbService.prototype.getTarget = function(id, callback) {
    return new ATDbContext().targets.where("id=" + id).toArray(function(items) {
        return callback(items.firstOrDefault());
    });
};

DbService.prototype.deleteTarget = function(id, callback) {
    this.getTarget(id, function(toDelete) {
        var db = new ATDbContext();
        db.targets.remove(toDelete);
        db.saveChanges(callback);
    });
};

DbService.prototype.addComplete = function(targetId, callback) {
    this.getTarget(targetId, function(target) {
        var db = new ATDbContext();
        target.complete += 1;
        db.targets.update(target);
        db.saveChanges(callback);
    });
};

DbService.prototype.getCurrentYearTargets = function(callback) {
    var year = new Date().getFullYear();
    this.getYearTargets(year, callback);
};

DbService.prototype.getYearTargets = function(year, callback) {
    var db = new ATDbContext();
    db.targets.where("year=" + year).toArray(function(items) {
        return callback(items.orderBy("displayOrder"));
    });
};

DbService.prototype.getAllTargetYears = function(callback){
	var db = new ATDbContext();
	db.targets.toArray(function (items) {
	    return callback(items.orderBy("year").groupBy("year"));
    });
};

