const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

const dynamo = new AWS.DynamoDB();

async function id_exist (id) {
	var table = "vre-cars";
	var params = {
		ConsistentRead: true,
		TableName: table,
		Key:{
			"car_id": {"S":id}
		}
	};
	try {
		var iddata = await dynamo.getItem(params).promise();
		console.log("I am here");
		console.log("GetItem succeeded:", JSON.stringify(iddata, null, 2));
		if (JSON.stringify(iddata, null, 2) === "{}"){
			return false;
		} else {
			return true;
		}
		} catch (error) {
			console.error("Failed to Get test car. Error JSON:", JSON.stringify(error, null, 2));
			console.log(JSON.stringify(error),null, 2);
			throw error;
		}
}

async function uuid() {
	var present = true;
	var token = "42069";
	while (present === true)
	{
		require('crypto').randomBytes(16, function(err, buffer) {
			if (err) throw err;
			token = buffer.toString('hex');
		});
		present = await id_exist(token);
	}
	return token;
}


exports.handler = async (event, context) => {
	var table = "vre-cars";
	
    //console.log('Received event:', JSON.stringify(event, null, 2));
	var id = await uuid();
    console.log('Car ID =', id);
    console.log('New Layout ID =', event.layout);
	var params = {
		TableName:table,
		Item:{
			"car_id":id,
			"current_layout":event.layout,
			"previous_layouts":[event.layout]
		}
	};
	
	console.log("Creating the item...");
	try {
		const data = await ddb.put(params).promise();
		console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
		const response = {
			statusCode: 200,
			car_id: event.car_id,
			current_layout: event.layout
		};
		return response;
	} catch (error) {
		console.error("Unable to create item. Error JSON:", JSON.stringify(error, null, 2));
		const response = {
			statusCode: 500
		};
		return response;
	}
	
    
};