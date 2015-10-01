var Programme = (function () {
    function Programme() {
    }
    return Programme;
})();
var Week = (function () {
    function Week() {
    }
    Week.prototype.parseWeekNumber = function (str) {
        var matches = str.match(/(?:uke.+)\b([0-9]|[1-4][0-9]|5[0-2])\b/i);
        if (matches === null || matches.length === 0)
            return 0;
        else {
            this.weekNumber = parseInt(matches[0]);
        }
    };
    Week.prototype.parseYear = function (str) {
        var matches = str.match(/(20)\d{2}/i);
        if (matches === null || matches.length === 0)
            return 0;
        else {
            this.year = parseInt(matches[0]);
        }
    };
    return Week;
})();
var Day = (function () {
    function Day(date) {
        this.date = date;
    }
    Day.prototype.parseDayOfWeek = function (date) {
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var dayNum = date.getDay();
        this.dayOfWeek = weekday[dayNum];
    };
    return Day;
})();
var Activity = (function () {
    function Activity() {
    }
    Activity.prototype.parseRooms = function (str) {
        this.rooms = str.split(',');
    };
    Activity.prototype.parseCourses = function (str) {
        this.courses = str.match(/([A-Z]{2,3}-?\d{2,3})/ig);
    };
    Activity.prototype.parseTimespan = function (year, date, str) {
        var times = str.split('-');
        if (times.length != 2)
            return;
        var startStr = times[0];
        var endStr = times[1];
        var hoursStart = startStr.split('.')[0];
        var minutesStart = startStr.split('.')[1];
        hoursStart = hoursStart.length == 1 ? "0" + hoursStart : hoursStart;
        minutesStart = minutesStart.length == 1 ? "0" + minutesStart : minutesStart;
        var start = new Date(date + " " + year + " " + hoursStart + ":" + minutesStart + ":00");
        if (start !== null && start !== undefined && typeof start !== "NaN") {
            this.start = start;
        }
        var hoursEnd = endStr.split('.')[0];
        var minutesEnd = endStr.split('.')[1];
        hoursEnd = hoursEnd.length == 1 ? "0" + hoursEnd : hoursEnd;
        minutesEnd = minutesEnd.length == 1 ? "0" + minutesEnd : minutesEnd;
        var end = new Date(date.toString() + " " + year + " " + hoursEnd + ":" + minutesEnd + ":00");
        if (end !== null && end !== undefined && typeof end !== "NaN") {
            this.end = end;
        }
    };
    return Activity;
})();
//# sourceMappingURL=tsc.js.map