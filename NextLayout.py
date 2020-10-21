import random
from random import shuffle
import boto3
import json
from boto3.dynamodb.conditions import Key

def query_industries(cargo,loaded):
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('Industries')
    if loaded:
        indf = "%s-Demand" % cargo
    else:
        indf = "%s-Supply" % cargo
    # try:
        # response = table.get_item(Key={"Industry-Function":indf})
        # return response['Items']
    # except Exception as e:
        # print(e.response['Error']['Message'])
    response = table.query(
        KeyConditionExpression=Key('Industry-Function').eq(indf)
    )
    return response['Items']

def update_industry(industrytype,industryid,capacitychange):
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('Industries')

    response = table.update_item(
        Key={
            'Industry-Function':industrytype,
            'id':industryid
        },
        UpdateExpression="SET CurrentUsage = CurrentUsage + :a",
        ExpressionAttributeValues={
            ':a': capacitychange
        },
        ReturnValues="UPDATED_NEW"
    )
    return response


def get_car(car_id):
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('vre-cars')

    try:
        response = table.get_item(Key={"car_id":car_id})
        return response['Item']
    except Exception as e:
        print(e.response['Error']['Message'])

def check_capacity(industry):
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('vre-cars')

    try:
        response = table.get_item(Key=car_id)
        return response['Item']
    except Exception as e:
        print(e.response['Error']['Message'])

def lambda_handler(event, context):
    car = get_car(event["car_id"])
    loi = query_industries(car["cargo"],car["loaded"]) # list of industries
    shuffle(loi)
    found_layout = False
    nextlayout = ''
    for industry in loi:
        if industry["CurrentUsage"] < industry["ProcessingCapacity"]: #we can work with this
            client = boto3.client('lambda')
            update_industry(industry["Industry-Function"],industry["id"],1)
            if industry["Industry-Function"][-6:] == "Supply":
                NewStatus = True
            else:
                NewStatus = False
            # Define the input parameters that will be passed
            # on to the child function
            nextlayout = industry["LayoutID"]
            inputParams = {
              "car_id": event["car_id"],
              "new_industry": "%s-%s" % (industry["Industry-Function"],industry["id"]),
              "load_status_change":NewStatus
            }
         
            response = client.invoke(
                FunctionName = 'arn:aws:lambda:us-east-1:274826762268:function:UpdateCar',
                InvocationType = 'RequestResponse',
                Payload = json.dumps(inputParams)
            )
            found_layout = True
            break
    if not found_layout:
        return {
            'statusCode': 404,
            'body': json.dumps('Matching industry %s not found for car %s' % (car["cargo"],car["car_id"]))
        }
    else:
        return {
            'statusCode': 200,
            'body': json.dumps('Sent car %s to %s' % (car,nextlayout))
        }
    
    
