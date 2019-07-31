export const dateFormat = (date) => {
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
    } else if(hourDiff > 24) {
        return `${date2.getDate() < 10 ? '0' + date2.getDate() : date2.getDate()} ${months[date2.getMonth()]}`;
    } else {
        return convert24to12Hour(`${date2.getHours()}:${date2.getMinutes()}`);
    }
};

const convert24to12Hour = (time) => {
    var hour = parseInt(time.split(':')[0]),
        min = parseInt(time.split(':')[1]),
        amOrPm = hour > 12 ? 'PM' : 'AM';

    if(hour == 0) {
        hour += 1;
    } else if(hour > 12) {
        hour -= 12;
    }

    return `${hour}:${min} ${amOrPm}`;
}