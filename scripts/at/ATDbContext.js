/* if you want to re-create the DB(due to schema changes, re-init sample data, etc.), 
change the version parameter on line:
    nova.data.DbContext.call(...);
*/
var ATDbContext = function (withSampleData) {
    nova.data.DbContext.call(this, "AnualTargetDB", "1.0005", "AnualTargetDB", 1000000);
    this.logSqls = true;
    this.alertErrors = true;
    this.withSampleData = withSampleData == undefined ? false : withSampleData;
    this.targets = new nova.data.Repository(this, Target, "targets");
};

ATDbContext.prototype = new nova.data.DbContext();
ATDbContext.constructor = ATDbContext;

ATDbContext.prototype.initData = function(callback) {
    var me = this;
    if (this.withSampleData == false) {
        nova.data.DbContext.prototype.initData.call(this, callback);
    }
    else {
        var year = new Date().getFullYear();
        var progress = new Date().getDaysTillNow(new Date(year, 0, 1)) / 365;

        var run = new Target();
        run.title = "Run";
        run.startDate = new Date(year, 0, 1);
        run.target = 300;
        run.complete = Math.round(300 * progress * 1.2);
        run.year = year;
        run.displayOrder = 1;
        me.targets.add(run);
        
        var blogPost = new Target();
        blogPost.title = "Blog Posts";
        blogPost.startDate = new Date(year, 0, 1);
        blogPost.target = 50;
        blogPost.complete = Math.round(50 * progress * 1.4);
        blogPost.year = year;
        blogPost.displayOrder = 2;
        me.targets.add(blogPost);

        var read = new Target();
        read.title = "Read Books";
        read.startDate = new Date(year, 0, 1);
        read.target = 10;
        read.complete = Math.round(10 * progress * 0.8);
        read.year = year;
        read.displayOrder = 3;
        me.targets.add(read);
        
        var travel = new Target();
        travel.title = "Travel Days";
        travel.startDate = new Date(year, 0, 1);
        travel.target = 16;
        travel.complete = Math.round(16 * progress * 1.3);
        travel.year = year;
        travel.displayOrder = 4;
        me.targets.add(travel);
        
        var income = new Target();
        income.title = "Income";
        income.startDate = new Date(year, 0, 1);
        income.target = 100000;
        income.complete = Math.round(100000 * progress * 0.8);
        income.year = year;
        income.displayOrder = 5;
        me.targets.add(income);
        
        var pushup = new Target();
        pushup.title = "Push-ups";
        pushup.startDate = new Date(year, 0, 1);
        pushup.target = 15000;
        pushup.complete = Math.round(15000 * progress * 0.7);
        pushup.year = year;
        pushup.displayOrder = 1;
        me.targets.add(pushup);
        
        function doCallback() {
            if (callback != undefined && callback != null) {
                callback();
            }
        }
        me.saveChanges(doCallback, doCallback);
    }
};

var Target = function () {
    nova.data.Entity.call(this);
    this.title = "";
    this.startDate = new Date();
    this.target = 0;
    this.complete = 0;
    this.year = 0;
    this.displayOrder = 0;
};

Target.prototype = new nova.data.Entity();
Target.constructor = Target;

Target.prototype.updateYear = function() {
    this.year = this.startDate.getFullYear();
};

Target.prototype.getTotalDays = function() {
    var date = new Date(this.startDate);
    date.setFullYear(this.startDate.getFullYear() + 1);
    date.setMonth(0);
    date.setDate(1);
    return this.startDate.getDaysUntil(date);
};

Target.prototype.updateFrom = function(target) {
    this.title = target.title;
    this.startDate = target.startDate;
    this.target = target.target;
    this.complete = target.complete;
    this.displayOrder = target.displayOrder;
    this.updateYear();
};

Target.prototype.getProgressPercent = function() {
    return this.complete / this.target;
};

Target.prototype.getTodayProgressPercent = function() {
    var daysPast = this.getPastDays();
    var totalDays = this.getTotalDays();
    return daysPast / totalDays;
};

Target.prototype.getPastDays = function() {
    return this.startDate.getDaysUntil(new Date());
};