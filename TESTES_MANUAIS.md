# Roteiro de testes manuais — v0.8.0

## Inicialização e desempenho
- [ ] Abrir o jogo por servidor local e confirmar que o menu aparece sem erros.
- [ ] Iniciar a missão e confirmar estrada, vale ampliado, duas rotas laterais, casas, colinas e posto distante.
- [ ] Testar os presets Baixo, Equilibrado e Alto; observar diferença de nitidez, sombras e densidade de partículas.
- [ ] Abrir `F3` e observar FPS, draw calls e triângulos em cada setor.
- [ ] Confirmar que o jogador não atravessa os limites do vale nem a grade do posto antes da abertura.
- [ ] Testar `Tab`: o mapa deve mostrar comboio, dois repetidores, fazenda e posto.

## Setor 1 — Comboio
- [ ] Avançar até o comboio e confirmar o gatilho da emboscada.
- [ ] Confirmar quatro inimigos: dois Errantes, um Soldado Corrompido e um Rastejador.
- [ ] Usar os caminhões e sacos de areia como cobertura.
- [ ] Confirmar que eliminar os quatro libera o objetivo dos repetidores.

## Setor 2 — Repetidores Janus
- [ ] Ir ao repetidor A pela rota lateral esquerda.
- [ ] Confirmar que a guarda de dois inimigos aparece ao aproximar-se.
- [ ] Confirmar que o prompt de interação não aparece enquanto os defensores estiverem vivos.
- [ ] Eliminar a guarda, pressionar `E` e confirmar que A fica desativado.
- [ ] Ir ao repetidor B pela rota lateral direita e repetir o processo.
- [ ] Morrer depois de desativar apenas um repetidor e confirmar que o checkpoint preserva o progresso.

## Setor 3 — Fazenda e resgate
- [ ] Localizar a fazenda em ruínas e o operador.
- [ ] Resgatar o operador com `E`.
- [ ] Confirmar que o operador acompanha o jogador e contorna obstáculos.
- [ ] Encontrar o documento Janus opcional e conferir o contador.

## Setor 4 — Emboscada da escolta
- [ ] Avançar com o operador até a curva.
- [ ] Confirmar emboscada com soldado armado, Errante e Rastejador.
- [ ] Eliminar os três e confirmar a mensagem de rota liberada.
- [ ] Confirmar que o checkpoint não repete a emboscada depois de concluída.

## Setor 5 — Posto Nébula
- [ ] Chegar ao posto com o operador.
- [ ] Confirmar a primeira onda com quatro inimigos.
- [ ] Eliminar a primeira onda e confirmar a pausa para recarga.
- [ ] Confirmar a segunda onda com cinco inimigos.
- [ ] Eliminar a segunda onda e confirmar que o console de rádio fica disponível.
- [ ] Morrer durante cada onda e confirmar que o checkpoint recria a onda correta.

## Extração
- [ ] Ativar o console com `E`.
- [ ] Confirmar animação do portão.
- [ ] Confirmar que a barreira bloqueia passagem antes de abrir.
- [ ] Cruzar o portão e alcançar o ponto de extração.
- [ ] Conferir tela de conclusão, eliminações, precisão e documento coletado.

## Regressão
- [ ] Trocar entre fuzil e pistola, mirar, disparar e recarregar.
- [ ] Usar granadas, golpe corpo a corpo e lanterna.
- [ ] Testar continuar campanha, reiniciar checkpoint e iniciar nova campanha.
- [ ] Testar migração de um save antigo v0.7.
- [ ] Confirmar vento, disparos, rádio e efeitos ambientais; testar volume zero.
- [ ] Conferir console do navegador sem exceções.

Observação: o teste automatizado não substitui esta execução real em navegador com WebGL e WebAudio.
