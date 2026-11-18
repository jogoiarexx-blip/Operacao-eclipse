# OPERAÇÃO ECLIPSE — A Guerra dos Esquecidos

**Build 0.8.0 · Missão 01: Cinzas na Estrada · preparado para GitHub Pages**

FPS de campanha para navegador, desenvolvido em JavaScript + Three.js 0.169.0. Esta versão reformula a primeira missão para ser uma fase de ação mais ampla, com objetivos encadeados, arenas de combate, rotas de flanqueamento e um orçamento gráfico mais controlado.

## O que mudou na v0.8.0

### Fase maior e com objetivos reais
- O vale foi ampliado para aproximadamente 96 m de largura jogável e 230 m de extensão de rota.
- A estrada principal agora se conecta a duas rotas laterais, com coberturas, barricadas, ruínas, casas e posições de combate.
- O percurso tem quatro setores: comboio destruído, repetidores Janus, fazenda em ruínas e posto avançado Nébula.
- A missão deixa de ser apenas eliminar inimigos e resgatar o operador: exige desativar dois repetidores protegidos, escoltar o operador, sobreviver a uma emboscada e defender o posto em duas ondas antes de ativar o rádio e alcançar a extração. O HUD agora exibe etapa 01/09 e uma barra de progresso.
- Documento Janus e caixas de suprimentos permanecem como recompensas opcionais de exploração.

### Sequência de objetivos
1. Avançar até o comboio e sobreviver à emboscada inicial de quatro inimigos.
2. Desativar o repetidor Janus A e o repetidor B. Cada posição tem uma pequena guarda inimiga.
3. Resgatar o operador de rádio na fazenda em ruínas.
4. Escoltar o operador até o posto. Uma emboscada de três inimigos acontece na curva da estrada.
5. Defender o posto contra duas ondas: quatro inimigos na primeira e cinco na segunda.
6. Ativar o rádio de emergência no console do posto.
7. Atravessar o portão e alcançar a zona de extração.

### Otimização de desempenho
- Árvores, copas, rochas, colinas, marcas da estrada, poças e manchas do terreno foram agrupadas com `InstancedMesh` para reduzir chamadas de desenho.
- Perfil Equilibrado limita a escala de renderização a 1.0 e desativa sombras dinâmicas.
- Perfil Baixo usa escala máxima de 0.78, menos vegetação e menos partículas.
- Perfil Alto permite escala até 1.25 e sombras da luz principal.
- Chuva, poeira e vegetação reduzem sua densidade conforme o preset; a atualização da chuva acompanha a quantidade efetivamente desenhada.
- O HUD atualiza em intervalos curtos, em vez de reescrever todos os elementos a cada quadro.
- Corpos inimigos deixam de atualizar a animação após o tempo de queda e são ocultados.

### Mantido das versões anteriores
- Fuzil e pistola com munição independente, ADS, recarga, granadas, golpe corpo a corpo e lanterna.
- Soldado Corrompido armado, Errante e Rastejador com IA, ataques e feedback visual.
- A* em grade, investigação de ruídos, linha de visão, cobertura e projéteis inimigos.
- Rig esquelético procedural, mãos em primeira pessoa, explosões em camadas, materiais procedurais e áudio WebAudio.
- Checkpoints, salvamento local e migração dos saves das versões anteriores.

## Setores e coordenadas de referência

| Setor | Referência aproximada | Função |
|---|---:|---|
| Comboio | z = -20 a -55 | Tutorial de combate e primeira emboscada |
| Repetidor A | x = -29, z = -72 | Combate lateral e sabotagem |
| Repetidor B | x = 30, z = -87 | Segunda posição de sabotagem |
| Fazenda | x = -20.5, z = -110.5 | Resgate do operador e documento opcional |
| Curva da estrada | z = -132 a -144 | Emboscada durante a escolta |
| Posto Nébula | z = -174 | Defesa em duas ondas e console de rádio |
| Extração | z menor que -183.5 | Encerramento da missão |

As coordenadas são referências internas de implementação, não um mapa métrico de navegação real.

## Controles

| Controle | Ação |
|---|---|
| WASD / mouse | Movimento / olhar |
| Clique esquerdo / direito | Atirar / mirar |
| `1`, `2` ou roda | Trocar fuzil e pistola |
| `R` | Recarregar |
| Shift / Ctrl / Espaço | Correr / agachar / pular |
| `E` | Interagir, desativar repetidor, resgatar ou ativar console |
| `F` / `G` / `Q` | Golpe / granada / lanterna |
| Tab / Esc | Mapa tático / pausa |
| `F3` | Diagnóstico de desempenho |

## Executar localmente

Na raiz do projeto:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. É necessária conexão com a internet para carregar Three.js pela CDN.

## Publicar no GitHub Pages

1. Envie o conteúdo do ZIP para a raiz do repositório, mantendo `index.html` na raiz.
2. Em **Settings → Pages**, selecione **GitHub Actions**.
3. Envie os arquivos para a branch `main`; `.github/workflows/deploy.yml` publica o site.

## Testes

```bash
node --check src/main.js
node tests/smoke.cjs
```

O smoke test usa simulador mínimo de Three.js/DOM. Ele verifica a lógica de missão, salvamento, navegação, armas e objetivos; não renderiza WebGL nem mede FPS real. Siga também `TESTES_MANUAIS.md`.

## Limitações conhecidas

- Modelos, rigs e animações são procedurais e estilizados; não há modelos externos GLB nem captura de movimento nesta build.
- As explosões são sprites e malhas em camadas, não simulação volumétrica física.
- A IA usa uma grade A* 2D simplificada, não uma navmesh 3D.
- O áudio é sintetizado por WebAudio; ainda não usa gravações de campo ou mixagem final.
- A Missão 01 é a única missão jogável nesta build; as missões 02–12 ainda não foram implementadas.
- O progresso fica no `localStorage` deste navegador/dispositivo.
- A CDN exige internet; não há modo offline completo.
- O desempenho final precisa ser medido em navegadores e GPUs reais. O ambiente de teste automatizado não substitui a validação WebGL.

A história é ficção alternativa, sem representação de batalhas ou operações reais.
