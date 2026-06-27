output "api_url" {
  description = "API Gateway URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "shorten_endpoint" {
  description = "POST to this to shorten a URL"
  value       = "${aws_apigatewayv2_stage.main.invoke_url}/shorten"
}

output "analytics_endpoint" {
  description = "GET all stats"
  value       = "${aws_apigatewayv2_stage.main.invoke_url}/stats"
}