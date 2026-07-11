# EquiVet Lab

Módulo do ecossistema **EquiVet IA** para interpretação de exames hematológicos e bioquímicos equinos.
Desenvolvido pelo Dr. Ricardo Midão (Centaurovet).

**Pasta:** `/Volumes/Centauro/Equivet Lab/`

---

## Versões

| Versão | Arquivo | Estado |
|--------|---------|--------|
| HTML standalone (offline) | `equivet_lab.html` | ✅ disponível |
| Streamlit (consultório) | `app_lab.py` | 🔜 futura |

A versão HTML funciona em qualquer navegador moderno, sem instalação, sem conexão. É ideal para uso no campo (tablet, celular, notebook sem internet).

---

## Funcionalidades — v1.1 (HTML)

- **Identificação do paciente** (nome, idade, sexo, peso, proprietário, histórico)
- **Hemograma completo**: eritrograma, leucograma, plaquetas, proteínas, fibrinogênio
- **Bioquímico**: renal, hepático, muscular, proteínas, eletrólitos, metabólico
- **Validação automática offline** — cada parâmetro é classificado em:
  - 🟦 **Diminuído** (abaixo da referência)
  - 🟢 **Normal**
  - 🟥 **Elevado** (acima da referência)
  - 🟣 **Crítico** (fora dos limites de alerta)
- **📄 Importação de PDF do laboratório** — envia o PDF direto para Claude Sonnet 4.6, que:
  - Lê PDFs nativos e escaneados (OCR embutido)
  - Extrai todos os valores reconhecidos (mesmo com nomes alternativos: "Hb", "Eritrócitos", "TGO")
  - Identifica também dados do paciente (nome, raça, idade, peso, data)
  - Preenche o formulário automaticamente + faz interpretação clínica completa
  - Mostra observações sobre valores que não conseguiu ler ou parâmetros fora do schema
- **Persistência local** — dados salvos em `localStorage` (não saem do navegador)
- **Exportação JSON** — para arquivar ou anexar ao prontuário
- **Impressão / PDF** — layout otimizado em modo print
- **Resumo offline** — lista de alterações sem chamar IA
- **Análise por IA (opcional)** — botão que chama Claude via API Anthropic com o quadro completo do paciente, recebendo laudo estruturado: síntese → hipóteses → diferenciais → exames complementares → conduta
- **Seletor de modelo** — Sonnet 4.6 (padrão, rápido e econômico) ou Opus 4.6 (mais profundo, ~5× mais caro) — selecionável em ⚙ Chave IA e visível no badge da barra inferior

---

## Como usar

### Fluxo rápido — com PDF do laboratório (1 clique)
1. Abra `equivet_lab.html` (duplo-clique ou via `ABRIR_LAB.bat` no Windows).
2. Clique em **📄 Importar PDF** e selecione o arquivo do laboratório.
3. Aguarde 10–30 s — Claude lê o PDF, extrai valores, preenche o formulário e devolve interpretação clínica.
4. Confira os valores no formulário (sempre revisar) e imprima/exporte.

### Fluxo manual — digitação direta
1. Abra o app, preencha a identificação do paciente.
2. Digite os valores nas abas **Hemograma** e **Bioquímico**.
3. Cada campo é validado automaticamente (verde/vermelho/azul/roxo).
4. Use **Resumo offline** para listagem rápida, ou **⚡ Analisar por IA** para laudo completo.

### Configurar a chave Anthropic (apenas para os botões de IA)

1. Clique em **⚙ Chave IA** no canto superior direito.
2. Cole sua chave (`sk-ant-...`) — pegue em https://console.anthropic.com/settings/keys
3. A chave fica armazenada **somente no localStorage do seu navegador** — não é enviada a nenhum servidor da Centaurovet.
4. A chamada é direta do navegador para `https://api.anthropic.com/v1/messages`.

> **Nota de segurança:** chamada direta à API Anthropic do navegador é prática aceitável para uso pessoal/clínico individual, mas não para distribuição pública. Para uso multiusuário, futuramente será roteada pelo backend Railway (`chat_backend`) com auth via `API_SECRET`.

---

## Valores de Referência

Valores adotados são para **equino adulto saudável** (Smith Large Animal Surgery, Adams Lameness, manuais AAEP consolidados). Não há ainda estratificação por idade, raça, estado fisiológico ou treinamento — feature prevista para v2.

---

## Roadmap

### v2 — Curto prazo
- [ ] Adicionar perfil hormonal (cortisol, T4, T3, ACTH, insulina) para PPID / SE / reprodução
- [ ] Estratificação por idade (potro, jovem, adulto, idoso)
- [ ] Estratificação por estado fisiológico (égua prenhe/lactante, atleta em treinamento)
- [x] **Importação de PDF do laboratório** (v1.1 — usando Claude Sonnet 4.6 com leitura nativa de PDF + OCR)
- [ ] Importação de foto/imagem do laudo (JPG/PNG via vision API)
- [ ] Histórico de exames do mesmo paciente (gráficos de evolução)

### v3 — Integração com EquiVet Clínica
- [ ] Migrar chamada IA para o backend Railway (auth + RAG Smith/Adams)
- [ ] Salvar laudo no prontuário do paciente no Supabase
- [ ] Vincular ao módulo de radiografia (correlação com achados de imagem)
- [ ] Versão Streamlit para consultório com banco de pacientes

---

## Arquitetura

```
Equivet Lab/
├── README.md                   # Este arquivo
├── equivet_lab.html            # App standalone (offline + IA opcional)
├── ABRIR_LAB.bat               # Atalho Windows para abrir o app
└── (futuro)
    ├── app_lab.py              # Versão Streamlit para consultório
    ├── valores_referencia.json # Tabela de refs estratificada por idade/raça
    └── prompts/                # System prompts versionados
```

---

## Integração com o ecossistema

| Componente EquiVet | Como se relaciona |
|--------------------|-------------------|
| `app.py` (radiografia) | Futuro: correlacionar achados de imagem com perfil sanguíneo |
| `chat_backend` (Railway) | v3: rotear chamada IA para `/analisar-sangue` autenticado |
| `chat.html` (Centaurovet) | v3: chat poderá citar perfil de sangue do paciente atual |
| Supabase `literatura` | v3: RAG Smith/Adams para fundamentar interpretações |
