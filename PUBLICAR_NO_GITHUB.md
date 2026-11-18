# Publicar Operação Eclipse no GitHub Pages

Este pacote já está preparado para hospedar o jogo em um site estático. **Não é necessário instalar Node.js nem executar npm para publicar.**

## Método recomendado — GitHub Actions automático

1. Extraia o arquivo `operacao-eclipse-github-pages-v0.2.0.zip` no computador.
2. Entre em https://github.com/new e crie um repositório, por exemplo `operacao-eclipse`. Escolha a branch principal `main`.
3. Abra o repositório e selecione **Add file → Upload files**.
4. Envie o **conteúdo da pasta extraída**: `index.html`, `src/`, `.github/`, `.nojekyll`, `README.md` etc. Atenção: o arquivo `index.html` deve ficar na **raiz** do repositório.
5. Confirme o envio com **Commit changes**.
6. Abra **Settings → Pages** e, em **Build and deployment → Source**, selecione **GitHub Actions**.
7. Abra **Actions** e aguarde a execução de **Publicar Operação Eclipse no GitHub Pages**. Se necessário, use **Run workflow** para disparar manualmente.
8. Ao concluir, acesse o endereço mostrado em **Settings → Pages**. Para um repositório de projeto, normalmente tem o formato `https://SEU-USUARIO.github.io/operacao-eclipse/`.

> Se o GitHub não aceitar a pasta `.github` na interface de upload, faça o envio usando Git ou GitHub Desktop. O arquivo `.github/workflows/deploy.yml` precisa estar preservado para a publicação automática.

## Alternativa — publicação pela branch

Também é possível selecionar **Deploy from a branch** em **Settings → Pages**, branch `main` e pasta `/ (root)`. Nesse modo, a automação do arquivo `deploy.yml` não é necessária. Escolha **um** método de publicação.

## Atualizar o jogo

Substitua os arquivos alterados, faça commit na branch `main` e aguarde a nova publicação. Não altere os caminhos `./src/main.js` e `./src/style.css` sem atualizar `index.html`.

## Solução de problemas

- **Página 404:** confira se `index.html` está na raiz e se o Pages está habilitado. Aguarde o workflow terminar.
- **Tela de carregamento permanente:** confira a conexão e o acesso a `cdn.jsdelivr.net`, pois a biblioteca Three.js é externa.
- **Tela preta / sem 3D:** habilite aceleração de hardware e WebGL no navegador; verifique o console (F12).
- **Mouse não controla a câmera:** clique no jogo para permitir a captura do cursor; `Esc` libera o mouse.
- **Save não aparece em outro PC:** o progresso é local ao navegador/dispositivo.
- **GitHub Pages não atualiza:** veja a execução mais recente na aba **Actions** e recarregue a página sem cache.

## Observação de segurança

O jogo é executado inteiramente no navegador, sem backend e sem coleta de credenciais. Não adicione chaves de API ou senhas ao código público do repositório.
