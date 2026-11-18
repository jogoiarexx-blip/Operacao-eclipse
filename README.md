# OPERAÇÃO ECLIPSE — A Guerra dos Esquecidos

**Build 0.6.0 · Missão 01: Cinzas na Estrada · preparada para GitHub Pages**

Protótipo de FPS de campanha para navegador em JavaScript + Three.js 0.169.0, baseado no `GDD_REFERENCIA.md`. A missão 01 inclui investigação do comboio, emboscada, resgate, escolta, defesa do posto, extração e tela de conclusão.

## Novidades da versão 0.6.0

### Inimigo armado: Soldado Corrompido
- Novo arquétipo humanoide com fuzil procedural visível nas mãos, capacete, uniforme deteriorado e brilho violeta.
- Entra na primeira emboscada e retorna na defesa do posto; Errantes e Rastejador continuam como ameaças de combate próximo.
- Mantém distância, prepara a mira por cerca de um segundo e só então dispara. O aviso visual dá tempo para o jogador sair da linha de tiro ou buscar cobertura.
- Disparos inimigos usam traçantes, clarão no cano, dano escalonado pela dificuldade e verificação de obstáculos: caminhões, muros e barricadas podem bloquear tiros.
- O soldado tem carregador de 5 tiros e reserva de 20; recarrega antes de voltar a atirar.
- Quando ferido, pode procurar uma posição atrás de obstáculos registrados como cobertura.
- O soldado armado permanece em modelo 3D mesmo à distância para que o fuzil não desapareça na transição para impostor 2D.
- Checkpoints da primeira emboscada e da defesa recriam o tipo correto de inimigo.

### Mantido da versão 0.5.0


### IA e navegação
- Navegação A* em grade construída a partir dos obstáculos do cenário.
- Errantes, Rastejador e Soldado Corrompido contornam caminhões, barricadas, caixas e ruínas em vez de tentar atravessá-los.
- O operador resgatado usa a mesma navegação para acompanhar Raul e reduzir situações de bloqueio.
- Rotas são suavizadas e atualizadas em intervalos controlados para limitar custo de CPU.

### Percepção e furtividade
- Criaturas detectam o jogador por visão e por ruído.
- Disparos têm grande alcance sonoro; corrida gera mais ruído que caminhada; agachar reduz o ruído.
- Agachar também reduz a distância de detecção visual.
- Ao perder o contato, as criaturas investigam a última posição conhecida e depois entram em busca, em vez de rastrear a posição exata do jogador através de paredes.
- Rastejador executa uma investida curta e telegrafada, com oportunidade de esquiva.

### Feedback visual e combate
- Mira dinâmica abre com disparos e movimento e fecha ao estabilizar ou mirar.
- Inimigos caem gradualmente ao morrer, em vez de mudar de pose instantaneamente.
- Indicador de assinatura sonora mostra o risco atual de ser ouvido.
- Mantidos fuzil, pistola, ADS, recarga independente, granadas, golpe corpo a corpo, lanterna, checkpoints e estatísticas.

## Fluxo da Missão 01
1. Investigar o comboio destruído.
2. Sobreviver à emboscada de dois Errantes e um Soldado Corrompido armado.
3. Encontrar e resgatar o operador de rádio.
4. Escoltar o operador até o posto avançado.
5. Defender o posto contra um Soldado Corrompido armado, um Errante e um Rastejador.
6. Atravessar o portão e concluir a missão.

## Controles

| Controle | Ação |
|---|---|
| WASD / mouse | Movimento / olhar |
| Clique esquerdo / direito | Atirar / mirar |
| `1`, `2` ou roda | Trocar fuzil e pistola |
| `R` | Recarregar |
| Shift / Ctrl / Espaço | Correr / agachar / pular |
| `E` | Interagir / coletar |
| `F` / `G` / `Q` | Golpe / granada / lanterna |
| Tab / Esc | Mapa tático / pausa |
| `F3` | Diagnóstico de desempenho |

## Executar localmente

Na pasta do projeto, execute `python -m http.server 8000` e abra `http://localhost:8000`. É necessária conexão com a internet para carregar Three.js pela CDN.

## Publicar no GitHub Pages

1. Envie o conteúdo do ZIP para a raiz do repositório, mantendo `index.html` na raiz.
2. Em **Settings → Pages**, selecione **GitHub Actions**.
3. Envie os arquivos para a branch `main`; `.github/workflows/deploy.yml` publica o site.

## Testes

```bash
node --check src/main.js
node tests/smoke.cjs
```

O smoke test usa simulador mínimo de Three.js/DOM. Ele verifica lógica, não renderiza WebGL. Faça também os testes manuais em `TESTES_MANUAIS.md`.

## Limitações conhecidas
- Modelos e animações ainda são procedurais e provisórios; o fuzil do Soldado Corrompido é uma composição de geometria 3D.
- A navegação A* é uma grade 2D simplificada baseada em colisores circulares; não substitui uma navmesh 3D.
- A percepção usa linha de visão dos objetos registrados como cobertura e ruído simplificado. A busca de cobertura do Soldado Corrompido depende dos obstáculos com colisores cadastrados.
- A campanha 02–12 ainda não está implementada.
- O progresso fica no `localStorage` deste navegador/dispositivo.
- A CDN exige internet; não há modo offline completo.
- Desempenho e compatibilidade WebGL exigem teste em navegadores e GPUs reais.

A história é ficção alternativa, sem representação de batalhas ou operações reais.
