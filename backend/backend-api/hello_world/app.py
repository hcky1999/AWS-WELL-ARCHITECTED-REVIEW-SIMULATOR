import json
import uuid
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

# 👇 Common CORS headers
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
}

def lambda_handler(event, context):
    method = event.get("httpMethod")
    print("Submitting review data") #new added line

    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps("CORS preflight passed")
        }

    if method == "GET":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(load_questions())
        }

    elif method == "POST":
        data = json.loads(event["body"])
        review_id = str(uuid.uuid4())
        data["review_id"] = review_id

        table.put_item(Item=data)

        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Review submitted", "review_id": review_id})
        }

    return {
        "statusCode": 400,
        "headers": CORS_HEADERS,
        "body": json.dumps("Unsupported method")
    }

def load_questions():
    with open("questions.json") as f:
        return json.load(f)
