# Publicar Operação Eclipse v0.7.0 no GitHub Pages

1. Extraia o conteúdo deste pacote.
2. Envie todos os arquivos e pastas para a raiz do repositório, incluindo `.github/workflows/deploy.yml` e `.nojekyll`.
3. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
4. Faça push na branch `main` ou execute manualmente o workflow **Publicar Operação Eclipse no GitHub Pages**.
5. Acompanhe **Actions** até o job `deploy` terminar.

O projeto é estático e usa Three.js 0.169.0 via CDN; a página precisa de internet para baixar a biblioteca. Não há etapa de build.

## Teste local
Na raiz do projeto: `python -m http.server 8000`; abra `http://localhost:8000`.

## Verificações
Execute `node --check src/main.js` e `node tests/smoke.cjs`. O smoke test é simulado e não substitui teste gráfico em navegador real.
