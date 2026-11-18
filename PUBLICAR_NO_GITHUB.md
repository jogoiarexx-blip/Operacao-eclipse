# Publicar Operação Eclipse v0.8.0 no GitHub Pages

1. Extraia o conteúdo deste pacote.
2. Envie todos os arquivos e pastas para a raiz do repositório, incluindo `.github/workflows/deploy.yml` e `.nojekyll`.
3. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
4. Faça push na branch `main` ou execute manualmente o workflow **Publicar Operação Eclipse no GitHub Pages**.
5. Acompanhe **Actions** até o job `deploy` terminar.

O projeto é estático. Não há etapa de build. O `index.html` deve permanecer na raiz do repositório. Three.js 0.169.0 é carregado via CDN; o navegador precisa de internet para baixar a biblioteca.

## Teste local

Na raiz do projeto:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`.

## Verificações antes do push

```bash
node --check src/main.js
node tests/smoke.cjs
```

O smoke test verifica a lógica de missão e sistemas com simuladores mínimos; ele não renderiza WebGL. Faça os testes manuais de `TESTES_MANUAIS.md` antes de considerar a versão validada em navegador.
