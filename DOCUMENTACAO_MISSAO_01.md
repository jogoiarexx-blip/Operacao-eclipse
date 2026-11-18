# Documentação técnica — Missão 01 · v0.7.0

## Animação esquelética
Os personagens são construídos proceduralmente com `THREE.Bone` e `THREE.Skeleton`. Malhas rígidas ficam parentadas aos ossos para permitir articulação econômica, sem skinning deformável. O rig contém pelvis, spine, neck, head, shoulders, elbows, wrists, hips e knees.

Estados animados: idle/search, caminhada/avanço, corrida, windup/ataque, aiming, reload, stagger e dead. O Rastejador recebe amplitude maior e cadência mais rápida. O Soldado Corrompido mantém os braços no fuzil, com pequenas variações de recuo e recarga.

## Armas e mãos
Fuzil e pistola têm peças de acabamento adicionais. Mãos de primeira pessoa usam manga, punho, palma e dedos segmentados, parentados ao grupo da arma para acompanhar ADS, sway, recarga e recuo.

## Materiais
`surfaceMat()` gera mapas canvas de cor, roughness e bump para superfícies de pintura, metal, madeira, lona, pedra, reboco, areia e borracha. Não há dependência de imagens remotas.

## Explosões e iluminação
`spawnVolumetricExplosion()` cria sprites billboard de fumaça/fogo, esfera translúcida, anel horizontal e luz pontual com decaimento. A iluminação usa preenchimento frio, luzes quentes de incêndio e cones translúcidos para sugerir feixes atmosféricos. São técnicas aproximadas e leves para navegador.

## Áudio
Após o primeiro gesto do jogador, `initAudio()` inicia WebAudio com vento em loop, rumble grave e ruído Janus. `updateAmbientAudio()` ajusta as camadas por estado da missão e agenda artilharia distante. Disparos inimigos usam panorama estéreo. Não são usados arquivos de áudio externos.

## Limitações
- O rig é articulado por ossos com meshes rígidas; não há deformação de pele/roupa por skinning.
- Explosões são impostores 2D e malhas transparentes em camadas, não volume físico ou raymarching.
- Áudio sintetizado não substitui efeitos gravados e mixagem final.
- A renderização e o áudio devem ser testados em Chrome/Firefox/Edge com WebGL e WebAudio reais.
