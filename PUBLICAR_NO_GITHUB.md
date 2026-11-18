# Publicação no GitHub Pages — Operação Eclipse 0.6.0

1. Extraia o ZIP.
2. Envie os arquivos e pastas internos para a raiz do repositório GitHub. A estrutura deve manter `index.html`, `src/`, `assets/` e `.github/workflows/deploy.yml` na raiz.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **GitHub Actions** como Source.
5. Faça push para `main` ou execute manualmente o workflow **Publicar Operação Eclipse no GitHub Pages** na aba Actions.
6. Aguarde a conclusão do workflow e abra o endereço publicado indicado pelo GitHub.

## Atualizar uma publicação existente
Substitua os arquivos da versão anterior pelos arquivos desta versão e envie o commit para `main`. Não coloque o conteúdo dentro de uma subpasta: `index.html` precisa ficar na raiz do repositório.

## Executar localmente
Na raiz do projeto, execute `python -m http.server 8000` e acesse `http://localhost:8000`. Não abra `index.html` diretamente via `file://`.

## Dependências externas
Three.js 0.169.0 é carregado por import map da CDN jsDelivr. Portanto, o primeiro carregamento precisa de internet.
