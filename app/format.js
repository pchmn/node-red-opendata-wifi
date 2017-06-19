
function findMin(str) {
	const regex = /\d+\.?\d+/g;
	const numbers = str.match(regex);

	var min = numbers ? Number(numbers[0]): 0;

	for(var i = 0; i < numbers.length; i++) {
		var number = Number(numbers[i]);
		if(number < min) min = number;
	}

	return min;
}

function dateToTimestamp(strDate) {
	var date = new Date(strDate);
	return date.getTime();
}

console.log(dateToTimestamp("2016-01-04T13:29:38+00:00"));