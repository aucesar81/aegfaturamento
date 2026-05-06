const express = require("express");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

async function getAzureAccessToken() {
  const tenantId = process.env.PBI_TENANT_ID;
  const clientId = process.env.PBI_CLIENT_ID;
  const clientSecret = process.env.PBI_CLIENT_SECRET;

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://analysis.windows.net/powerbi/api/.default"
  });

  const response = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return response.data.access_token;
}

app.get("/api/embed-config", async (req, res) => {
  try {
    const reportId = req.query.reportId || process.env.PBI_REPORT_ID;
    const workspaceId = process.env.PBI_WORKSPACE_ID;
    const pageName = req.query.pageName || process.env.PBI_PAGE_FATURAMENTO;

    if (!reportId || !workspaceId) {
      return res.status(400).json({ error: "Configuração ausente: PBI_REPORT_ID/PBI_WORKSPACE_ID" });
    }

    const accessToken = await getAzureAccessToken();

    const generateTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
    const tokenResponse = await axios.post(
      generateTokenUrl,
      { accessLevel: "View" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const reportInfoUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
    const reportInfo = await axios.get(reportInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return res.json({
      reportId,
      embedUrl: reportInfo.data.embedUrl,
      embedToken: tokenResponse.data.token,
      tokenExpiration: tokenResponse.data.expiration,
      pageName
    });
  } catch (error) {
    const detail = error.response?.data || error.message;
    return res.status(500).json({ error: "Falha ao gerar configuração de embed", detail });
  }
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Power BI Embedded app em http://localhost:${port}`);
});
