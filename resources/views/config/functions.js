import { months, days } from '../config';

export const getMonthDiff = (date1, date2) => {
	if(!date1 || !date2) {
		return false;
	} else {
		var months,
			date1 = new Date(date1),
			date2 = new Date(date2);

    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
		return months <= 0 ? 0 : months;
	}
}

export const numberWithCommas = (x) => {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
};

export const checkDurationDate = (durationFrom, durationTo) => {
	const dFrom = new Date(durationFrom);
	const dTo = new Date(durationTo);
	const dNow = new Date();

	if(dFrom > dNow) { // campaign not yet published
		return 0;
	} else if(dTo < dNow) { // campaign expired
		return 2;
	} else { // campaign ongoing
		return 1;
	}
}

export const getMonthDuration = (date1, date2) => {
	if(!date1 || !date2) {
		return false;
	} else {
		var months,
			date1 = new Date(date1),
			date2 = new Date(date2);

    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
		return months <= 0 ? 0 : months;
	}
}

export const getTotalDistance = c => {
	const km = c.pay_basic_km;
	return (km * getMonthDuration(c.duration_from, c.duration_to)).toFixed(2);
}

export const getTotalPay = c => {
	const payBasic = parseFloat(c.pay_basic);
	const returnValue = payBasic * getMonthDuration(c.duration_from, c.duration_to);
	return numberWithCommas(returnValue.toFixed(2));
}

export const dateTimeString = (date, uppercase = false) => {
	const d = date.split(' ')[0];
	const year = d.split('-')[0];
	const month = parseInt(d.split('-')[1]) - 1;
	const day = d.split('-')[2];
	const m = uppercase ? months.three[month].toUpperCase() : months.three[month];
	return `${m}. ${day}, ${year}`;
}

export const getChatTimestamp = d => {
	const dateChat = new Date(d);
	const dateNow = new Date();
	const diffTime = Math.abs(dateNow - dateChat);
	const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
	if(diffHours < 24)
		return tConvert(`${d.split(' ')[1].split(':')[0]}:${d.split(' ')[1].split(':')[1]}`);

	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	if(diffDays < 7)
		return days[dateChat.getDay()].toUpperCase().slice(0, 3);

	return `${dateChat.getMonth() + 1}/${dateChat.getDate()}/${dateChat.getFullYear()}`;
}

const tConvert = (time) => {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
}