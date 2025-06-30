// ====== EXEMPLOS DE USO DA API CHATWOOT - MULTI EMPRESA ======

// ===== VERSÃO SIMPLES (Account ID dinâmico) =====

// 1. USANDO QUERY PARAMETER
// Para empresa com account_id = 3
fetch('http://seudominio.com/chatwoot-api.php/conversations?account_id=3&status=open')
  .then(response => response.json())
  .then(data => console.log('Conversas da empresa 3:', data));

// 2. USANDO HEADER
fetch('http://seudominio.com/chatwoot-api.php/conversations?status=open', {
  headers: {
    'X-Account-ID': '5' // Para empresa com account_id = 5
  }
})
.then(response => response.json())
.then(data => console.log('Conversas da empresa 5:', data));

// ===== VERSÃO MULTI-EMPRESA (Com slugs) =====

// 1. LISTAR TODAS AS EMPRESAS DISPONÍVEIS
fetch('http://seudominio.com/chatwoot-multi-empresa.php/companies')
  .then(response => response.json())
  .then(data => {
    console.log('Empresas disponíveis:', data);
    // Retorna: { companies: { empresa1: {account_id: 1, name: "..."}, ... } }
  });

// 2. USANDO QUERY PARAMETER (empresa1)
fetch('http://seudominio.com/chatwoot-multi-empresa.php/conversations?company=empresa1&status=open')
  .then(response => response.json())
  .then(data => {
    console.log('Conversas da empresa1:', data);
    console.log('Account ID:', data._meta.account_id);
  });

// 3. USANDO HEADER
fetch('http://seudominio.com/chatwoot-multi-empresa.php/conversations?status=open', {
  headers: {
    'X-Company-Slug': 'empresa2'
  }
})
.then(response => response.json())
.then(data => console.log('Conversas da empresa2:', data));

// 4. USANDO PATH (recomendado para REST)
fetch('http://seudominio.com/chatwoot-multi-empresa.php/company/empresa3/conversations?status=open')
  .then(response => response.json())
  .then(data => console.log('Conversas da empresa3:', data));

// 2. OBTER DETALHES DE UMA CONVERSA ESPECÍFICA
const conversationId = 123;
fetch(`http://seudominio.com/chatwoot-api.php/conversation/${conversationId}`)
  .then(response => response.json())
  .then(data => {
    console.log('Detalhes da conversa:', data);
  });

// 3. BUSCAR MENSAGENS DE UMA CONVERSA
const conversationId = 123;
fetch(`http://seudominio.com/chatwoot-api.php/messages/${conversationId}?per_page=50`)
  .then(response => response.json())
  .then(data => {
    console.log('Mensagens:', data);
    // data.payload conterá o array de mensagens
  });

// 4. ENVIAR MENSAGEM PARA UMA CONVERSA
const conversationId = 123;
const messageData = {
  content: "Olá! Como posso ajudá-lo?",
  message_type: "outgoing" // ou "incoming"
};

fetch(`http://seudominio.com/chatwoot-api.php/messages/${conversationId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(messageData)
})
.then(response => response.json())
.then(data => {
  console.log('Mensagem enviada:', data);
});

// ====== EXEMPLOS EM PHP ======

// 1. Buscar conversas em PHP
$conversas = file_get_contents('http://seudominio.com/chatwoot-api.php/conversations?status=open');
$conversasArray = json_decode($conversas, true);

foreach ($conversasArray['payload'] as $conversa) {
    echo "Conversa ID: " . $conversa['id'] . " - Status: " . $conversa['status'] . "\n";
}

// 2. Buscar mensagens de uma conversa em PHP
$conversationId = 123;
$mensagens = file_get_contents("http://seudominio.com/chatwoot-api.php/messages/$conversationId");
$mensagensArray = json_decode($mensagens, true);

foreach ($mensagensArray['payload'] as $mensagem) {
    echo "Mensagem: " . $mensagem['content'] . " - Tipo: " . $mensagem['message_type'] . "\n";
}

// 3. Enviar mensagem em PHP
function enviarMensagem($conversationId, $conteudo) {
    $data = json_encode([
        'content' => $conteudo,
        'message_type' => 'outgoing'
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $data
        ]
    ]);
    
    $result = file_get_contents("http://seudominio.com/chatwoot-api.php/messages/$conversationId", false, $context);
    return json_decode($result, true);
}

// Usar a função
$resultado = enviarMensagem(123, "Mensagem automática do sistema");

// ====== ENDPOINTS DISPONÍVEIS ======

/*
GET /conversations
- Parâmetros: page, per_page, status (all, open, resolved, pending)
- Retorna: Lista de conversas

GET /conversation/{id}
- Retorna: Detalhes de uma conversa específica

GET /messages/{conversation_id}
- Parâmetros: page, per_page
- Retorna: Mensagens de uma conversa

POST /messages/{conversation_id}
- Body: { "content": "texto", "message_type": "outgoing" }
- Retorna: Mensagem criada
*/

// ====== ESTRUTURA DE RESPOSTA TÍPICA ======

/*
Conversas:
{
  "payload": [
    {
      "id": 123,
      "status": "open",
      "created_at": "2024-01-01T12:00:00Z",
      "contact": {
        "id": 456,
        "name": "João Silva",
        "phone": "+5511999999999"
      },
      "messages": [...],
      "assignee": {...}
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 50
  }
}

Mensagens:
{
  "payload": [
    {
      "id": 789,
      "content": "Olá, preciso de ajuda!",
      "message_type": "incoming",
      "created_at": "2024-01-01T12:00:00Z",
      "sender": {
        "id": 456,
        "name": "João Silva"
      }
    }
  ]
}
*/