# OPERAÇÃO ECLIPSE — A Guerra dos Esquecidos

**Versão 0.2.0 · Missão 01 concluída em nível de protótipo jogável · GitHub Pages**

FPS em primeira pessoa no navegador, ambientado em uma história alternativa de guerra sobrenatural em 1944. O projeto segue o GDD original incluído em `GDD_REFERENCIA.md`.

## Jogar

A Missão 01, **Cinzas na Estrada**, está implementada de ponta a ponta:

1. **Aproximação** — siga pela estrada, aprenda os comandos e investigue o comboio destruído.
2. **Primeira emboscada** — elimine três Errantes; use os veículos como cobertura e recolha munição.
3. **Resgate** — encontre o operador de rádio junto ao abrigo e interaja com `E`.
4. **Escolta** — conduza o operador até o posto avançado; ele segue o jogador.
5. **Defesa final** — enfrente mais dois Errantes e um Rastejador, com aviso antes do ataque.
6. **Extração** — espere a abertura do portão e entre no posto para concluir a missão.

Há um **documento Janus opcional** na estrada lateral, kits médicos, caixas de munição, checkpoints após os encontros principais, estatísticas de conclusão e desbloqueio de replay do capítulo 01.

## Recursos implementados

- Menu principal, briefing, pausa, morte, vitória, créditos e configurações.
- Cenário procedural 3D: estrada, árvores, colinas, ruínas, comboio, barracas, barricadas e posto avançado.
- FPS: WASD, câmera com Pointer Lock, corrida com fôlego, agachamento, salto, ADS, tiro, recarga e dano.
- Um fuzil semiautomático, tiros hitscan com bloqueio por paredes/veículos, munição e feedback de impacto.
- Dois tipos de criaturas: Errante e Rastejador; ataques com preparação visível e recuperação.
- Troca automática entre modelos 3D próximos e impostores 2D distantes, com histerese de distância.
- Operador de rádio que acompanha o jogador após o resgate.
- Checkpoints com inventário, estatísticas e progresso, armazenados no navegador.
- Mapa tático com `Tab`, objetivo com distância, bússola, HUD de vida, fôlego e munição.
- Perfis de qualidade, sensibilidade, FOV, inversão do mouse e redução de balanço da câmera.
- Sons temporários sintetizados com Web Audio, mensagens de rádio em texto e efeitos de fumaça.
- **Sem build, sem banco de dados e sem backend.**

## Controles

| Entrada | Ação |
|---|---|
| `W A S D` | Mover |
| Mouse | Olhar |
| Botão esquerdo | Disparar |
| Botão direito | Mirar (ADS) |
| `Shift` | Correr (consome fôlego) |
| `Ctrl` | Agachar |
| `Espaço` | Pular |
| `E` | Interagir / coletar |
| `R` | Recarregar |
| `Tab` (segurar) | Mapa tático |
| `Esc` | Pausa / libera o mouse |

## Executar localmente

Use um servidor HTTP simples; **não abra por `file://`**.

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. Alternativamente, abra `index.html` com a extensão **Live Server** do VS Code.

O projeto usa Three.js **0.169.0** via import map e CDN (`cdn.jsdelivr.net`). É necessária conexão com a internet para obter a biblioteca. A fonte do Google Fonts é opcional e tem fallback local.

## Publicar no GitHub Pages

Veja [PUBLICAR_NO_GITHUB.md](PUBLICAR_NO_GITHUB.md). O pacote já inclui `.github/workflows/deploy.yml` para publicação automática em pushes na branch `main` e `.nojekyll`.

**Importante:** extraia o ZIP e envie **os arquivos da raiz** (incluindo a pasta `.github`) ao repositório. Não envie apenas o ZIP nem coloque a pasta inteira dentro de outra pasta.

## Estrutura

```text
index.html                     entrada do jogo
src/main.js                    gameplay, IA, mundo, estados e save
src/style.css                  menu, HUD e apresentação
.github/workflows/deploy.yml   GitHub Pages automático
.nojekyll                      desativa processamento Jekyll
GDD_REFERENCIA.md             especificação original
DOCUMENTACAO_MISSAO_01.md     fluxo completo da missão e testes
PUBLICAR_NO_GITHUB.md         instruções de publicação
CHANGELOG.md                  alterações por versão
tests/smoke.cjs                teste de fluxo sem dependências
docs/PLANO_ORIGINAL_0.1.0.md  documento histórico da versão anterior
```

## Testes

```bash
node --check src/main.js
node tests/smoke.cjs
```

O teste de fluxo usa uma simulação simplificada do Three.js e DOM para verificar estados, salvamento e progressão. **Não substitui testar o jogo no navegador com WebGL.**

## Limitações conhecidas

- Os modelos 3D, animações e sons ainda são **provisórios**, não arte final.
- O acompanhante usa navegação local simples e pode precisar de refinamento em obstáculos complexos.
- O impostor 2D distante é um desenho procedural genérico; ainda não há atlas direcional de 4/8 ângulos.
- A Missão 02 e os demais capítulos ainda não estão implementados.
- O save fica no `localStorage` do navegador e não sincroniza entre dispositivos.
- Three.js é carregado de CDN: esta versão **não é totalmente offline**.
- É necessário testar em Chrome/Edge/Firefox e em GPUs reais antes de chamar a build de produção final.

A campanha, o Projeto Janus e os personagens são ficção alternativa. Este repositório não pretende representar operações militares históricas reais.
