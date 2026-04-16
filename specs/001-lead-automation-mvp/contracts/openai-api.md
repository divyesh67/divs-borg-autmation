# Contract: OpenAI Classification API

**Provider**: OpenAI
**Model**: `gpt-5.4-mini` (400K context, structured output support)
**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Method**: POST

## Request

```json
{
  "model": "gpt-5.4-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a lead classification assistant. Analyse the following lead submission and enrichment data, then return a JSON object with exactly these fields:\n\n{\"category\": \"hot\" | \"warm\" | \"cold\", \"summary\": \"1-2 sentence intent summary\"}\n\nClassification rules:\n- HOT: Clear buying intent, specific product/service request, urgency\n- WARM: General interest, exploring options, no urgency\n- COLD: Vague inquiry, spam-like, no clear business intent\n\nReturn ONLY valid JSON, no markdown, no explanation."
    },
    {
      "role": "user",
      "content": "Lead Name: Jane Smith\nCompany: Acme Industries\nEmail: jane@acme-industries.com\nMessage: We need pricing for warehouse automation solutions. Timeline is Q3 this year.\n\nEnrichment Data:\nIndustry: Manufacturing\nEmployees: 500-1000\nLocation: Sydney, Australia"
    }
  ],
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Headers**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer `<OPENAI_API_KEY>` |

**Note**: Using `response_format: { "type": "json_object" }` with gpt-5.4-mini ensures valid JSON output. This model natively supports structured outputs, making it highly reliable for classification tasks.

## Response

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"category\":\"hot\",\"summary\":\"Clear buying intent for warehouse automation with Q3 deadline. Established manufacturing company.\"}"
      }
    }
  ]
}
```

**Parsing**: Extract `choices[0].message.content`, then parse that string as JSON to get `category` and `summary`.

## Model Choice

**gpt-5.4-mini**: Fast, cost-effective ($0.75/1M input, $4.50/1M output), 400K context window. Supports structured outputs natively. Optimized for tool use and high-volume API workloads — ideal for lead classification. The brief lists "OpenAI / Claude API" as options — this satisfies that requirement directly.

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Parse response |
| 401 | Invalid API key | Set AICategory="unknown", continue pipeline |
| 429 | Rate limited | Retry with backoff |
| 500 | Server error | Set AICategory="unknown", continue pipeline |
