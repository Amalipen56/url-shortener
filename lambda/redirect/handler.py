import json
import boto3
import os
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")
URLS_TABLE = os.environ.get("URLS_TABLE", "urls")
CLICKS_TABLE = os.environ.get("CLICKS_TABLE", "clicks")

urls_table = dynamodb.Table(URLS_TABLE)
clicks_table = dynamodb.Table(CLICKS_TABLE)

def lambda_handler(event, context):
    try:
        code = event.get("pathParameters", {}).get("code", "")

        if not code:
            return response(400, "Missing short code")

        # Look up the short code in DynamoDB
        result = urls_table.get_item(Key={"code": code})
        item = result.get("Item")

        if not item:
            return response(404, "Short URL not found")

        long_url = item["long_url"]

        # Log the click to the clicks table
        click_time = datetime.now(timezone.utc).isoformat()

        # Get device info from headers
        headers = event.get("headers") or {}
        user_agent = headers.get("User-Agent", "unknown")
        device = detect_device(user_agent)

        # Get rough location from CloudFront header if available
        country = headers.get("CloudFront-Viewer-Country", "unknown")

        clicks_table.put_item(Item={
            "click_id": f"{code}#{click_time}",
            "code": code,
            "clicked_at": click_time,
            "device": device,
            "country": country,
            "user_agent": user_agent[:200],
        })

        # Increment click count on the URL record
        urls_table.update_item(
            Key={"code": code},
            UpdateExpression="SET click_count = click_count + :inc",
            ExpressionAttributeValues={":inc": 1},
        )

        # 301 redirect to the original URL
        return {
            "statusCode": 301,
            "headers": {
                "Location": long_url,
                "Access-Control-Allow-Origin": "*",
            },
            "body": "",
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, "Internal server error")


def detect_device(user_agent):
    ua = user_agent.lower()
    if any(x in ua for x in ["iphone", "android", "mobile"]):
        return "mobile"
    elif any(x in ua for x in ["ipad", "tablet"]):
        return "tablet"
    else:
        return "desktop"


def response(status_code, message):
    return {
        "statusCode": status_code,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": message}),
    }