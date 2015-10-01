///<reference path="../typings/cheerio/cheerio.d.ts"/>
var cheerio = require("cheerio");
///<reference path="../typings/moment/moment-node.d.ts"/>
var moment = require("moment");
///<reference path="../typings/request/request.d.ts"/>
var request = require("request");
var RequestData = (function () {
    function RequestData() {
    }
    return RequestData;
})();
var Form = (function () {
    function Form() {
    }
    return Form;
})();
var ProgrammeOption = (function () {
    function ProgrammeOption() {
    }
    return ProgrammeOption;
})();
var Scraper = (function () {
    function Scraper() {
        var self = this;
        request(this.reqData, function (err, response, body) {
            self.parseProgrammeOptions(err, body, self);
        });
    }
    Scraper.prototype.scrape = function (id) {
        console.log("scrape > starting");
        var self = this;
        var programmesToSync;
        if (id !== "" && id !== null && id !== undefined) {
            var programme;
            for (var i = 0; i < this.programmeOptions.length; i++) {
                if (this.programmeOptions[i].id === id) {
                    programme = this.programmeOptions[i];
                    break;
                }
            }
            if (programme !== null && programme !== undefined) {
                this.reqData.form.dlObject = programme.id;
                request.post(this.reqData, function (err, response, body) {
                    programmesToSync.push(self.parseProgrammeSchedule(err, body, id));
                });
            }
            else {
                console.log("scrape > couldn't find programme by that ID");
            }
        }
        else {
            console.log("scrape > getting schedules for all programmes");
            for (var i = 0; i < this.programmeOptions.length; i++) {
                this.reqData.form.dlObject = this.programmeOptions[i].id;
                request.post(this.reqData, function (err, response, body) {
                    programmesToSync.push(self.parseProgrammeSchedule(err, body, this.programmeOptions[i].id));
                });
            }
        }
        var synced = self.syncProgrammes(programmesToSync);
        var stats = { tried: programmesToSync.length, synced: synced };
        return stats;
    };
    Scraper.prototype.syncProgrammes = function (programmesToSync) {
        if (this.programmes.length < 1) {
            this.programmes = programmesToSync;
            return programmesToSync.length;
        }
        else {
            var syncedTotal = 0;
            for (var i = 0; i < programmesToSync.length; i++) {
                var synced = 0;
                for (var n = 0; n < this.programmes.length; n++) {
                    if (programmesToSync[i].id === this.programmes[n].id) {
                        if (JSON.stringify(programmesToSync[i]) === JSON.stringify(this.programmes[n])) {
                            synced = 1;
                            break;
                        }
                        else {
                            synced = 1;
                            this.programmes[n] = programmesToSync[i];
                        }
                    }
                    else {
                        continue;
                    }
                }
                syncedTotal += synced;
            }
        }
    };
    Scraper.prototype.parseProgrammeOptions = function (err, body, self) {
        if (err)
            console.log("parseProgrammes > couldn't get programmes");
        else {
            console.log("parseProgrammes > retrieved HTML for programmes");
            var $ = cheerio.load(body);
            self.reqData.form.__EVENTTARGET = $("#__EVENTTARGET").val() === undefined ? "" : $("#__EVENTTARGET").val();
            self.reqData.form.__EVENTARGUMENT = $("#__EVENTARGUMENT").val() === undefined ? "" : $("#__EVENTARGUMENT").val();
            self.reqData.form.__LASTFOCUS = $("#__LASTFOCUS").val() === undefined ? "" : $("#__LASTFOCUS").val();
            self.reqData.form.__VIEWSTATE = $("#__VIEWSTATE").val();
            self.reqData.form.__VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
            self.reqData.form.__EVENTVALIDATION = $("#__EVENTVALIDATION").val();
            self.reqData.form.tLinkType = $("#tLinkType").val();
            self.reqData.form.tWildcard = $("#tWildcard").val() === undefined ? "" : $("#tWildcard").val();
            self.reqData.form.lbWeeks = $("select[name=lbWeeks] option[selected=selected]").val();
            self.reqData.form.lbDays = $("select[name=lbDays] option[selected=selected]").val();
            self.reqData.form.RadioType = $("input[type=radio][name=RadioType][checked=checked]").val();
            self.reqData.form.bGetTimetable = $("input[id=bGetTimetable]").val();
            console.log("parseProgrammes > parsing programme options");
            var i = 0;
            $("select[id=dlObject] option").each(function () {
                var opt = $(this);
                self.programmeOptions[i] = { id: opt.val(), name: opt.text() };
                i++;
            });
        }
    };
    Scraper.prototype.parseProgrammeSchedule = function (err, body, id) {
        if (err)
            console.log("parseProgrammeSchedule > error happened");
        else {
            var programme = { id: id, name: "", schedule: Array() };
            var $ = cheerio.load(body);
            programme.name = this.sanitize($(".title").text());
            console.log("parseProgrammeSchedule > parsing schedule for " + id + ":" + programme.name);
            $("table").each(function (i, elem) {
                console.log("parseProgrammeSchedule > " + programme.id + ":" + programme.name + " has " +
                    programme.schedule.length + " weeks");
                var dayElements = $(this).find("tr.tr2");
                if (dayElements !== null && dayElements.length > 0) {
                    var days;
                    var week = new Week();
                    var weekStr = $(this).find("td.td1").text();
                    week.parseWeekNumber(weekStr);
                    week.parseYear(weekStr);
                    dayElements.each(function (i, elem) {
                        var activity = new Activity();
                        activity.parseCourses(this.sanitize($(this).children().eq(3).text()));
                        activity.parseRooms(this.sanitize($(this).children().eq(4).text()));
                        activity.lecturer = this.sanitize($(this).children().eq(5).text());
                        activity.notice = this.sanitize($(this).children().eq(6).text());
                        var dateStr = this.sanitize($(this).children().eq(1).text());
                        var timeStr = this.sanitize($(this).children().eq(2).text());
                        activity.parseTimespan(week.year, dateStr, timeStr);
                        var exists = Array();
                        for (var n = 0; n < days.length; n++) {
                            var dayDate = days[n].date.getDate() + "." + days[n].date.getMonth();
                            if (dayDate == activity.start.getDate() + "." + activity.start.getMonth()) {
                                exists.push(days[n]);
                            }
                        }
                        if (exists.length === 0) {
                            var day = new Day(activity.start);
                            day.parseDayOfWeek(activity.start);
                            day.activities.push(activity);
                            days.push(day);
                        }
                        else if (exists.length > 0) {
                            exists[0].activities.push(activity);
                        }
                    });
                    week.days = days;
                    programme.schedule.push(week);
                }
            });
            return programme;
        }
        return undefined;
    };
    Scraper.prototype.getScheduleURL = function () {
        var now = new Date();
        var autumnStart = new Date(now.getFullYear(), 6, 20);
        var springStart = new Date(now.getFullYear(), 12, 16);
        var range = moment().range(autumnStart, springStart);
        if (range.contains(now)) {
            return "http://timeplan.uia.no/swsuiah/public/no/default.aspx";
        }
        else {
            return "http://timeplan.uia.no/swsuiav/public/no/default.aspx";
        }
    };
    Scraper.prototype.sanitize = function (str) {
        var escapeSequences = ['\r', '\n', '\t', '\\', '\f', '\b', '\n', '\'', '\"'];
        var res = "";
        for (var i = 0, len = str.length; i < len; i++) {
            if (escapeSequences.indexOf(str[i]) > -1)
                continue;
            if (i === 0 && str[i] === ' ')
                continue;
            if (i !== 0 && str[i] === ' ' && str[i - 1] === ' ')
                continue;
            res += str[i];
        }
        return res;
    };
    ;
    return Scraper;
})();
//# sourceMappingURL=Scraper.js.map