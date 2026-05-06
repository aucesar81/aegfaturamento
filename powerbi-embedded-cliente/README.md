# Power BI Embedded - Projeto Cliente

Projeto base com arquitetura mais robusta que o protótipo HTML:
- Backend Node.js para gerar token de embed com segurança
- Frontend responsivo usando SDK oficial `powerbi-client`
- Navegação por páginas de relatório no mesmo layout (mobile + desktop)

## 1) Instalação
```bash
npm install
```

## 2) Configuração
Copie `.env.example` para `.env` e preencha:
- `PBI_TENANT_ID`
- `PBI_CLIENT_ID`
- `PBI_CLIENT_SECRET`
- `PBI_WORKSPACE_ID`
- `PBI_REPORT_ID`
- `PBI_PAGE_FATURAMENTO`, `PBI_PAGE_FLUXO`, `PBI_PAGE_DESPESAS`

## 3) Execução
```bash
npm run dev
```
Abra: `http://localhost:3000`

## 4) Observações importantes para produção
- Nunca expor `client_secret` no frontend
- Usar HTTPS no deploy
- Restringir CORS e origem
- Implementar autenticação do usuário final (se necessário)
- Rotacionar segredos no Azure Key Vault
