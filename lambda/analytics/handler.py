import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from collections import Counter

dynamodb = boto3.resource("dynamodb")
URLS_TABLE = os.environ.get("URLS_TABLE", "urls")
CLICKS_TABLE = os.environ.get("CLICKS_TABLE", "clicks")

urls_table = dynamodb.Table(URLS_TABLE)
clicks_table = dynamodb.Table(CLICKS_TABLE)

def lambda_handler(event, context):
    try:
        path_params = event.get("pathParameters") or {}
        code = path_params.get("code", "")

        # If no code provided return stats for all URLs
        if not code:
            return get_all_stats()

        return get_stats_for_code(code)

    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {"error": "Internal server error"})


def get_stats_for_code(code):
    # Get URL record
    url_result = urls_table.get_item(Key={"code": code})
    url_item = url_result.get("Item")

    if not url_item:
        return response(404, {"error": "Short URL not found"})

    # Get all clicks for this code
    clicks_result = clicks_table.query(
        IndexName="code-index",
        KeyConditionExpression=Key("code").eq(code)
    )
    clicks = clicks_result.get("Items", [])

    # Aggregate device breakdown
    devices = Counter(c.get("device", "unknown") for c in clicks)

    # Aggregate country breakdown
    countries = Counter(c.get("country", "unknown") for c in clicks)

    # Last 5 clicks with timestamps
    recent = sorted(clicks, key=lambda x: x.get("clicked_at", ""), reverse=True)[:5]

    return response(200, {
        "code": code,
        "long_url": url_item["long_url"],
        "created_at": url_item["created_at"],
        "total_clicks": int(url_item.get("click_count", 0)),
        "devices": dict(devices),
        "countries": dict(countries),
        "recent_clicks": [
            {
                "clicked_at": c["clicked_at"],
                "device": c.get("device", "unknown"),
                "country": c.get("country", "unknown"),
            }
            for c in recent
        ],
    })


def get_all_stats():
    # Scan all URLs and return summary
    result = urls_table.scan()
    items = result.get("Items", [])

    urls = [
        {
            "code": item["code"],
            "long_url": item["long_url"],
            "created_at": item["created_at"],
            "click_count": int(item.get("click_count", 0)),
        }
        for item in items
    ]

    # Sort by most clicked
    urls.sort(key=lambda x: x["click_count"], reverse=True)

    return response(200, {
        "total_urls": len(urls),
        "total_clicks": sum(u["click_count"] for u in urls),
        "urls": urls,
    })


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        "body": json.dumps(body, default=str),
    }