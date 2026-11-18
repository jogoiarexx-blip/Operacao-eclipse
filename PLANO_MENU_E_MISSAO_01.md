# OPERAÇÃO ECLIPSE — Menu principal e Missão 01

**Base:** GDD `OPERAÇÃO ECLIPSE: A GUERRA DOS ESQUECIDOS`, versão 1.0  
**Entrega:** protótipo jogável 0.1.0  
**Motor:** Three.js / WebGL / JavaScript modular  
**Plataforma-alvo:** PC, teclado e mouse

> Este documento separa o que vem diretamente do GDD das decisões de implementação adotadas para tornar a primeira build jogável. Os detalhes adicionais abaixo são decisões de prototipação e podem ser refinados sem alterar a história principal.

---

## 1. Leitura do GDD e decisões de escopo

O GDD estabelece um FPS de campanha solo, com ação tática, horror sobrenatural e sobrevivência leve. A experiência deve combinar armas com peso, ameaças monstruosas, tensão e ação equilibradas e apresentação 3D/2D otimizada.

A primeira missão da campanha é **Cinzas na Estrada**. Seu cenário é uma estrada italiana com um comboio destruído. O objetivo é resgatar um operador de rádio e alcançar o posto avançado. A missão também deve ensinar movimentação, mira, disparo e apresentar a primeira emboscada.

O menu principal previsto no GDD contém: Continuar, Nova campanha, Seleção de capítulo, Arsenal/Bestiário, Opções e Créditos. O fluxo de pausa deve permitir retomar, reiniciar checkpoint, consultar objetivos, controles, opções e voltar ao menu.

### Escopo implementado nesta build

- Menu completo e funcional para as opções disponíveis nesta primeira entrega.
- Briefing da missão 01 antes de entrar no gameplay.
- Cenário 3D procedural, com objetos de guerra e marcos de navegação.
- Um tipo de inimigo ativo: Errante.
- Um fuzil semiautomático, munição, recarga, kit médico e interação.
- Um objetivo principal encadeado em cinco etapas.
- Checkpoint no início e após neutralizar a emboscada; checkpoint atualizado após resgatar o operador.
- Tela de conclusão com estatísticas básicas.

### Fora do escopo desta build

- Missões 02–12, seleção de capítulo desbloqueável e progressão entre capítulos.
- Arsenal completo, melhorias permanentes e bestiário navegável completo.
- Modelos GLB, animações esqueléticas, dublagem e trilha definitivas.
- Transição de inimigos para impostores 2D com atlas direcional. A arquitetura visual está preparada para evolução, mas esta versão mantém os Errantes em 3D.
- Sistema completo de save em nuvem ou sincronização entre dispositivos.

---

## 2. Menu principal

### 2.1 Direção de arte

- **Composição:** título e navegação no terço esquerdo; cenário 3D atmosférico ao fundo.
- **Fundo:** estrada militar, comboio destruído, fumaça e vale enevoado. A câmera permanece em uma posição cinematográfica e faz um movimento lento.
- **Paleta:** carvão, verde militar, cinza azulado, barro e âmbar envelhecido.
- **Acento:** dourado envelhecido para seleção e informação; vermelho escuro para alerta.
- **Tipografia:** display condensada para títulos e botões; condensada simples para dados e instruções.
- **Textura:** vinheta e granulação discreta, sem prejudicar a leitura.

### 2.2 Hierarquia de informação

1. Nome do jogo: **OPERAÇÃO ECLIPSE**.
2. Subtítulo: **A GUERRA DOS ESQUECIDOS**.
3. Frase de venda: “Em 1944, o pior inimigo não está do outro lado da trincheira.”
4. Navegação principal.
5. Identificação de build e aviso de ficção alternativa.

### 2.3 Itens do menu

| Item | Comportamento nesta build |
|---|---|
| Continuar | Retoma o último checkpoint salvo no navegador. Fica desativado sem save válido. |
| Nova campanha | Apaga o save da campanha atual, reinicia recursos e abre o briefing da missão 01. |
| Seleção de capítulo | Bloqueado até que haja mais capítulos implementados. |
| Arsenal / Bestiário | Abre uma ficha resumida do fuzil inicial, Errante e suprimentos. |
| Opções | Volume, sensibilidade, FOV, qualidade gráfica, dificuldade e FPS. |
| Créditos | Identifica o protótipo, seu caráter ficcional e o uso de geometria provisória. |

### 2.4 Briefing pré-missão

**Local e data:** Apeninos, Itália — novembro de 1944.  
**Ordem:** localizar o operador de rádio do comboio aliado e alcançar o posto avançado Nébula.  
**Arma inicial:** fuzil semiautomático, 8 cartuchos no carregador e 40 de reserva.  
**Aviso narrativo:** o sinal de rádio apresenta interferência; não responder a vozes desconhecidas.

O briefing deve ser curto, apresentar a motivação e deixar o jogador iniciar quando estiver pronto.

---

## 3. Missão 01 — Cinzas na Estrada

### 3.1 Premissa

Uma patrulha aliada perdeu contato com um comboio em uma estrada isolada dos Apeninos. O sargento Raul Azevedo recebe a ordem de verificar o local, encontrar o operador de rádio e conduzi-lo ao posto avançado. Ao chegar, Raul encontra veículos destruídos, sinais de luta e criaturas que não correspondem a nenhuma força inimiga conhecida.

### 3.2 Objetivo principal

**Resgatar o operador de rádio e alcançar o posto avançado.**

### 3.3 Ritmo e duração-alvo

| Trecho | Duração-alvo | Função |
|---|---:|---|
| Entrada e deslocamento | 1–2 min | Ensinar movimento e leitura do cenário. |
| Aproximação do comboio | 1–2 min | Construir tensão e apresentar os destroços. |
| Primeira emboscada | 2–4 min | Ensinar mira, tiro, recarga e leitura do Errante. |
| Busca e resgate | 1–2 min | Reduzir ritmo e entregar informação narrativa. |
| Caminho até o posto | 1 min | Encerrar a missão e estabelecer o próximo destino. |

Os tempos são metas de teste, não duração garantida.

### 3.4 Layout espacial

A fase é semi-linear e usa a estrada como eixo de orientação. O jogador pode sair alguns metros do asfalto para contornar veículos, recolher suprimentos e procurar cobertura, mas o caminho principal conduz ao abrigo do operador e ao posto avançado.

**Setor A — Estrada de aproximação**
- Posição inicial do jogador em uma curva da estrada.
- Colinas, árvores, pedras, postes telegráficos e névoa limitam a visão distante.
- A estrada deve ficar visualmente legível, mesmo com o cenário destruído.
- Tutorial de WASD, mouse e corrida.

**Setor B — Comboio destruído**
- Dois caminhões militares avariados atravessam parcialmente a estrada.
- Sacos de areia, caixas, destroços e fumaça oferecem cobertura e leitura de escala.
- O primeiro kit médico fica na lateral esquerda da estrada.
- A caixa de munição fica próxima ao segundo veículo.
- Ao entrar na área, a emboscada é ativada.

**Setor C — Abrigo improvisado**
- Pequena cobertura de campanha próxima a uma casa parcialmente destruída.
- O operador está caído ao lado do rádio.
- O marcador de interação aparece somente quando o jogador está próximo e a emboscada foi neutralizada.
- A interação resgata o operador, atualiza o objetivo e grava um checkpoint.

**Setor D — Posto avançado**
- Portão militar com guarita e barreira metálica.
- O portão é liberado após o resgate.
- O jogador atravessa a entrada para concluir a missão.
- O encerramento apresenta estatísticas e informa que a missão seguinte ainda está em produção.

---

## 4. Sequência de gameplay e gatilhos

### Etapa 1 — Avance até o comboio

- Objetivo na HUD: **AVANCE ATÉ O COMBOIO DESTRUÍDO**.
- O jogador aprende movimentação, corrida e leitura do marcador de objetivo.
- Uma fala de rádio apresenta a ordem de resgate.
- O encontro começa quando o jogador alcança a zona do comboio.

### Etapa 2 — Primeira emboscada

- Três Errantes entram em combate a partir de posições laterais e da área próxima aos veículos.
- Objetivo na HUD: **ELIMINE OS ERRANTES · 0 / 3**.
- Tutorial: botão direito para mirar, botão esquerdo para disparar e R para recarregar.
- O Errante avança em curta distância e tenta atingir o jogador.
- Cabeça e núcleo violeta são pontos de dano destacados; a silhueta e o brilho do núcleo ajudam a identificar a ameaça.
- A dificuldade modifica vida, velocidade e dano, não apenas a quantidade de inimigos.

### Etapa 3 — Área segura

- Após eliminar os três Errantes, a HUD muda para **RESGATE O OPERADOR DE RÁDIO**.
- Uma fala de rádio direciona o jogador ao abrigo.
- O jogador pode recolher kit médico e munição antes de interagir.
- O operador é resgatado com a tecla E.

### Etapa 4 — Resgate confirmado

- O marcador do operador desaparece.
- O portão do posto avançado abre.
- A HUD muda para **ALCANCE O POSTO AVANÇADO**.
- O checkpoint passa a registrar o resgate, a posição e os recursos atuais.
- A comunicação do operador antecipa que as criaturas vieram da encosta, sem revelar ainda o Projeto Janus.

### Etapa 5 — Extração

- O jogador percorre o trecho final da estrada.
- Ao atravessar a entrada do posto, a missão termina.
- A tela apresenta Errantes eliminados, precisão, vida restante e confirmação do resgate.

---

## 5. Inimigo da primeira missão — Errante

**Função:** ameaça básica de combate corpo a corpo.  
**Comportamento:** persegue o jogador e tenta se aproximar para atacar.  
**Leitura visual:** humanoide deformado, roupa escura, silhueta irregular e núcleo violeta discreto no peito.  
**Ponto fraco:** cabeça e núcleo.  
**Apresentação:** modelo low-poly 3D durante o combate próximo.

| Dificuldade | Vida de referência | Velocidade | Dano por ataque |
|---|---:|---:|---:|
| Recruta | 45 | 1,35 | 8 |
| Soldado | 58 | 1,65 | 11 |
| Veterano | 72 | 1,90 | 15 |
| Pesadelo | 88 | 2,15 | 19 |

Os valores acima são parâmetros iniciais de protótipo e precisam de testes de balanceamento.

---

## 6. Arma inicial e recursos

### Fuzil semiautomático
- Carregador: 8 cartuchos.
- Reserva inicial: 40 cartuchos.
- Disparo: hitscan com raycast.
- Mira: reduz FOV e aproxima o enquadramento da arma.
- Recarga: 1,55 s nesta build.
- Recuo: deslocamento visual curto da arma e da câmera.

### Recursos
- Kit médico: restaura até 45 pontos de vida, respeitando o máximo de 100.
- Caixa de munição: acrescenta até 24 cartuchos de reserva, respeitando o limite de 80.
- Os itens são recolhidos com E quando o jogador está próximo.

---

## 7. HUD e feedback

- Identificação da missão no topo esquerdo.
- Objetivo atual no topo central.
- Bússola simplificada no topo direito.
- Vida e barra de condição no canto inferior esquerdo.
- Munição atual, reserva e status de recarga no canto inferior direito.
- Mira central e marcador de acerto.
- Prompt contextual para interação.
- Toasts de tutorial e mudanças de estado.
- Legenda de rádio identificada pela origem.
- Flash de dano discreto nas bordas.
- Pausa pelo Esc e liberação de Pointer Lock.

A interface não deve depender exclusivamente de cor para transmitir informação. Os textos de objetivo e os símbolos também indicam os estados.

---

## 8. Checkpoints e salvamento

- O início da missão registra o estado inicial.
- A neutralização da emboscada registra o avanço para a etapa de resgate.
- O resgate do operador registra o objetivo concluído e o novo ponto de retorno.
- O save usa `localStorage` e versão de schema.
- O botão Continuar fica disponível quando existe um save válido da missão 01.
- O salvamento é local ao navegador e não é compartilhado automaticamente entre dispositivos.

---

## 9. Critérios de aceite da primeira entrega

- O menu abre sem erro e os botões disponíveis executam suas ações.
- Nova campanha abre o briefing e inicia a missão.
- O mouse é capturado pelo Pointer Lock durante o gameplay e liberado na pausa.
- WASD, mouse, mira, tiro, recarga, interação e pausa respondem.
- A colisão impede atravessar os limites do cenário e os principais objetos sólidos.
- A emboscada ativa uma única vez e contém três Errantes.
- O objetivo só avança após os três inimigos serem eliminados.
- O operador só pode ser resgatado após a emboscada.
- O portão só abre após o resgate.
- A missão só termina ao alcançar o posto avançado.
- Morte retorna ao último checkpoint.
- O save permite continuar a partir do checkpoint registrado.
- A HUD e as opções permanecem legíveis em 16:9 e em janelas menores.

---

## 10. Próximas melhorias técnicas

1. Testar e refinar a colisão dos veículos e dos inimigos para evitar bloqueios em caminhos estreitos.
2. Criar uma máquina de estados formal para o Errante: Dormant, Investigate, Chase, Attack, Recover e Dead.
3. Substituir os modelos temporários por GLB com animações de idle, caminhada, corrida, ataque, dano e morte.
4. Implementar o LOD 3D/2D com atlas direcional e histerese.
5. Trocar o áudio sintetizado por bibliotecas de passos, ambiente, disparo, impacto e rádio.
6. Adicionar carregamento por setor e perfil de telemetria para FPS, draw calls e tempo de frame.
7. Realizar testes reais em hardware baixo, equilibrado e alto antes de fixar os valores de orçamento de performance.

---

## Adendo de produção — v0.8.0

A avaliação do protótipo apontou três problemas: fase estreita, ritmo muito linear e custo gráfico alto em relação à quantidade de gameplay. A missão foi reestruturada em uma área de combate semi-linear com duas rotas laterais e quatro setores.

### Novos objetivos
- Neutralizar a emboscada do comboio.
- Desativar os repetidores Janus A e B, cada um com defensores.
- Resgatar o operador na fazenda.
- Escoltar o operador e neutralizar uma emboscada na curva.
- Defender o posto em duas ondas.
- Ativar o rádio e alcançar a extração.

### Critério de direção
A campanha continua linear em escala macro, mas os encontros deixam de acontecer em um corredor único. Cada arena oferece cobertura e pelo menos uma rota de flanqueamento. A próxima missão só deve ser produzida depois de validar ritmo, navegação, legibilidade de objetivos e desempenho desta fase.

### Critério de desempenho
A qualidade Equilibrada deve ser o ponto de partida. Objetos repetidos são instanciados, sombras dinâmicas ficam restritas ao preset Alto e a resolução interna é limitada por preset. O overlay F3 permite comparar draw calls, triângulos e FPS durante os encontros.
