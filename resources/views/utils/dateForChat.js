import {chat} from '../config/variable';

const dateFormat = (date) => {
    var date1 = new Date(),
        date2 = new Date(date),
        currDate = date1.getTime(),
        date = date2.getTime(),
        timeDiff = currDate - date,
        hourDiff = timeDiff / 36e5,
        yearDiff = date1.getFullYear() - date2.getFullYear(),
        months = [
            'Jan', 'Feb', 'Mar', 'Apr',
            'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
    if(yearDiff > 1) {
        return `${months[date2.getMonth()]} ${date2.getFullYear()}`;
    } else if(hourDiff >= 24) {
        return `${date2.getDate() < 10 ? '0' + date2.getDate() : date2.getDate()} ${months[date2.getMonth()]}`;
    } else {
        return convert24to12Hour(`${date2.getHours()}:${date2.getMinutes()}`);
    }
};

const convert24to12Hour = (time) => {
    var hour = parseInt(time.split(':')[0]),
        min = '0' + time.split(':')[1],
        amOrPm = hour > 12 ? 'PM' : 'AM';
        
    if(hour == 0) {
        hour += 1;
    } else if(hour > 12) {
        hour -= 12;
    }

    return `${hour}:${min.slice(-2)} ${amOrPm}`;
}

const conversationBreak = (d1, d2) => { //date1(new date), date2(old date)
    if(d2) {
        var d1 = new Date(d1),
            d2 = d2 ? new Date(d2) : new Date(d1),
            time1 = d1.getTime(),
            time2 = d2.getTime(),
            timeDiff = time1 - time2,
            hourDiff = timeDiff / 36e5;
            
        return hourDiff > chat.maxHourBreak ? true : false;
    } else {
        return true;
    }
}

export {
    dateFormat,
    conversationBreak,
};