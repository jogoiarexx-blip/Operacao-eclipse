# Histórico de versões

## 0.6.0 — Soldados inimigos armados (18/11/2026)

- Novo arquétipo Soldado Corrompido com fuzil 3D visível, capacete, uniforme deteriorado e olhos/núcleo violeta.
- Um Soldado Corrompido participa da primeira emboscada e outro da defesa do posto; Errantes e Rastejador permanecem como inimigos de combate próximo.
- IA de combate à distância: mantém distância, prepara a mira, avisa o jogador, dispara e entra em recuperação.
- Disparos inimigos com traçantes, clarão no cano, dano e verificação de obstáculos para bloquear tiros através de cobertura.
- Carregador de cinco tiros e reserva de vinte cartuchos, com recarga temporizada.
- Soldado ferido tenta buscar cobertura em posições atrás de obstáculos cadastrados.
- O soldado permanece em 3D a longa distância para manter o fuzil visível.
- Checkpoints da emboscada e da defesa restauram corretamente o novo tipo de inimigo.
- Smoke tests ampliados para mira inimiga, dano, esquiva, traçante e recarga.

## 0.5.0 — IA tática, navegação e leitura de combate (18/11/2026)

- Navegação A* em grade estática para Errantes, Rastejador e operador de rádio, com rotas suavizadas e atualização em baixa frequência.
- Percepção por visão e ruído: tiros, passos, corrida e agachamento geram assinaturas sonoras diferentes.
- Agachar reduz o alcance de detecção visual e sonora; inimigos investigam a última posição conhecida em vez de seguir a posição do jogador através de paredes.
- Rastejador ganhou investida curta telegrafada, com janela para esquiva.
- Morte dos inimigos agora tem animação de queda em vez de tombar instantaneamente.
- Mira dinâmica abre com disparos e movimento e fecha ao estabilizar ou mirar.
- Indicador de assinatura sonora no HUD para ensinar furtividade sem tutorial invasivo.
- Testes ampliados para navegação, linha de rota e persistência da missão.

## 0.4.0 — Arsenal secundário, atmosfera e otimização (18/11/2026)

- Pistola de serviço procedural, tiro e recarga próprios; troca com 1/2/roda do mouse.
- Munições separadas, HUD adaptativo e save v3 com migração de campos v1/v2.
- Dispersão de tiro diferenciada para ADS e movimento; sensibilidade reduzida ao mirar.
- Chuva procedural por preset, neblina dinâmica e interferência Janus contextual.
- Detalhes adicionais de caminhões e cenário; props agrupados em `InstancedMesh`.
- Cápsulas ejetadas e marcas de impacto temporárias com limpeza automática.
- Alerta de ataque, indicador de direção de dano e teste de linha de visão no golpe inimigo.
- Overlay de diagnóstico de desempenho com F3.

## 0.3.0 — Gráficos e gameplay (18/11/2026)

- Céu procedural com shader, texturas de terra e estrada geradas no navegador.
- Crateras, poças, marcas de pneus, cercas, placa de posto e anomalias Janus.
- Vegetação/cascalho com `InstancedMesh` e densidade por preset gráfico.
- Fuzil redesenhado com detalhes, recuo e animação de recarga.
- Inimigos com movimentação animada, reação ao impacto e separação de grupo.
- Granadas com física simples, explosão, partículas e dano em área com cobertura.
- Golpe corpo a corpo, lanterna e novas indicações no HUD.
- Movimento do jogador com aceleração e atrito.

## 0.2.0 — Missão 01 completa em nível de protótipo

- Segunda emboscada, escolta, defesa do posto, portão e extração.
- Rastejador, checkpoint, mapa tático, documento Janus e estatísticas.

## 0.1.0 — Protótipo inicial

- Menu, cenário 3D, FPS básico, tiro, IA inicial e primeiros objetivos.
