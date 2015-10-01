
class Programme {
  id: string;
  name: string;
  schedule: Array<Week>;
}

class Week {
  weekNumber: number;
  year: number;
  days: Array<Day>;

  parseWeekNumber(str: string) {
    var matches = str.match(/(?:uke.+)\b([0-9]|[1-4][0-9]|5[0-2])\b/i);
    if (matches === null || matches.length === 0) return 0;
    else {
      this.weekNumber = parseInt(matches[0]);
    }
  }

  parseYear(str: string) {
    var matches = str.match(/(20)\d{2}/i);
    if (matches === null || matches.length === 0) return 0;
    else {
      this.year = parseInt(matches[0]);
    }
  }

}

class Day {
  date: Date;
  dayOfWeek: string;
  activities: Array<Activity>;

  constructor(date: Date) {
    this.date = date;
  }

  parseDayOfWeek(date: Date) {
    var weekday = new Array(7);
    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var dayNum = date.getDay();
    this.dayOfWeek = weekday[dayNum];
  }

}

class Activity {
  courses: Array<string>;
  start: Date;
  end: Date;
  lecturer: string;
  notice: string;
  rooms: Array<string>;

  parseRooms(str: string) {
    this.rooms = str.split(',');
  }

  parseCourses(str: string) {
    this.courses = str.match(/([A-Z]{2,3}-?\d{2,3})/ig);
  }

  parseTimespan(year: number, date: number, str: string) {
    var times = str.split('-');
    if(times.length != 2) return;
    var startStr = times[0];
    var endStr = times[1];

    var hoursStart = startStr.split('.')[0];
    var minutesStart = startStr.split('.')[1];
    hoursStart = hoursStart.length == 1 ? "0" + hoursStart : hoursStart;
    minutesStart = minutesStart.length == 1 ? "0" + minutesStart : minutesStart;
    var start = new Date(date + " " + year + " " + hoursStart + ":" + minutesStart + ":00");
    if(start !== null && start !== undefined && typeof start !== "NaN") {
      this.start = start;
    }

    var hoursEnd = endStr.split('.')[0];
    var minutesEnd = endStr.split('.')[1];
    hoursEnd = hoursEnd.length == 1 ? "0" + hoursEnd : hoursEnd;
    minutesEnd = minutesEnd.length == 1 ? "0" + minutesEnd : minutesEnd;
    var end = new Date(date.toString() + " " + year + " " + hoursEnd + ":" + minutesEnd + ":00");
    if(end !== null && end !== undefined && typeof end !== "NaN") {
      this.end = end;
    }
  }

}
