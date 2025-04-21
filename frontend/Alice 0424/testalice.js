const url = 'https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-profile?region=US&lang=en-US&symbol=aapl';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'cb267e4695mshec871a33d8235dbp105c8djsn1d50d3d89384',
		'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}