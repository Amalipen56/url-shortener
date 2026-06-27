# URLs table — stores each short code and its long URL
resource "aws_dynamodb_table" "urls" {
  name         = "${var.project_name}-urls"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "code"

  attribute {
    name = "code"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-urls"
  }
}

# Clicks table — stores every click event with metadata
resource "aws_dynamodb_table" "clicks" {
  name         = "${var.project_name}-clicks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "click_id"

  attribute {
    name = "click_id"
    type = "S"
  }

  attribute {
    name = "code"
    type = "S"
  }

  # Global secondary index so analytics Lambda can query by code
  global_secondary_index {
    name            = "code-index"
    hash_key        = "code"
    projection_type = "ALL"
  }

  tags = {
    Name = "${var.project_name}-clicks"
  }
}