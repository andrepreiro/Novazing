var atApp = nova.application;

atApp.service = null;

atApp.pages = {
    
};

atApp.pages.home = {
    init: function() {
        var me = this;
        if (atApp.currentYear == undefined) {
            atApp.currentYear = new Date().getFullYear();
        }
        var selectedYear = atApp.currentYear;
        $("#lblYear").html(selectedYear);
        atApp.service.getYearTargets(selectedYear, function(targets) {
            me.renderTargets(targets);
            me.bindDomEvents();
        });
    },
    renderTargets: function(targets) {
        if (targets.length == 0) {
            $(".content-w1").html("<p class='target-empty'>No target was found. Click M(enu) to add some.</p>");
        } else {
            var html = "";
            targets.each(function() {
                html +=
                    '<li id="' + this.id + '">\
                        <div class="target-title">' + this.title + ':</div>\
                        <div class="target">\
                            <div class="progress" style="width:' + Number.getPercentage(this.getProgressPercent()) + '"></div>\
                            <div class="progress-today" style="width:' + Number.getPercentage(this.getTodayProgressPercent()) + '"></div>\
                            <div class="target-values">\
                                <span class="progress-percent">' + Number.getPercentage(this.getProgressPercent(), 1) + '</span>\
                            </div>\
                        </div>\
                    </li>';
            });
            $("#targets").html(html);
        }
    },
    bindDomEvents: function bindDomEvents() {
        nova.touch.bindClick("#btnSettings", function() {
            nova.application.gotoPage("pages/menu.html");
        });
        nova.touch.bindClick("#targets li", function() {
            atApp.service.getTarget(this.id, function(target) {
                var page = new nova.Page("pages/details.html");
                page.target = target;
                nova.application.gotoPage(page);
            });
        });
        $("#content").height($(window).height() - 50 + "px");
        var scroller = new nova.Scroller(".content-scroll");
        scroller.init();
    }
};

atApp.pages.details = {
    editingTarget:null,
    init: function () {
        var me = this;
        me.editingTarget = atApp.currentPage.target;
        $("#lblTitle").html(me.editingTarget.title);
        $("#lblStart").html(me.editingTarget.startDate.toDateString());
        $("#lblTotalDays").html(me.editingTarget.getTotalDays());
        me.updateProgress();

        $("#content").height($(window).height() - 102 + "px");
        var scroller = new nova.Scroller(".content-scroll");
        scroller.init();

        nova.touch.bindClick("#btnBack", function () {
            nova.application.goBack();
        });
        nova.touch.bindClick("#btnCancel", function () {
            $("#lblTobeAdded").html("0");
        });
        nova.touch.bindClick("#btnEdit", function () {
            var page = new nova.Page("pages/editTarget.html");
            page.target = me.editingTarget;
            atApp.gotoPage(page);
        });
        nova.touch.bindClick("#btnAdd", function () {
            me.addComplete(1);
        });
        nova.touch.bindClick("#btnAdd10", function () {
            me.addComplete(10);
        });
        nova.touch.bindClick("#btnAdd100", function () {
            me.addComplete(100);
        });
        nova.touch.bindClick("#btnAdd1000", function () {
            me.addComplete(1000);
        });
        nova.touch.bindClick("#btnAdd10000", function () {
            me.addComplete(10000);
        });
        nova.touch.bindClick("#btnApply", function () {
            var tobeAdded = $("#lblTobeAdded").html() * 1;
            if (tobeAdded <= 0) {
                var dialog = new nova.widgets.Dialog("dialogError");
                dialog.title = "Not Added";
                dialog.height = 150;
                dialog.width = 0.8;
                dialog.content = "To be added is 0.";
                dialog.buttons = {
                    "OK": function () {
                        dialog.close();
                    }
                };
                atApp.currentPage.autoCancelDialog(dialog);
                dialog.show();
                return;
            }
            var confirmDialog = new nova.widgets.Dialog("confirmDialog");
            confirmDialog.title = "Add Confirm";
            confirmDialog.height = 180;
            confirmDialog.content = "To be added to progress is: " + tobeAdded + ". Correct?";
            confirmDialog.buttons = {
                "Make Progress": function () {
                    me.editingTarget.complete += tobeAdded;
                    atApp.service.saveTarget(me.editingTarget, function () {
                        new nova.widgets.Toast("Done").show();
                        me.updateProgress();
                        $("#lblTobeAdded").html("0");
                        confirmDialog.close();
                    });
                },
                "Cancel": function () {
                    confirmDialog.close();
                }
            };
            atApp.currentPage.autoCancelDialog(confirmDialog);
            confirmDialog.show();
        });
    },
    updateProgress: function () {
        var me = this;
        var dayPercent = me.editingTarget.getTodayProgressPercent();
        var valuePercent = me.editingTarget.getProgressPercent();
        var expectedCompletion = me.editingTarget.target * dayPercent;
        var completeMargin = Math.round(me.editingTarget.complete - expectedCompletion);

        $(".progress").css("width", Number.getPercentage(valuePercent));
        $(".progress-today").css("width", Number.getPercentage(dayPercent));
        $(".progress-percent").html(Number.getPercentage(valuePercent, 1));
        $(".progress-count").html(Number.getDisplayText(me.editingTarget.complete) + "/" + Number.getDisplayText(me.editingTarget.target));


        var $margin = $('#lblMargin');
        if (completeMargin >= 0) {
            $margin.removeClass('warning');
        } else {
            $margin.addClass('warning');
        }

        var marginPercent = Number.getPercentage(completeMargin / me.editingTarget.target, 1);
        $margin.html(completeMargin + '<small>' + marginPercent + '</small>');
    },
    addComplete: function (count) {
        var current = $("#lblTobeAdded").html() * 1;
        $("#lblTobeAdded").html(current + count);
    }
};