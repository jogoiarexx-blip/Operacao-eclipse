# OPERAÇÃO ECLIPSE — protótipo jogável 0.1.0

Protótipo de menu principal e Missão 01 — **Cinzas na Estrada**, baseado no GDD `OPERAÇÃO ECLIPSE: A GUERRA DOS ESQUECIDOS`.

## O que já está implementado

- Menu principal com Continuar, Nova campanha, Seleção de capítulo bloqueada, Arsenal/Bestiário, Opções e Créditos.
- Briefing da missão com contexto, objetivo e armamento inicial.
- Cenário 3D procedural: estrada italiana, colinas, árvores, pedras, postes, comboio destruído, abrigo, casa em ruínas e posto avançado.
- FPS com Pointer Lock, movimentação, corrida, agachamento, pulo, mira, tiro, recarga e colisões simplificadas.
- Fuzil semiautomático com carregador de 8 cartuchos e reserva inicial de 40.
- Três Errantes com perseguição e ataque corpo a corpo; dificuldade altera vida, velocidade e dano.
- Resgate do operador de rádio, kits médicos, munição, abertura do portão e conclusão da missão.
- HUD, tutorial contextual, mensagens de rádio, pausa, morte, checkpoint e salvamento local.
- Opções de volume, sensibilidade, FOV, qualidade, dificuldade e exibição de FPS.
- Áudio básico sintetizado via Web Audio API; não há arquivos de áudio externos.

## Como executar

A versão usa Three.js por CDN. É necessário internet na primeira abertura para carregar a biblioteca e as fontes externas. Os arquivos do jogo ficam locais.

**Opção 1 — VS Code**
1. Extraia o ZIP.
2. Abra a pasta `operacao-eclipse` no VS Code.
3. Instale a extensão Live Server.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

**Opção 2 — Python**
1. Abra o terminal dentro da pasta.
2. Execute `python -m http.server 8000`.
3. Acesse `http://localhost:8000` no navegador.

Não abra o arquivo por `file://`: módulos ES e Pointer Lock precisam de um servidor local.

## Controles

| Tecla / ação | Função |
|---|---|
| W A S D | Mover |
| Mouse | Olhar |
| Clique esquerdo | Disparar |
| Clique direito | Mirar |
| Shift | Correr |
| Ctrl | Agachar |
| Espaço | Pular |
| E | Interagir / recolher |
| R | Recarregar |
| Esc | Pausar / liberar mouse |

## Fluxo da Missão 01

1. Avance pela estrada até o comboio destruído.
2. A emboscada dos Errantes é ativada ao entrar na área.
3. Elimine os três Errantes.
4. Localize e resgate o operador de rádio junto ao abrigo.
5. O portão do posto avançado abre; alcance a saída para concluir a missão.

## Publicar no GitHub Pages

1. Crie um repositório e envie o conteúdo desta pasta para a raiz dele.
2. Em **Settings → Pages**, selecione a branch principal e a pasta `/ (root)`.
3. Salve e aguarde a publicação.

O projeto usa caminhos relativos e não exige etapa de build.

## Limitações conhecidas desta build

- Os modelos são geometria procedural low-poly; não são os modelos finais do GDD.
- Animações e sons são provisórios/sintetizados.
- O combate é um protótipo de uma única missão; a campanha de 12 fases ainda não está implementada.
- O menu mantém Seleção de capítulo bloqueada até haver mais missões concluídas.
- A dificuldade é aplicada aos inimigos quando eles são criados; para testar outra dificuldade, reinicie a missão.
- O salvamento é local ao navegador/dispositivo, não sincronizado entre computadores.
- A biblioteca Three.js é carregada de CDN; para funcionamento totalmente offline, será necessário incluir uma cópia local da dependência.

## Próximos marcos recomendados

1. Corrigir e validar colisões e navegação com testes de gameplay em diferentes resoluções.
2. Substituir geometria temporária por modelos GLB e animações definitivas.
3. Implementar transição de LOD 3D para impostores 2D com histerese.
4. Criar áudio ambiente, passos por material e falas temporárias.
5. Implementar a Missão 02 e o fluxo de campanha persistente.
