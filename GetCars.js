

var AWS = require("aws-sdk");

var ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	var table = event.table;
	var car_id = event.car_id;
	var params = {
		TableName: table,
		Key:{
			"car_id":car_id
		}
	};
	try {
		const data = await ddb.get(params).promise();
		console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
			return data;
		} catch (error) {
			console.error("Unable to update item. Error JSON:", JSON.stringify(error, null, 2));
			return error;
		}
};
