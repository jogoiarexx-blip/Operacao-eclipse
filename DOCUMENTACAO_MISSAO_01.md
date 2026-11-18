# Missão 01 — Cinzas na Estrada · Build 0.5.0

## Objetivo narrativo
Resgatar o operador de rádio do comboio aliado destruído e alcançar o posto avançado Nébula.

## Etapas
1. Avançar pela estrada até a área do comboio.
2. Sobreviver à primeira emboscada de três Errantes.
3. Localizar e resgatar o operador no abrigo improvisado.
4. Escoltar o operador até a aproximação do posto.
5. Defender o posto de dois Errantes e um Rastejador.
6. Atravessar o portão aberto e concluir a missão.

## Sistemas validados por smoke test
- Menu, briefing, opções e estado de campanha.
- Duas armas com munições independentes, disparo e recarga.
- Granadas, golpe corpo a corpo, lanterna e HUD.
- Grade de navegação e busca A* para desvio de obstáculos.
- Percepção simplificada por visão e eventos sonoros.
- Escolta com rota, checkpoints e compatibilidade com saves legados.
- Defesa final, abertura do portão e tela de conclusão.

## Sistemas que ainda precisam de validação visual manual
- Qualidade da animação de queda dos inimigos.
- Leitura visual da investida do Rastejador.
- Comportamento da IA em torno de todos os destroços.
- Clareza do indicador de assinatura sonora em diferentes resoluções.
- Desempenho WebGL em hardware de entrada.

## Limitações
A navegação é uma grade 2D, não uma navmesh completa. A percepção usa a lista de objetos registrados como cobertura; objetos decorativos não registrados podem não bloquear visão.
