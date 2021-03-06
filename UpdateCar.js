const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event, context) => {
	var table = "vre-cars";
	
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Car ID =', event.car_id);
    console.log('New Industry ID =', event.new_industry);
	var params = {
		TableName:table,
		Key:{
			"car_id":event.car_id // The Car ID
		},
		UpdateExpression: "SET #l = :l , #c = :c, #o = list_append(#o, :o)",
		ExpressionAttributeNames: {
			"#l": "loaded",
			"#c": "current_industry",
			"#o": "previous_industries"
		},ExpressionAttributeValues:{
			":l": event.load_status_change,
			":c": event.new_industry,
			":o": [event.new_industry]
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