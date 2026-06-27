Serverless URL Shortener with Analytics

Built a serverless URL shortening service on AWS with real-time click analytics. Zero servers to manage — scales to millions of requests at near-zero cost.

Live URLs

- Frontend: http://urlshortener-frontend-76ea4a64.s3-website-us-east-1.amazonaws.com

Architecture I Used

- API Gateway — REST API routing all requests
- Lambda (Shorten) — generates short code, stores in DynamoDB
- Lambda (Redirect) — looks up code, logs click, returns 301 redirect
- Lambda (Analytics) — aggregates click data by device and country
- DynamoDB — two tables: URLs and Clicks (PAY_PER_REQUEST billing)
- S3 — hosts compiled React frontend

Key features

- Short codes generated in milliseconds
- Click tracking: timestamp, device type, country
- Analytics dashboard with per-link and aggregate stats
- Fully serverless — no EC2, no servers, no maintenance
- Infrastructure as Code with Terraform
- PAY_PER_REQUEST DynamoDB — costs nothing at low volume

