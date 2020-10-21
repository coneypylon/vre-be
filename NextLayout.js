const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient()



exports.handler = async (event, context) => {
	var table = "vre-cars";
	
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Car ID =', event.car_id);
	var params = {
		ConsistentRead: true,
		TableName: table,
		Key:{
			"car_id": {"S":id}
		}
	};
	var iddata = await dynamo.getItem(params).promise();
	if (iddata.loaded) {
		await findoffload(cargo);
	} else {
		await findload(cargo);
	}
	var params = {
		TableName:table,
		Key:{
			"car_id":event.car_id // The Car ID
		},
		UpdateExpression: "SET #c = :c, #o = list_append(#o, :o)",
		ExpressionAttributeNames: {
			"#c": "current_layout",
			"#o": "previous_layouts"
		},
		ExpressionAttributeValues:{
			":c":event.new_layout,
			":o":[event.new_layout]
		},
		ReturnValues:"UPDATED_NEW"
	};
	
	console.log("Updating the item...");
	try {
		const data = await ddb.update(params).promise();
		console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
		const response = {
			statusCode: 200,
			car_id: event.car_id
		};
		return response;
	} catch (error) {
		console.error("Unable to update item. Error JSON:", JSON.stringify(error, null, 2));
		const response = {
			statusCode: 500,
			car_id: event.car_id
		};
		return response;
	}
	
    
};