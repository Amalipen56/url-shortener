import json
import boto3
import string
import random
import os
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("URLS_TABLE", "urls")
table = dynamodb.Table(TABLE_NAME)

def generate_code(length=6):
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        long_url = body.get("url", "").strip()

        if not long_url:
            return response(400, {"error": "url is required"})

        if not long_url.startswith(("http://", "https://")):
            return response(400, {"error": "url must start with http:// or https://"})

        # Generate a unique short code
        code = generate_code()

        # Make sure the code does not already exist
        while True:
            existing = table.get_item(Key={"code": code})
            if "Item" not in existing:
                break
            code = generate_code()

        # Save to DynamoDB
        table.put_item(Item={
            "code": code,
            "long_url": long_url,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "click_count": 0,
        })

        base_url = os.environ.get("BASE_URL", "")

        return response(201, {
            "code": code,
            "short_url": f"{base_url}/{code}",
            "long_url": long_url,
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {"error": "Internal server error"})


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }