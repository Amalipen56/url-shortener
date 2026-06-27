# Package each Lambda function as a zip file
data "archive_file" "shorten" {
  type        = "zip"
  source_file = "${path.module}/../lambda/shorten/handler.py"
  output_path = "${path.module}/shorten.zip"
}

data "archive_file" "redirect" {
  type        = "zip"
  source_file = "${path.module}/../lambda/redirect/handler.py"
  output_path = "${path.module}/redirect.zip"
}

data "archive_file" "analytics" {
  type        = "zip"
  source_file = "${path.module}/../lambda/analytics/handler.py"
  output_path = "${path.module}/analytics.zip"
}

# Shorten Lambda
resource "aws_lambda_function" "shorten" {
  filename         = data.archive_file.shorten.output_path
  function_name    = "${var.project_name}-shorten"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.shorten.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      URLS_TABLE = aws_dynamodb_table.urls.name
      BASE_URL   = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
    }
  }
}

# Redirect Lambda
resource "aws_lambda_function" "redirect" {
  filename         = data.archive_file.redirect.output_path
  function_name    = "${var.project_name}-redirect"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.redirect.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      URLS_TABLE   = aws_dynamodb_table.urls.name
      CLICKS_TABLE = aws_dynamodb_table.clicks.name
    }
  }
}

# Analytics Lambda
resource "aws_lambda_function" "analytics" {
  filename         = data.archive_file.analytics.output_path
  function_name    = "${var.project_name}-analytics"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.analytics.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      URLS_TABLE   = aws_dynamodb_table.urls.name
      CLICKS_TABLE = aws_dynamodb_table.clicks.name
    }
  }
}