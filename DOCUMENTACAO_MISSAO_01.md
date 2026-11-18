# Documentação técnica — Missão 01 · v0.8.0

## Objetivo da reformulação

A versão 0.7.0 apresentava uma estrada estreita, com cerca de 36 m de largura de limites e aproximadamente 128 m de percurso útil. O ritmo era muito linear: emboscada, resgate, defesa e portão. A versão 0.8.0 amplia o espaço de combate e cria objetivos intermediários que exigem deslocamento, combate, exploração e interação.

A missão continua sendo semi-linear. As rotas laterais se reencontram no caminho principal e não criam um mundo aberto. O HUD apresenta o número da etapa (01/09 a 09/09), progresso visual, distância e direção do objetivo atual.

## Layout do nível

- Área jogável aproximada: x = -47.5 a 47.5 e z = 49 a -189.
- Estrada principal com acostamentos largos.
- Duas rotas de flanqueamento em torno de x = -27 e x = 27.
- Conexões transversais em z = -62 e z = -116.
- Coberturas de sacos de areia, caixas, caminhões, casas em ruínas e crateras.
- Fazenda em ruínas na lateral oeste, onde o operador é encontrado.
- Posto Nébula no setor final, com portão bloqueando a extração até a ativação do rádio.

### Setores

1. **Comboio destruído:** dois caminhões, barricadas e primeira emboscada de quatro inimigos.
2. **Encostas e repetidores:** dois pontos de sabotagem, cada um protegido por um Soldado Corrompido e um inimigo de combate próximo.
3. **Fazenda em ruínas:** resgate do operador e documento opcional do Projeto Janus.
4. **Curva da estrada:** emboscada durante a escolta, com três inimigos.
5. **Posto Nébula:** duas ondas de defesa e console para ativar a transmissão.
6. **Extração:** portão abre e o jogador precisa alcançar o trecho final da estrada.

## Máquina de estados da missão

| Fase | Estado | Condição de avanço |
|---:|---|---|
| 0 | Aproximação | Jogador cruza o gatilho do comboio |
| 1 | Emboscada inicial | Todos os quatro inimigos são eliminados |
| 2 | Repetidores Janus | Os dois repetidores são desativados após eliminar suas guardas |
| 3 | Resgate | Interagir com o operador na fazenda |
| 4 | Escolta | Limpar a emboscada da curva e levar o operador ao posto |
| 5 | Defesa — onda 1 | Eliminar quatro inimigos |
| 6 | Defesa — onda 2 | Eliminar cinco inimigos |
| 7 | Transmissão | Interagir com o console do posto |
| 8 | Extração | Portão abre e jogador alcança z menor que -183.5 dentro da passagem |

### Composição dos encontros

- Emboscada inicial: 2 Errantes, 1 Soldado Corrompido e 1 Rastejador.
- Repetidor A: 1 Soldado Corrompido e 1 Errante.
- Repetidor B: 1 Soldado Corrompido e 1 Errante.
- Emboscada da escolta: 1 Soldado Corrompido, 1 Errante e 1 Rastejador.
- Defesa — onda 1: 2 Soldados Corrompidos, 1 Errante e 1 Rastejador.
- Defesa — onda 2: 2 Soldados Corrompidos, 2 Errantes e 1 Rastejador.

O orçamento total previsto é de aproximadamente 20 inimigos ao longo da missão, mas os encontros são escalonados. Não há intenção de manter todos ativos ao mesmo tempo.

## Interações

### Repetidores Janus

Cada repetidor tem um núcleo violeta, anel de sinal e luz pontual. Ao aproximar-se, a guarda da posição é ativada. O prompt de interação só aparece quando não há defensores vivos próximos. Ao pressionar `E`, o repetidor muda para estado desligado, reduz o brilho e registra o progresso no checkpoint.

### Operador de rádio

O operador é encontrado junto à fazenda. Ao pressionar `E`, seu colisor é desativado, o modelo de resgate é ocultado e o personagem de escolta aparece. O operador usa navegação A* para chegar ao ponto de reunião no posto.

### Console do posto

Após as duas ondas, o console fica visível. Interagir muda a fase para extração e inicia a animação do portão. O jogador não atravessa a barreira enquanto `gateOpen` não for verdadeiro.

## Checkpoints e compatibilidade

O save foi atualizado para schema versão 4. Além dos dados anteriores, agora registra:

- Estado ligado/desligado de cada repetidor.
- Estado de conclusão da emboscada da escolta.
- Número da onda de defesa.
- Posição do operador durante a escolta.
- Armas, munição, granadas, vida, itens coletados, precisão e tempo.

Saves de versões 1, 2 e 3 continuam aceitos e são convertidos para uma fase equivalente. Saves antigos não têm progresso de repetidores; quando a fase antiga já havia passado da emboscada, a migração considera os dois repetidores concluídos para não bloquear o jogador.

## Otimização gráfica

- Árvores: troncos e copas em dois `InstancedMesh`.
- Rochas: um `InstancedMesh` com colisores individuais leves.
- Colinas: um lote instanciado.
- Marcas da estrada e poças: dois lotes instanciados.
- Manchas de estrada, vegetação e entulho: lotes instanciados.
- Preset Equilibrado: DPR máximo 1.0, sombras dinâmicas desligadas.
- Preset Baixo: DPR máximo 0.78, menos vegetação, chuva e poeira.
- Preset Alto: DPR máximo 1.25 e sombras da luz direcional.
- Chuva atualiza apenas a quantidade de partículas desenhadas.
- HUD atualiza a cada ~85 ms durante o jogo.
- Corpos mortos deixam de receber atualização de animação após a queda.

Os valores são limites de qualidade e não uma garantia de FPS. É necessário medir em hardware real.

## Testes automatizados

`tests/smoke.cjs` verifica:
- Dimensão e grade de navegação ampliadas.
- Rotas A* em torno de obstáculos.
- Presets de qualidade e densidade de partículas.
- Emboscada inicial, inimigos armados e munição.
- Desativação dos dois repetidores e salvamento do progresso.
- Resgate, coleta opcional, emboscada de escolta e movimento do operador.
- Duas ondas de defesa, console e extração.
- Migração de saves antigos.
- Rig esquelético, materiais, explosões e áudio.

O teste não substitui validação de renderização, áudio e desempenho no navegador.
