# Contract: Outlook Email Notification

**Connector**: Office 365 Outlook (Standard)
**Action**: Send an email (V2)

## Email Format

### Subject Line

| AI Category | Subject |
|-------------|---------|
| hot | `🔴 HOT LEAD: Jane Smith from Acme Industries` |
| warm | `New Lead: Jane Smith from Acme Industries` |
| cold | `New Lead: Jane Smith from Acme Industries` |
| unknown | `New Lead: Jane Smith from Acme Industries (AI unavailable)` |

### HTML Body

```html
<h2>New Lead Received</h2>

<table>
  <tr><td><strong>Name:</strong></td><td>Jane Smith</td></tr>
  <tr><td><strong>Company:</strong></td><td>Acme Industries</td></tr>
  <tr><td><strong>Email:</strong></td><td>jane@acme-industries.com</td></tr>
</table>

<h3>AI Classification</h3>
<p><strong>Category:</strong> 🔴 Hot</p>
<p><strong>Summary:</strong> Clear buying intent for warehouse automation
with Q3 deadline. Established manufacturing company.</p>

<h3>Enrichment Data</h3>
<table>
  <tr><td><strong>Industry:</strong></td><td>Manufacturing</td></tr>
  <tr><td><strong>Employees:</strong></td><td>500-1000</td></tr>
  <tr><td><strong>Location:</strong></td><td>Sydney, Australia</td></tr>
</table>

<h3>Original Message</h3>
<p>We need pricing for warehouse automation solutions.
Timeline is Q3 this year.</p>

<hr>
<p><em>Processed by LeadFlow for Borg</em></p>
```

### Recipient
Configurable in the Power Automate flow. Set to the user's own email for demo.
