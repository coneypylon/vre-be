const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB();

const ddb = new AWS.DynamoDB.DocumentClient();



async function id_exist (id) {
	var table = "vre-cars";
	var params = {
		TableName: table,
		Key:{
			"car_id":id
		}
	}
	try {
		var iddata = await ddb.getItem(params).promise();
		console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			return true;
		} catch (error) {
			console.error("Item not present. Error JSON:", JSON.stringify(error, null, 2));
			console.log(JSON.stringify(error),null, 2));
			return false;
		}
}

async function uuid() {
	var present = true
	var token = "42069"
	while (present === true)
	{
		require('crypto').randomBytes(48, function(err, buffer) {
			token = buffer.toString('hex');
		});
		present = await id_exist(token)
	};
	return token
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