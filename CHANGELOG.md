# Changelog — Operação Eclipse

## v0.8.0 — Reestruturação da Missão 01 e otimização
- Ampliada a área de jogo para um vale de combate com rota principal e duas rotas laterais.
- Criados quatro setores: comboio, repetidores, fazenda e posto avançado.
- Adicionados dois objetivos de sabotagem dos repetidores Janus, cada um protegido por uma guarda.
- Adicionada emboscada durante a escolta do operador.
- Defesa do posto agora possui duas ondas (4 e 5 inimigos), console de rádio e extração final.
- Documento Janus e suprimentos opcionais distribuídos pelas rotas laterais.
- Checkpoints guardam estado dos repetidores, progresso da emboscada, onda de defesa e posição do operador.
- Migração de saves das versões 1–3 para o schema 4.
- Árvores, copas, rochas, colinas, marcas de estrada, poças e manchas de terreno convertidas para `InstancedMesh`.
- Reduzido o custo gráfico dos presets: DPR limitado, sombras dinâmicas apenas no Alto e menor densidade de chuva, poeira e vegetação.
- HUD atualizado em intervalos de 85 ms; atualização da chuva acompanha o draw range; corpos mortos deixam de animar após a queda.
- HUD agora informa a etapa atual (01/09 a 09/09), progresso e distância para o objetivo ativo.
- Atualizada documentação, mapa tático e roteiro de testes.

## v0.7.0 — Animação, materiais, explosões e áudio
- Rig esquelético procedural, mãos de primeira pessoa, texturas procedurais, explosões em camadas, iluminação e WebAudio ambiental.

## v0.6.0 — Soldado Corrompido
- Inimigo armado com fuzil, mira, disparos, traçantes, recarga e cobertura.

## v0.5.0 — IA e furtividade
- A*, investigação de ruídos, perseguição, cobertura e investida do Rastejador.

## v0.4.0 — Arsenal
- Pistola secundária, troca de armas, granadas e melhorias de HUD.

## v0.3.0 — Polimento
- Cenário, iluminação, feedback de combate e melhorias de apresentação.

## v0.2.0 — Primeira missão jogável
- Progressão inicial, resgate do operador, checkpoints e conclusão.

### Correção pós-0.8.0 — 18/11/2026
- Corpos dos inimigos permanecem 5 segundos após a morte e são removidos da cena, do array e da memória gráfica.
- Liberação de recursos protege os materiais globais compartilhados entre o cenário e os personagens.
- Corrigida regressão `reloadProgress is not defined` ao iniciar nova campanha.
- Incluído teste de regressão para a limpeza de cadáveres.
