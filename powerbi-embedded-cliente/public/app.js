const pages = [
  { id: "faturamento", label: "Faturamento", pageName: "ReportSection1" },
  { id: "fluxo", label: "Fluxo de Caixa", pageName: "ReportSection2" },
  { id: "despesas", label: "Despesas", pageName: "ReportSection3" }
];

const menu = document.getElementById("menu");
const statusEl = document.getElementById("status");
const container = document.getElementById("reportContainer");

const powerbiService = window["powerbi-client"].service;
const models = window["powerbi-client"].models;
const service = new powerbiService.Service(
  powerbiService.factories.hpmFactory,
  powerbiService.factories.wpmpFactory,
  powerbiService.factories.routerFactory
);

let report;

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function buildMenu() {
  pages.forEach((p, index) => {
    const btn = document.createElement("button");
    btn.textContent = p.label;
    if (index === 0) btn.classList.add("active");
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".menu button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      await loadReport(p.pageName);
    });
    menu.appendChild(btn);
  });
}

async function loadReport(pageName) {
  try {
    setStatus("Carregando relatório...");

    const response = await fetch(`/api/embed-config?pageName=${encodeURIComponent(pageName)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao buscar embed config");
    }

    if (report) {
      report.off("loaded");
      report.off("error");
      service.reset(container);
    }

    const config = {
      type: "report",
      tokenType: models.TokenType.Embed,
      accessToken: data.embedToken,
      embedUrl: data.embedUrl,
      id: data.reportId,
      pageName: data.pageName,
      permissions: models.Permissions.Read,
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false }
        },
        background: models.BackgroundType.Transparent
      }
    };

    report = service.embed(container, config);

    report.on("loaded", () => setStatus("Relatório carregado", "ok"));
    report.on("error", (event) => {
      console.error(event.detail);
      setStatus("Falha no carregamento", "error");
    });
  } catch (error) {
    console.error(error);
    setStatus(`Erro: ${error.message}`, "error");
  }
}

buildMenu();
loadReport(pages[0].pageName);
