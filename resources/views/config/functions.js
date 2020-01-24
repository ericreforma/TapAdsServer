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

export const getDayDiff = (date1, date2) => {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	const diffTime = Math.abs(d2 - d1);
	const diffDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	return diffDay;
}

export const getDateRange = (e = 0) => {
  var dFromWeek = new Date();
  const dFromYear = dFromWeek.getFullYear();
  const dFromMonth = dFromWeek.getMonth();

  const weekData = Array(7).fill(false).map((d, dIdx) => {
    dFromWeek.setDate(dFromWeek.getDate() - (6 - dIdx));
    const dDate = dFromWeek.getDate();
    const dMonth = dFromWeek.getMonth();
    const dYear = dFromWeek.getFullYear();
    const wLabel = `${months.three[dMonth]} ${dDate}`;
    const wDataset = `${dYear}-${(`0${dMonth + 1}`).slice(-2)}-${(`0${dDate}`).slice(-2)}`;
    dFromWeek.setDate(dFromWeek.getDate() + (6 - dIdx));
    
    return {
      label: wLabel,
      dataset: wDataset
    };
  });

  const m = new Date(dFromYear, dFromMonth + 1, 0);
  const monthData = Array(m.getDate()).fill(null).map((d, dIdx) => {
    dFromWeek.setDate(dFromWeek.getDate() - ((m.getDate() - 1) - dIdx));
    const dDate = dFromWeek.getDate();
    const dMonth = dFromWeek.getMonth();
    const dYear = dFromWeek.getFullYear();
    const wLabel = `${months.three[dMonth]} ${dDate}`;
    const wDataset = `${dYear}-${(`0${dMonth + 1}`).slice(-2)}-${(`0${dDate}`).slice(-2)}`;
    dFromWeek.setDate(dFromWeek.getDate() + ((m.getDate() - 1) - dIdx));
    
    return {
      label: wLabel,
      dataset: wDataset
    };
  });

  const yearData = Array(12).fill(null).map((d, dIdx) => {
    dFromWeek.setMonth(dFromWeek.getMonth() - (11 - dIdx));
    const dDate = dFromWeek.getDate();
    const dMonth = dFromWeek.getMonth();
    const dYear = dFromWeek.getFullYear();
    const wLabel = `${months.three[dMonth]} ${dYear}`;
    const wDataset = `${dYear}-${(`0${dMonth + 1}`).slice(-2)}-01`;
    dFromWeek.setMonth(dFromWeek.getMonth() + (11 - dIdx));
    
    return {
      label: wLabel,
      dataset: wDataset
    };
  });

  const retValue = [weekData, monthData, yearData];
  return retValue[e];
}

export const getTotalColumn = (data, column) => {
  return data.map(d =>
    parseFloat(d[column])
  ).reduce((total, a) =>
    total + a
  ).toFixed(2);
}

export const defaultLine = (labels, dataset) => {
  return ({
    data: {
      labels,
      datasets: [
        {
          label: 'Distance in (km)',
          data: dataset,
          borderColor: 'transparent',
          backgroundColor: 'rgb(68, 159, 238)',
          pointBackgroundColor: 'rgba(0,0,0,0)',
          pointBorderColor: 'rgba(0,0,0,0)',
          borderWidth: 4
        }
      ]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback(value, index) {
              if(index % 2 == 0) return '';
              return value;
            }
          }
        }],
        xAxes: [{
          ticks: {
            beginAtZero: true,
            callback(value, index) {
              if(index % 2 == 0) return '';
              return value;
            }
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false
          }
        }]
      },
    }
  });
}