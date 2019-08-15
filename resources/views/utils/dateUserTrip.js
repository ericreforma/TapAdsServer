export const userTripDateFormat = (dates) => {
    var d = dates.split(' ')[0],
        time = dates.split(' ')[1],
        year = d.split('-')[0],
        month = parseInt(d.split('-')[1]),
        date = d.split('-')[2],
        hour = parseInt(time.split(':')[0]),
        min = time.split(':')[1],
        months = [
            'JAN', 'FEB', 'MAR', 'APR',
            'MAY', 'JUN', 'JUL', 'AUG',
            'SEP', 'OCT', 'NOV', 'DEC'
        ],
        time = hour == 0 ? '12:' + min + ' AM' : (
            hour < 13 ? (hour.length < 10 ? '0' + hour.toString() : hour) + ':' + min + ' AM' : (
                ((hour - 12) < 10 ? '0' + (hour - 12).toString() : (hour - 12)) + ':' + min + ' PM'
            )
        );

    return months[month-1] + '. ' + date + ', ' + year + ' - ' + time;
};