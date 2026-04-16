# Contract: Abstract API Company Enrichment

**Provider**: Abstract API
**Endpoint**: `https://companyenrichment.abstractapi.com/v1/`
**Method**: GET

## Request

**URL**: `https://companyenrichment.abstractapi.com/v1/?api_key=<ABSTRACT_API_KEY>&domain=<email_domain>`

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| api_key | string | Yes | `ABSTRACT_API_KEY_REDACTED` |
| domain | string | Yes | `acme-industries.com` (extracted from lead email) |

**Domain extraction**: Split email on `@`, take the second part.
Example: `jane@acme-industries.com` → `acme-industries.com`

## Response (200)

```json
{
  "name": "Acme Industries Inc.",
  "domain": "acme-industries.com",
  "country": "Australia",
  "city": "Sydney",
  "industry": "Manufacturing",
  "employees_count": "500-1000",
  "linkedin_url": "https://linkedin.com/company/acme-industries",
  "facebook_url": null,
  "twitter_url": null,
  "year_founded": 1998
}
```

**Fields we store in SharePoint**:
| Response Field | SharePoint Column |
|---------------|-------------------|
| `name` | EnrichmentCompany |
| `industry` | EnrichmentIndustry |
| `employees_count` | EnrichmentEmployees |
| `country` + `city` | EnrichmentLocation (concatenated) |

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 200 (empty body) | No data found for domain | Set EnrichmentStatus="Failed", continue pipeline |
| 401 | Invalid API key | Set EnrichmentStatus="Failed", continue pipeline |
| 429 | Rate limit (1 req/sec on free tier) | Retry after delay |
| 500 | Server error | Set EnrichmentStatus="Failed", continue pipeline |

## Rate Limits

- Free tier: 100 requests total, 1 request/second
- Sufficient for demo purposes (~10-20 test leads)
