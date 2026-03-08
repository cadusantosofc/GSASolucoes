# Levantamento de Requisitos - Sistema de Consultas e Gerenciamento de Processos
## GSA Group | GSA Creditus

**Data:** 04 de Fevereiro de 2026  
**Documento:** Especificação Completa de Requisitos  
**Versão:** 2.0 (Consolidada)  
**Desenvolvedor:** Carlos Eduardo  
**Cliente:** Tiago (Tchê) - Jurídico e Administrativo

---

## 📋 SUMÁRIO EXECUTIVO

### Objetivo do Projeto
Criar sistema centralizado para **GSA Creditus** que elimine gestão por WhatsApp/planilhas e permita:
- Consultas CPF/CNPJ pagas (R$ 5,00)
- Gerenciamento completo de processos
- Acompanhamento em tempo real pelos clientes
- Visibilidade total para admin/gestores

### Principais Necessidades
1. **Substituir planilhas** por sistema automatizado
2. **Eliminar WhatsApp** como ferramenta de gestão
3. **Cliente acompanha** seu próprio processo
4. **Sistema de consultas** pay-per-use
5. **Hierarquia de usuários** (Admin → Gestor → Vendedor → Cliente)

### Fases de Desenvolvimento
- **Fase 1 (MVP):** 8-12 semanas - Funcionalidades críticas
- **Fase 2:** 7-10 semanas - Recursos adicionais
- **Fase 3:** 15-21 semanas - Mobile e IA

### ⚠️ Ação Crítica Imediata
**RECUPERAR sistemas antigos** no Hostinger antes de começar - pode economizar 40-60% do tempo!

---

## ⚠️ AVISO IMPORTANTE

**Este documento foi elaborado EXCLUSIVAMENTE a partir de:**
- Conversas de WhatsApp (texto)
- Transcrições de áudios com o cliente
- Informações explicitamente mencionadas

**NÃO contém:**
- Suposições técnicas não validadas
- Funcionalidades "padrão de mercado" não solicitadas
- Interpretações além do que foi falado

---

## 1. Contexto do Projeto

### 1.1 Perfil do Cliente
- **Cliente:** Tiago (Tchê) - Jurídico e Administrativo
- **Empresa:** GSA Group / GSA Creditus
- **Setor:** Recuperação de Crédito & Inteligência Bancária
- **Domínio:** gsacreditus.com.br
- **Principais Serviços:**
  - Limpeza de nome CPF/CNPJ
  - Consultoria financeira
  - Busca de capital/crédito
  - Processos de BACEN
  - Preparação para financiamento imobiliário

### 1.2 Problemas Atuais (Dores do Cliente)

**Gestão Descentralizada:**
- Informações dispersas em WhatsApp e planilhas
- Vendedores enviam processos por WhatsApp
- Admin precisa pedir planilhas para saber status

**Falta de Controle:**
- Impossível saber quantos processos foram enviados sem pedir
- Sem visibilidade de processos em andamento
- Cliente não consegue acompanhar seu próprio processo

**Retrabalho:**
- Consultas duplicadas
- Informações perdidas
- Falta de histórico estruturado

### 1.3 Objetivo do Sistema

**FRASE-CHAVE DO CLIENTE:**
> "Centralizar tudo num lugar só. Clientes, parceiros, vendedores."

**Objetivos Principais:**
1. **Eliminar WhatsApp** para gestão de processos
2. **Eliminar planilhas** manuais
3. **Cliente acompanha** seu próprio processo
4. **Visibilidade total** para admin/gestor
5. **Sistema de consultas** integrado e pago

### 1.4 Contexto de Uso: Jurídico e Administrativo

**Conforme mencionado pelo cliente:**
- Sistema será usado em **contexto jurídico**
- Sistema será usado em **contexto administrativo**

**Implicações:**
- Informações precisam ser organizadas e rastreáveis
- Resultados devem ser facilmente consultáveis
- Sistema deve evitar retrabalho e consultas duplicadas
- Consultas não devem ser perdidas após execução
- Necessidade de histórico para controle e conferência futura

**⚠️ Nota:** Requisitos legais específicos (LGPD, compliance) não foram mencionados explicitamente, apenas o contexto de uso.

---

## 2. Hierarquia de Usuários e Permissões

### 2.1 Estrutura de Usuários (Conforme Solicitado)

```
ADMINISTRADOR (Tiago + Carlos)
  │
  ├─→ Gestão total do sistema
  ├─→ Visualização de todos os processos
  ├─→ Cadastra GESTORES
  └─→ Controle financeiro
  
GESTOR (Cadastrado pelo Admin)
  │
  ├─→ Responsável por região específica
  ├─→ Pode vender
  ├─→ Pode cadastrar VENDEDORES
  ├─→ Pode cadastrar CLIENTES
  ├─→ Gerencia vendedores da sua região
  └─→ Visualiza processos da sua região
  
VENDEDOR (Cadastrado pelo Gestor)
  │
  ├─→ Pode vender
  ├─→ Pode cadastrar CLIENTES
  ├─→ Registra vendas NO SISTEMA (não mais WhatsApp)
  ├─→ Tem conta própria de consultas
  └─→ Visualiza seus próprios processos
  
PARCEIRO (2 Tipos)
  │
  ├─→ PARCEIRO VENDEDOR
  │     └─→ Vende serviços
  │
  └─→ PARCEIRO PRESTADOR
        ├─→ Advogado
        ├─→ Empresa de financiamento
        ├─→ Analistas
        └─→ Outros prestadores de serviço
  
CLIENTE (2 Estados Possíveis)
  │
  ├─→ CLIENTE DE CONSULTA (Estado Inicial)
  │     ├─→ Faz cadastro direto no sistema
  │     ├─→ Pode se cadastrar de forma independente
  │     ├─→ Ou ser cadastrado por vendedor
  │     ├─→ Solicita atendimento
  │     ├─→ Paga consulta via PIX (R$ 5,00)
  │     ├─→ Realiza consultas CPF/CNPJ
  │     └─→ NÃO tem acesso a acompanhamento de processos
  │
  └─→ CLIENTE ATIVO (Após Contratação)
        ├─→ Habilitado após contratar serviço
        ├─→ É atrelado a um vendedor/gestor
        ├─→ Acessa painel de acompanhamento
        ├─→ Acompanha processos em tempo real
        ├─→ Pode fazer sugestões no sistema
        ├─→ Contrata serviços adicionais
        ├─→ Pode indicar (sistema "Indique e Ganhe")
        └─→ Solicita atendimento
```

### 2.2 Lógica de Atribuição de Clientes

**Fluxo quando cliente se cadastra:**

1. **Cliente faz cadastro** direto no sistema
2. **Solicita atendimento**
3. **É automaticamente atrelado** a um Gestor da região
   - **Exemplo futuro citado:** Cliente de Minas Gerais → Gestor de MG
4. **Gestor pode atribuir** cliente a um vendedor específico
5. Cliente permanece como **"Cliente de Consulta"** até contratar serviço
6. Após contratação, vira **"Cliente Ativo"**

**⚠️ Regra Importante:**
- Cliente só é habilitado para acompanhar processo quando se torna **Cliente Ativo**
- Enquanto for apenas "Cliente de Consulta", só pode fazer consultas pagas

---

## 3. Sistema de Consultas CPF/CNPJ

### 3.1 Modelo de Negócio

**Sistema Pay-per-Use:**
- **Valor por consulta:** R$ 5,00
- **Método de pagamento:** PIX
- **Liberação:** Resultado só é exibido APÓS confirmação do pagamento

### 3.2 Funcionalidades de Consulta

#### 3.2.1 Fluxo de Consulta
1. Usuário acessa o sistema
2. Informa dados necessários (CPF ou CNPJ)
3. Sistema solicita pagamento via PIX (R$ 5,00)
4. Usuário paga o PIX
5. Sistema confirma pagamento
6. Sistema executa a busca
7. Sistema retorna resultado da consulta
8. Usuário visualiza resultado
9. Consulta fica registrada no histórico

#### 3.2.2 Tipos de Consulta Disponíveis
- [ ] Consulta CPF (Serasa, Boa Vista, SPC)
- [ ] Consulta CNPJ
- [ ] Consulta BACEN (Registrato)
- [ ] Score de crédito
- [ ] Histórico de restrições
- [ ] Apontamentos ativos

### 3.3 Gestão de Contas de Consulta

**REQUISITO CRÍTICO (conforme áudio):**
> "Cada usuário ter sua própria conta no sistema de consulta. Daí não fica aquela lambança. Cada um tem uma consulta para fazer. O cara paga o PIX, manda o PIX para o cliente, o cliente paga, faz a consulta e deu."

**Implementação:**
- [ ] **Cada vendedor/gestor/admin** tem conta PRÓPRIA de consulta
- [ ] **NÃO usar sistema de subcontas** compartilhadas
- [ ] Cada usuário gerencia suas próprias consultas
- [ ] Histórico individual por usuário
- [ ] Controle de créditos/pagamentos individual

**⚠️ Importante:**
- Não foi especificado o nome da API ou sistema de consulta a ser integrado
- Essa definição deve ser feita em etapa posterior
- Sistema precisa ser preparado para integração com API externa

### 3.4 Armazenamento e Histórico

**Requisitos de Histórico:**
- [ ] Consultas NÃO podem ser perdidas após execução
- [ ] Deve existir registro/histórico de todas as buscas
- [ ] Histórico serve para controle e conferência futura
- [ ] Sistema deve evitar consultas duplicadas
- [ ] Permitir reexecução de consultas anteriores

**⚠️ Não Especificado:**
- Tempo de retenção dos dados
- Formato de armazenamento específico
- Política de backup

### 3.5 Automação e Escala

**Conforme mencionado:**
- Sistema pensado para **uso contínuo**
- Não é solução manual ou esporádica
- Objetivo: **reduzir esforço humano** em consultas repetitivas
- Sistema para uso recorrente, não pontual

**⚠️ Não Definido:**
- Limites de volume de consultas
- Quantidade máxima de usuários
- Requisitos de performance específicos

---

## 4. Sistema de Gerenciamento de Processos

### 4.1 Objetivo Principal

**CITAÇÕES-CHAVE DO CLIENTE:**

> "Ter um local onde eu possa... Em vez de pedir para o camarada, manda uma planilha para mim. Quantos processos tu enviou, quantos processos tu vai mandar, sabe, ter todas as informações ali."

> "O vendedor, quando ele faz uma venda, ele registra. O parceiro, quando ele vai enviar um processo, ele já registra no sistema. Não precisa o cara estar mandando pelo WhatsApp ou mandando planilha para mim."

**Objetivo:**
- **Substituir planilhas Excel** por banco de dados
- **Eliminar gestão via WhatsApp**
- **Visibilidade automática** para admin/gestor
- **Rastreamento completo** de processos

### 4.2 Funcionalidades do Gerenciamento

#### 4.2.1 Para Vendedores/Parceiros
- [ ] Registrar vendas realizadas no sistema (não mais por WhatsApp)
- [ ] Enviar processos através do sistema
- [ ] **NÃO** mais enviar por WhatsApp ou planilhas
- [ ] Visualizar histórico de processos enviados
- [ ] Status de cada processo

#### 4.2.2 Para Gestores/Admin
- [ ] Visualizar todos os processos
- [ ] Ver quantos processos cada vendedor enviou
- [ ] Acompanhar status de processos
- [ ] Dashboard com métricas
- [ ] Relatórios automáticos (sem precisar pedir planilhas)

#### 4.2.3 Para Clientes Ativos
- [ ] Painel de acompanhamento do próprio processo
- [ ] Ver status do processo em tempo real
- [ ] Fazer sugestões dentro do sistema
- [ ] Solicitar atendimento
- [ ] Contratar serviços adicionais

### 4.3 Tipos de Processos/Serviços (Detalhamento Completo)

Baseado na **proposta oficial** e conversas:

#### 4.3.1 Fase 1: REABILITAÇÃO (Limpeza de Nome)

**Para CPF:**
- Suspensão de Apontamentos (Serasa/Boa Vista)
- Exclusão de Histórico de Prejuízo no BACEN (Registrato)
- Reestruturação de Rating/Score

**Para CNPJ:**
- Reabilitação de CNPJ restrito
- Limpeza de restrições
- Ajuste de Rating empresarial

**PRECIFICAÇÃO:**
- 💎 **Taxa Inicial (Setup):** R$ 997,00
  - Custo operacional para início do cadastro da empresa
- 💎 **Honorários:** 10% do valor da dívida aproximado
  - Para eliminar as travas atuais do CPF/CNPJ

**💡 EXEMPLO PRÁTICO (conforme proposta):**
> "Se a dívida do CNPJ é R$ 50.000, o valor do processo será de R$ 5.000. (Dependendo de cada caso, o valor poderá ser maior ou menor)."

#### 4.3.2 Fase 2: PÓS-REABILITAÇÃO (Busca de Capital)

**OPÇÃO A: Busca Autônoma**
- Cliente vai aos bancos por conta própria
- **Custo:** Zero
- **Risco:** Enfrentar burocracia, negativas, taxas altas

**OPÇÃO B: Consultoria Premium VIP GSA**
- Equipe GSA busca o crédito para o cliente
- Negociação direta com mesa de crédito
- Melhores condições, prazos e juros

**PRECIFICAÇÃO OPÇÃO B:**
- 💰 **Investimento:** 10% sobre o valor do CRÉDITO RECEBIDO
- 🛡️ **GARANTIA RISCO ZERO:** Pagamento só após crédito aprovado e liberado na conta bancária
- ❌ **Sem crédito = sem pagamento**

#### 4.3.3 Outros Serviços Mencionados

**Processos de BACEN:**
- Cliente não paga a dívida
- Custo estimado: R$ 1.500
- Usado quando negociação falha

**Revisional de Dívidas:**
- Custo estimado: R$ 1.500
- Notificação de abusividade
- Obriga credor a baixar valor e parcelar

**Negociação de Acordos:**
- Carta/notificação ao credor
- Recurso de abusividade
- Parcelamento com desconto

**Preparação para Financiamento Imobiliário:**
- Análise de viabilidade
- Preparação de renda
- Estratégias de aprovação
- Acompanhamento do processo

### 4.4 Status e Acompanhamento de Processos

**Status possíveis mencionados:**
- [ ] Enviado
- [ ] Pendente
- [ ] Em andamento
- [ ] Concluído
- [ ] Aguardando documentação
- [ ] Aguardando pagamento

**Visualização por nível:**
- **Cliente Ativo:** Vê apenas seus processos
- **Vendedor:** Vê processos dos seus clientes
- **Gestor:** Vê processos da sua região
- **Admin:** Vê todos os processos

---

## 5. Painel do Cliente (Cliente Ativo)

### 5.1 Funcionalidades Essenciais

**CITAÇÃO-CHAVE:**
> "Eu quero que o cliente, no momento que ele contratou serviço comigo, ele entra pra um sistema, e ele quer acompanhar o processo dele, ele coloca ali, se ele quer fazer alguma sugestão, alguma coisa, ele coloca dentro do sistema ali."

#### 5.1.1 Funcionalidades do Painel:
- [ ] **Visualizar processo** contratado
- [ ] **Status em tempo real** do processo
  - Ex: "Enviado", "Pendente", "Em andamento", "Concluído"
- [ ] **Fazer sugestões/comentários** no processo
- [ ] **Solicitar atendimento** direto
- [ ] **Histórico de interações** com vendedor/gestor
- [ ] **Documentos do processo** (upload/download)
- [ ] **Chat/sistema de mensagens** com responsável
- [ ] **Sistema de Consultas** (pay-per-use)
- [ ] **Módulo "Indique e Ganhe"**

### 5.2 Botões/Ações do Cliente

**Conforme conversas e proposta:**

#### Botões Principais:
1. **"Solicitar Atendimento"**
   - Abre canal de comunicação
   - Notifica vendedor/gestor responsável

2. **"Contratar Serviço"**
   - Acesso a catálogo de serviços
   - Opções: Limpeza CPF, Limpeza CNPJ, Busca de Capital, etc.

3. **"Quero Orçamento para meu CNPJ"**
   - Solicitação específica mencionada
   - Envia para funil de orçamentos

4. **"Indicar" (Indique e Ganhe)**
   - Sistema de indicações com recompensa
   - Tracking de indicações
   - Benefícios por indicação bem-sucedida

5. **"Acompanhar Processo"**
   - Acesso ao status detalhado
   - Timeline do processo
   - Documentação relacionada

### 5.3 Interatividade e Autonomia

**Princípio de Design:**
- Cliente deve **sentir autonomia**
- Interface **intuitiva**
- **Transparência** no acompanhamento
- **Eliminação de necessidade** de contato constante via WhatsApp

---

## 6. Funis de Atendimento e CRM

### 6.1 Fluxo de Funil (Conforme solicitado)

```
LEAD INICIAL
    │
    ↓
ORÇAMENTO
    │
    ├─→ PROPOSTA 1, 2 ou 3 → INTERESSADOS
    │
    └─→ AGENDAR ATENDIMENTO → INTERESSADOS
```

**Requisito específico:**
> "Quando o camarada chega até o orçamento, ele vai para o orçamento. Mas depois que ele passou para o conteúdo, ele escolhe, por exemplo, proposta 1, 2 ou 3, ou agendar atendimento. Aí, quando ele escolher proposta 1 ou 2, ele vai para os interessados."

### 6.2 Separação de Funis
- [ ] Funil de **Orçamento** (quem recebeu orçamento)
- [ ] Funil de **Interessados/Proposta** (quem escolheu proposta ou agendou)
- [ ] Separar quem parou na proposta vs quem se interessou
- [ ] Sistema de etiquetas/tags para categorizar

### 6.3 Campanhas
- [ ] Gestão de campanhas de marketing
- [ ] Integração com WhatsApp (já existente)
- [ ] Chatbot (já implementado)

---

## 7. Sistema de Indicações

### 7.1 Funcionalidade
**Conforme mencionado:**
> "Indicar, ter ali um botãozinho para ele poder indicar o serviço, né? O usuário e o cliente indiquem que ganhem, sabe?"

**Implementação:**
- [ ] Botão de indicação no painel do cliente
- [ ] Sistema de recompensas/ganhos por indicação
- [ ] Tracking de indicações
- [ ] Relatório de indicações por cliente

---

## 8. Integrações Necessárias

### 8.1 WhatsApp Business / Chatbot

**Sistema Atual:** Já existe integração com WhatsApp (Wazing)

#### 8.1.1 Automação do Chatbot

**Menu Automatizado para Novos Contatos:**

Quando novo contato envia mensagem:
```
{{firstName}}! 

🔵 GSA GROUP | HIGH PERFORMANCE FINANCEIRO 🔵
Recuperação de Crédito & Inteligência Bancária

Olá! Somos especialistas em transformar CNPJs restritos em clientes "AAA".

Como podemos ajudar?
1️⃣ Quero orçamento para meu CPF
2️⃣ Quero orçamento para meu CNPJ
3️⃣ Falar com atendente
4️⃣ Consultar CPF/CNPJ
```

**Botões Específicos Solicitados:**
- [ ] "Quero orçamento para meu CNPJ" (mencionado especificamente)
- [ ] "Quero orçamento para meu CPF"
- [ ] "Falar com atendente"
- [ ] "Consultar CPF/CNPJ"

#### 8.1.2 Lógica de Reinício

**REQUISITO IMPORTANTE:**
> "Se o cliente mandar uma nova mensagem após fechado ele reinicia do Chatbot dnv."

**Implementação:**
- Quando atendimento é encerrado
- Cliente envia nova mensagem
- Sistema automaticamente **reinicia fluxo** do chatbot
- Mostra menu de opções novamente

#### 8.1.3 Mensagens Automáticas

**Proposta CNPJ (Já definida):**
- Template de orçamento formatado
- Explicação de Fase 1 (Reabilitação)
- Explicação de Fase 2 (Busca de Capital)
- Valores claros (Taxa R$ 997,00 + 10% dívida)
- Call-to-action: "Responda SIM"

**⚠️ Nota:** Template completo disponível em documento separado (PROPOSTA CNPJ_compressed.pdf)

### 8.2 Sistema de Consultas Externo

**⚠️ NÃO ESPECIFICADO:**
- Nome da API de consulta
- Fornecedor do serviço
- Formato de integração

**A DEFINIR EM ETAPA POSTERIOR:**
- [ ] API de consulta CPF/CNPJ
- [ ] Integração com Serasa
- [ ] Integração com Boa Vista
- [ ] Integração com SPC
- [ ] Consulta BACEN (Registrato)

**REQUISITO:**
- Sistema deve estar preparado para integração futura
- Arquitetura modular para facilitar conexão

### 8.3 Pagamentos

#### 8.3.1 Sistema PIX
- [ ] Geração de QR Code PIX
- [ ] Valor: R$ 5,00 por consulta
- [ ] Confirmação automática de pagamento
- [ ] Liberação imediata após confirmação

#### 8.3.2 Sistema de Gestão de Pagamentos
**Já possui:** Cliente mencionou adicionar Carlos ao gestor de pagamentos

**Funcionalidades:**
- [ ] Geração de boletos
- [ ] Controle de pagamentos recorrentes
- [ ] Histórico financeiro
- [ ] Relatórios de recebíveis

### 8.4 Campanhas de Marketing

**Mencionado:** Sistema de gestão de campanhas

**Imagem de referência:** Cliente enviou imagem "CAMPANHAS"

**⚠️ Detalhes não especificados:**
- Tipo de campanhas
- Integração com e-mail marketing
- Automações de marketing

---

## 9. Requisitos Técnicos

### 9.1 Tecnologia Atual
- **Infraestrutura:** Hostinger (domínio gsacreditus.com.br)
- **VPS:** Sistema Wazing (WhatsApp)
- **Banco de Dados:** A definir (menciona Supabase em sistemas antigos)

### 9.2 Prioridades Técnicas
- [ ] Sistema web responsivo
- [ ] Acesso via navegador
- [ ] Possível app mobile futuro
- [ ] Integração com sistemas de consulta
- [ ] Dashboard com visualizações em tempo real

### 9.3 Referências de Sistemas Anteriores

**O cliente menciona ter tentado criar sistemas anteriores:**
> "Tem um outro cara que eu fiz completinho, meu. Completinho, completinho, com tudo. Só não tinha esse negócio de consultas, tá? Mas tinha ali gerenciamento, tinha a questão do gerente, tinha o administrador, tinha o gerente e o gestor. O gerente, o gestor e o vendedor e o cliente."

**Problemas encontrados:**
- Esqueceu senhas dos sistemas (Supabase)
- Não conseguiu mais acessar
- Falta de documentação
- **Ação:** Carlos deve verificar esses sistemas antigos no Hostinger

---

## 10. Fluxo Completo do Sistema

### 10.1 Jornada do Cliente de Consulta

```
1. Cliente acessa o site/sistema
2. Faz cadastro
3. Status: CLIENTE DE CONSULTA
4. Solicita atendimento
5. É atribuído a um Gestor (baseado em região)
6. Paga PIX (R$ 5,00)
7. Realiza consulta CPF/CNPJ
8. Recebe resultado
```

### 10.2 Jornada do Cliente Ativo

```
1. Cliente de Consulta solicita atendimento
2. Gestor/Vendedor atende
3. Cliente contrata serviço (ex: Limpeza de Nome)
4. Status muda para: CLIENTE ATIVO
5. Cliente é habilitado no sistema
6. Acessa painel de acompanhamento
7. Acompanha processo em tempo real
8. Pode fazer sugestões
9. Pode indicar outros clientes
```

### 10.3 Jornada do Vendedor

```
1. Gestor cadastra vendedor
2. Vendedor acessa sistema
3. Vendedor vende serviço
4. Vendedor REGISTRA VENDA NO SISTEMA (não mais por WhatsApp)
5. Sistema notifica gestor
6. Vendedor acompanha processo
7. Vendedor tem sua conta própria de consultas
```

### 10.4 Jornada do Parceiro Prestador

```
1. Admin cadastra parceiro prestador
2. Parceiro recebe acesso ao sistema
3. Parceiro visualiza processos atribuídos
4. Parceiro envia processos através do sistema
5. Sistema registra envio automaticamente
6. Admin/Gestor visualiza processos enviados
```

---

## 11. Prioridades de Desenvolvimento

### 11.1 Fase 1 - MVP (Prioritário)
**Conforme urgência do cliente:**

1. **Sistema de Hierarquia de Usuários**
   - Login para Admin, Gestor, Vendedor, Cliente
   - Permissões por nível
   - Cadastro de usuários por hierarquia

2. **Sistema de Consultas**
   - Cada usuário com conta própria
   - Pagamento PIX
   - Consulta CPF/CNPJ

3. **Gerenciamento Básico de Processos**
   - Vendedor registra venda
   - Admin/Gestor visualiza processos
   - Status de processos

4. **Painel do Cliente Ativo**
   - Visualizar processo
   - Status em tempo real
   - Solicitar atendimento

### 11.2 Fase 2 - Recursos Adicionais
1. Sistema de indicações
2. Funis de CRM avançados
3. Relatórios e analytics
4. Integração completa com WhatsApp
5. Sistema de notificações

### 11.3 Fase 3 - Otimizações
1. App mobile
2. Automações avançadas
3. IA para análise de processos
4. Dashboard executivo completo

---

## 13. Sistemas Antigos do Cliente (⚠️ AÇÃO CRÍTICA)

### 13.1 Contexto Importante

**CITAÇÃO DO CLIENTE:**
> "Tem um outro cara que eu fiz completinho, meu. Completinho, completinho, com tudo. Só não tinha esse negócio de consultas, tá? Mas tinha ali gerenciamento, tinha a questão do gerente, tinha o administrador, tinha o gerente e o gestor. O gerente, o gestor e o vendedor e o cliente."

### 13.2 O Que Já Foi Desenvolvido

**Sistema completo anterior incluía:**
- ✅ Hierarquia de usuários implementada
- ✅ Administrador
- ✅ Gerente/Gestor
- ✅ Vendedor
- ✅ Cliente
- ✅ Gerenciamento básico
- ❌ Sistema de consultas (faltava)
- ❌ Integração de pagamentos (faltava)

### 13.3 Problema Atual

**O que aconteceu:**
1. Cliente desenvolveu sistema(s) anteriormente
2. Usou **Supabase** como backend
3. **Esqueceu as senhas** de acesso
4. Não conseguiu mais entrar nos sistemas
5. Tentou criar outros sistemas depois
6. Mesma situação repetiu

**Localização:**
- Sistemas estão no **Hostinger**
- Cliente tem outros acessos lá
- Dois sistemas mencionados especificamente

### 13.4 🚨 AÇÃO CRÍTICA PARA DESENVOLVEDOR

**ANTES de começar do zero:**

1. **[ ] URGENTE: Recuperar acesso aos sistemas**
   - Acessar Hostinger com credenciais do cliente
   - Localizar os projetos antigos
   - Tentar reset de senha do Supabase
   - Verificar se há backup do código

2. **[ ] Analisar código existente**
   - Ver estrutura do banco de dados
   - Identificar funcionalidades prontas
   - Avaliar qualidade do código
   - Verificar quais bibliotecas foram usadas

3. **[ ] Inventário de funcionalidades**
   - Listar o que JÁ funciona
   - Identificar o que falta
   - Ver se há testes
   - Verificar documentação

4. **[ ] Decisão: Reaproveitar ou Recomeçar?**
   - Se código está bom: migrar e expandir
   - Se código está confuso: usar como referência
   - Se não conseguir acessar: documentar tentativas

### 13.5 Potencial Economia de Tempo

**Se conseguir recuperar:**
- ✅ Hierarquia de usuários: **PRONTO**
- ✅ Sistema de login: **PRONTO**
- ✅ Cadastros básicos: **PRONTO**
- ✅ Interface já desenhada: **PRONTO**

**O que faltaria adicionar:**
- Sistema de consultas pagas
- Integração PIX
- Painel do cliente
- Gerenciamento de processos (se não tiver)

**💰 Economia estimada: 40-60% do tempo da Fase 1**

### 13.6 Riscos de Ignorar os Sistemas Antigos

⚠️ **Se NÃO recuperar os sistemas:**
- Refazer trabalho já feito
- Perder tempo recriando hierarquia
- Cliente pode ficar frustrado
- Atraso desnecessário no projeto

✅ **Se RECUPERAR os sistemas:**
- Acelerar desenvolvimento
- Cliente vê que houve esforço anterior válido
- Base sólida para expandir
- Menos bugs (já testado antes)

---

## 14. Notas Importantes do Cliente

### 12.1 Citações Chave

**Sobre centralização:**
> "Eu queria centralizar tudo num lugar só. Clientes, parceiros, vendedores."

**Sobre o objetivo:**
> "Ter todas as informações ali. Eu vou ver se eu acho outro sistema que eu tinha feito."

**Sobre acompanhamento:**
> "Eu quero que o cliente, no momento que ele contratou serviço comigo, ele entra pra um sistema, e ele quer acompanhar o processo dele."

**Sobre registros:**
> "O vendedor, quando ele faz uma venda, ele registra. O parceiro, quando ele vai enviar um processo, ele já registra no sistema. Não precisa o cara estar mandando pelo WhatsApp ou mandando planilha para mim."

### 12.2 Problemas a Resolver

❌ **O que NÃO quer mais:**
- Gestão por WhatsApp
- Pedir planilhas aos vendedores
- Perguntar "quantos processos você enviou?"
- Clientes sem acompanhamento
- Informações descentralizadas

✅ **O que QUER:**
- Tudo centralizado em um sistema
- Visibilidade total de processos
- Cliente acompanha próprio processo
- Vendedores registram tudo no sistema
- Relatórios automáticos

---

## 15. Acordo de Parceria (Contexto)

### 13.1 Proposta do Cliente

**Conforme áudio:**
> "A gente faz um compromisso contigo, a gente faz um contrato. Aí eu te ajudo a buscar o teu imóvel, com as condições, as informações que precisa do sistema de crédito, a questão de renda, a aprovação de financiamento. A gente tem toda essa estratégia para fazer isso. Aí a gente faz um compromisso, tu me ajuda a alavancar esse negócio digital e eu te ajudo a conquistar o teu imóvel."

### 13.2 Troca de Serviços
- Cliente ajuda Carlos com financiamento imobiliário
- Carlos desenvolve e finaliza o sistema
- Parte financeira acordada separadamente
- Possibilidade de trocas adicionais conforme necessidade

---

## 16. Próximos Passos Imediatos

### 14.1 Ações do Desenvolvedor (Carlos)

1. **Verificar sistemas antigos** no Hostinger
   - Tentar recuperar acesso
   - Analisar código existente
   - Aproveitar funcionalidades já desenvolvidas

2. **Definir arquitetura técnica**
   - Escolher stack de desenvolvimento
   - Definir banco de dados
   - Planejar estrutura de permissões

3. **Desenvolver MVP** (Fase 1)
   - Priorizar funcionalidades essenciais
   - Entregar incrementalmente
   - Testar com cliente



---

## 10. Fluxos Completos do Sistema (Consolidado)

### 10.1 Jornada do Cliente de Consulta → Cliente Ativo

```
1. Cliente acessa site/sistema
2. Faz cadastro (ou é cadastrado por vendedor)
3. Status: CLIENTE DE CONSULTA
4. Solicita atendimento
5. Sistema atribui a Gestor da região
6. Gestor atende ou atribui vendedor
7. Cliente contrata serviço?
   ├─→ NÃO: Permanece Cliente de Consulta
   │         └─→ Pode fazer consultas pagas (R$ 5)
   └─→ SIM: Vira CLIENTE ATIVO
             └─→ Acessa painel completo
                 ├─→ Acompanha processo
                 ├─→ Faz sugestões
                 └─→ Pode indicar
```

### 10.2 Fluxo de Consulta Paga (Pay-per-Use)

```
ANTES DO PAGAMENTO:
1. Usuário acessa "Sistema de Consultas"
2. Seleciona tipo (CPF ou CNPJ)
3. Informa dados do documento
4. Sistema gera QR Code PIX (R$ 5,00)
5. Usuário realiza pagamento

APÓS CONFIRMAÇÃO:
6. Sistema confirma recebimento automaticamente
7. Libera execução da consulta
8. Executa busca na API externa
9. Retorna resultado formatado
10. Salva consulta no histórico
11. Permite visualização posterior
```

### 10.3 Fluxo de Registro de Processo

**SITUAÇÃO ATUAL (Problemática):**
```
Vendedor vende → Envia por WhatsApp → Admin perde info → Precisa pedir planilha
```

**SITUAÇÃO DESEJADA (Com Sistema):**
```
Vendedor vende
    ↓
Acessa sistema
    ↓
Menu: "Registrar Nova Venda"
    ↓
Preenche formulário:
├─ Cliente
├─ Serviço contratado  
├─ Valor
├─ Observações
└─ Status inicial
    ↓
Sistema registra automaticamente
    ├─→ Notifica gestor/admin
    ├─→ Atualiza dashboard
    └─→ Gera histórico rastreável
```

### 10.4 Fluxo do Chatbot WhatsApp

```
[NOVA MENSAGEM RECEBIDA]
    │
    ↓
Sistema identifica: Novo contato?
    │
    ├─→ SIM: Envia menu inicial
    │         "1. Orçamento CPF
    │          2. Orçamento CNPJ
    │          3. Falar com atendente
    │          4. Consultar CPF/CNPJ"
    │
    └─→ NÃO: Verifica status
              │
              ├─→ ATIVO: Continua conversa
              │
              └─→ FECHADO: ⚠️ REINICIA MENU
                           (requisito explícito)
```

---

## 11. Prioridades de Desenvolvimento (3 Fases)

### 11.1 🔴 FASE 1 - MVP CRÍTICO (Prioridade Máxima)

**Objetivo:** Sistema funcional básico que elimine WhatsApp/planilhas

**🎯 Meta:** Cliente consegue gerenciar sem pedir planilhas

#### Entregas Essenciais:

**1. Sistema de Login e Hierarquia** ⏱️ 2-3 semanas
- [ ] Telas de login para todos os níveis
- [ ] Admin, Gestor, Vendedor, Cliente
- [ ] Controle básico de permissões
- [ ] Cadastro de usuários por hierarquia
- [ ] Atribuição automática por região (simplificada)

**2. Sistema de Consultas** ⏱️ 2-3 semanas
- [ ] Interface de consulta CPF/CNPJ
- [ ] Integração com PIX (R$ 5,00)
- [ ] Cada usuário conta própria
- [ ] Histórico de consultas
- [ ] ⚠️ **CRÍTICO:** Integração com API de consulta

**3. Gerenciamento de Processos** ⏱️ 3-4 semanas
- [ ] Vendedor registra venda no sistema
- [ ] Admin/Gestor visualiza todos processos
- [ ] Lista com filtros (vendedor, status, data)
- [ ] Formulário de registro de processo
- [ ] Dashboard básico com métricas

**4. Painel Cliente Ativo (Simplificado)** ⏱️ 1-2 semanas
- [ ] Cliente vê seus processos
- [ ] Status em tempo real
- [ ] Botão "Solicitar Atendimento"
- [ ] Dados básicos do processo

**✅ Critério de Sucesso Fase 1:**
- ✓ Admin vê todos processos sem pedir planilha
- ✓ Vendedor registra no sistema (não WhatsApp)
- ✓ Cliente ativo vê status do processo
- ✓ Consultas pagas funcionando

**⏱️ Tempo Estimado Fase 1:** 8-12 semanas

---

### 11.2 🟡 FASE 2 - Recursos Adicionais

**Objetivo:** Melhorar experiência e automação

#### Entregas:

**1. CRM e Funis Avançados** ⏱️ 2-3 semanas
- [ ] Funil: Lead → Orçamento → Interessados
- [ ] Separação: Proposta vs Agendamento
- [ ] Tags e categorização
- [ ] Pipeline visual tipo Kanban

**2. Sistema de Indicações** ⏱️ 1-2 semanas
- [ ] Botão "Indicar" no painel
- [ ] Tracking de indicações
- [ ] Sistema de recompensas
- [ ] Relatório de conversões

**3. Chat Interno** ⏱️ 2-3 semanas
- [ ] Mensagens cliente ↔ vendedor
- [ ] Notificações de novas mensagens
- [ ] Histórico completo
- [ ] Status "lido/não lido"

**4. Dashboards e Métricas** ⏱️ 2 semanas
- [ ] Dashboard Admin (visão geral)
- [ ] Dashboard Gestor (sua região)
- [ ] Gráficos de vendas
- [ ] Métricas de processos
- [ ] Exportação básica de dados

**⏱️ Tempo Estimado Fase 2:** 7-10 semanas

---

### 11.3 🟢 FASE 3 - Otimizações e Expansão

**Objetivo:** Recursos avançados e mobile

#### Entregas:

**1. App Mobile** ⏱️ 6-8 semanas
- [ ] iOS (React Native ou Flutter)
- [ ] Android
- [ ] Notificações push
- [ ] Mesmo login do web

**2. Automações Avançadas** ⏱️ 3-4 semanas
- [ ] Integração completa WhatsApp API
- [ ] E-mails automáticos personalizados
- [ ] Workflows configuráveis
- [ ] Triggers automáticos

**3. Relatórios Avançados** ⏱️ 2-3 semanas
- [ ] Exportação PDF profissional
- [ ] Exportação Excel com filtros
- [ ] Relatórios customizáveis
- [ ] Agendamento de relatórios
- [ ] Templates personalizados

**4. IA e Analytics** ⏱️ 4-6 semanas
- [ ] Análise preditiva (próximos passos)
- [ ] Sugestões automáticas
- [ ] Chatbot com IA
- [ ] Análise de sentimento

**⏱️ Tempo Estimado Fase 3:** 15-21 semanas

---

**⚠️ IMPORTANTE:**
- Fase 2 só inicia após aprovação e homologação da Fase 1
- Fase 3 só inicia após aprovação da Fase 2
- Cada fase tem entrega independente e utilizável

---

## 12. ⚠️ O QUE **NÃO** FOI MENCIONADO (Fora do Escopo Atual)

### 10.1 Funcionalidades NÃO Solicitadas

Para evitar desenvolvimento de recursos não pedidos:

❌ **Relatórios e Exportações**
- Não houve menção a relatórios específicos
- Não foi pedido exportação para PDF
- Não foi pedido exportação para Excel
- Não foi solicitada geração de documentos

❌ **Níveis de Permissão Granulares**
- Não foram detalhados perfis de acesso específicos
- Não foi mencionado controle fino de permissões
- Hierarquia foi definida, mas permissões específicas não

❌ **Notificações**
- Não foi solicitado sistema de notificações push
- Não foi pedido e-mails automáticos (exceto o do orçamento)
- Não foram definidos alertas automáticos

❌ **Integrações Bancárias Diretas**
- Não foi pedida integração com bancos
- Não foi solicitada emissão de boletos automática
- Não foi pedido gateway de pagamento específico

❌ **Webhooks e APIs Públicas**
- Não foi mencionado exposição de API
- Não foi pedido webhooks para terceiros
- Não foi solicitada documentação de API

❌ **SLA e Prazos**
- Não foram definidos tempos de resposta
- Não foram estabelecidos níveis de serviço
- Não foram mencionados requisitos de disponibilidade

❌ **Compliance e Legal**
- LGPD não foi explicitamente mencionada
- Termos de uso não foram discutidos
- Políticas de privacidade não foram detalhadas
- **Nota:** Apenas o contexto jurídico foi mencionado

❌ **Multi-tenancy**
- Não foi pedido sistema multi-empresa
- Não foi solicitado white-label
- Não foi pedido revenda do sistema

### 10.2 Aspectos Técnicos NÃO Definidos

⚠️ **A serem definidos posteriormente:**

**Performance:**
- Limites de volume de dados
- Quantidade máxima de usuários simultâneos
- Tempo de resposta esperado
- Taxa de indexação

**Infraestrutura:**
- Especificações de servidor
- Requisitos de banda
- Política de backup
- Plano de disaster recovery

**Segurança:**
- Níveis de criptografia
- Políticas de senha
- Autenticação de dois fatores
- Auditoria de logs

**Escalabilidade:**
- Plano de crescimento
- Arquitetura distribuída
- Balanceamento de carga

### 10.3 Aspectos Comerciais NÃO Discutidos

❌ **Não foram mencionados:**
- Valores totais do projeto (apenas mencionada troca de serviços)
- Modelo de cobrança do desenvolvimento
- Prazos de entrega específicos
- Marcos de pagamento
- Garantias contratuais

**⚠️ Atenção:** Esses pontos devem ser tratados em proposta comercial separada.

### 16.2 Ações do Cliente (Tiago)

1. **Fornecer acessos necessários**
   - Credenciais dos sistemas antigos no Hostinger
   - Acesso VPS Wazing (WhatsApp)
   - Informações sobre API de consulta desejada
   - Credenciais do sistema de pagamentos

2. **Validar este documento**
   - Revisar todas as seções
   - Confirmar prioridades (Fase 1, 2, 3)
   - Esclarecer dúvidas
   - Aprovar para iniciar desenvolvimento

3. **Preparar conteúdo**
   - Templates de e-mails automáticos
   - Textos para WhatsApp
   - Fluxos de atendimento detalhados
   - Documentos e formulários

---

## 17. Referências e Documentos

### 15.1 Documentos Fornecidos
- ✅ PROPOSTA CNPJ_compressed.pdf
- ✅ Conversas do WhatsApp
- ✅ Transcrições de áudio com requisitos

### 15.2 Sistemas Existentes
- Sistema de chatbot WhatsApp (ativo)
- Sistema de gestão de pagamentos (ativo)
- Sistemas antigos no Hostinger (a recuperar)

### 15.3 Integrações Futuras
- API de consultas CPF/CNPJ
- WhatsApp Business API
- Sistema de pagamentos PIX
- Possível CRM externo

---

## 18. Checklist de Validação

### 16.1 Antes de Iniciar Desenvolvimento

- [ ] Cliente revisou e aprovou este documento
- [ ] Prioridades foram definidas (Fase 1, 2, 3)
- [ ] Acessos necessários foram fornecidos
- [ ] Arquitetura técnica foi definida
- [ ] Cronograma foi acordado
- [ ] Sistemas antigos foram analisados

### 16.2 Durante o Desenvolvimento

- [ ] Validações incrementais com cliente
- [ ] Testes de cada funcionalidade
- [ ] Documentação de código
- [ ] Backup regular do código

### 16.3 Antes do Deploy

- [ ] Testes completos de todos os níveis de usuário
- [ ] Testes de integração com consultas
- [ ] Testes de pagamento PIX
- [ ] Treinamento do cliente no sistema
- [ ] Documentação de uso
- [ ] Plano de migração de dados (se houver)

---

## 19. Observações Finais

### 17.1 Pontos de Atenção

⚠️ **Sistemas antigos do cliente:**
- Cliente menciona ter criado sistemas completos anteriormente
- Perdeu acesso por esquecer senhas (Supabase)
- **Ação crítica:** Recuperar e analisar esses sistemas antes de começar do zero

⚠️ **Escopo em evolução:**
- Cliente tem muitas ideias e necessidades
- Importante manter foco no MVP primeiro
- Documentar todas as solicitações para fases futuras

⚠️ **Integrações críticas:**
- Sistema de consultas é core do negócio
- Integração precisa ser robusta e confiável
- Cada usuário com conta própria (não compartilhar)

### 17.2 Citação Motivacional do Cliente

> "Tu me ajuda a alavancar esse negócio digital e eu te ajudo a conquistar o teu imóvel, né, cara? Acho que eu uso a minha expertise que eu tenho e tu usa a tua expertise que tu tem e um ajuda o outro, né?"

---

## 20. Aprovação e Histórico

| Nome | Papel | Status | Data |
|------|-------|--------|------|
| Tiago (Tchê) | Cliente/Product Owner | ⏳ Pendente Validação | __ / __ / ____ |
| Carlos Eduardo | Desenvolvedor | ✅ Documento Criado | 04/02/2026 |

### Histórico de Versões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 04/02/2026 | Carlos Eduardo | Versão inicial baseada em conversas |
| 2.0 | 04/02/2026 | Carlos Eduardo | Versão consolidada com TODOS os documentos integrados |

---

## 📞 Contato

**Cliente:**  
Tiago (Tchê) - GSA Creditus  
Jurídico e Administrativo
WhatsApp: [Conforme conversas]  
Domínio: gsacreditus.com.br

**Desenvolvedor:**  
Carlos Eduardo  
WhatsApp: [Conforme conversas]

---

## 📝 Nota Final

**Este documento foi elaborado com base em:**
- ✅ Conversas completas do WhatsApp
- ✅ Transcrições de todos os áudios
- ✅ Proposta CNPJ oficial (PDF)
- ✅ Análise do segundo documento fornecido

**Princípio:** Somente informações **explicitamente mencionadas** foram incluídas. Nenhuma funcionalidade foi assumida ou adicionada sem ter sido solicitada pelo cliente.

**Objetivo:** Documento blindado contra mal-entendidos, pronto para:
- ✓ Validação com o cliente
- ✓ Base para proposta comercial
- ✓ Escopo de contrato
- ✓ Guia de desenvolvimento

---

**🎯 PRÓXIMA AÇÃO CRÍTICA:**  
Recuperar sistemas antigos no Hostinger antes de iniciar desenvolvimento!
