<?php
require_once 'config.php';
require_once 'chatwoot_library.php';

ChatwootConfig::setCorsHeaders();

// Responde OPTIONS requests (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Função para fazer requisições ao Chatwoot
function chatwootRequest($url, $method = 'GET', $data = null) {
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "api_access_token: " . ChatwootConfig::getApiToken()
    ]);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    ChatwootLogger::info("Request to $url, Method: $method, HTTP Code: $http_code");
    if ($error) {
        ChatwootLogger::error("cURL Error: $error");
    }
    
    return [
        'response' => $response,
        'http_code' => $http_code,
        'error' => $error
    ];
}

// Roteamento simples baseado no endpoint
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query parameters para análise da rota
$path = parse_url($requestUri, PHP_URL_PATH);

try {
    $accountId = ChatwootConfig::DEFAULT_ACCOUNT_ID; // Ou obtenha de outra forma se for multi-empresa
    $chatwootBaseUrl = ChatwootConfig::getBaseUrl($accountId);

    if ($method === 'GET') {
        // Endpoint: /messages/{conversation_id}
        if (preg_match('/\/messages\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            // Parâmetros opcionais via query string
            $page = ChatwootUtils::sanitizeInput($_GET['page'] ?? 1, 'int');
            $perPage = ChatwootConfig::sanitizePerPage($_GET['per_page'] ?? ChatwootConfig::DEFAULT_PER_PAGE);
            
            $url = "$chatwootBaseUrl/conversations/$conversationId/messages?page=$page&per_page=$perPage";
            $result = chatwootRequest($url);
            
            if ($result['http_code'] === 200) {
                echo $result['response'];
            } else {
                echo ChatwootError::response(
                    "Falha ao buscar mensagens da conversa.",
                    $result['http_code'],
                    [
                        "conversation_id" => $conversationId,
                        "detalhe" => $result['error'],
                        "raw_response" => $result['response']
                    ]
                );
            }
        }
        
        // Endpoint: /conversations (listar conversas)
        elseif (preg_match('/\/conversations$/', $path)) {
            $page = ChatwootUtils::sanitizeInput($_GET['page'] ?? 1, 'int');
            $perPage = ChatwootConfig::sanitizePerPage($_GET['per_page'] ?? ChatwootConfig::DEFAULT_PER_PAGE);
            $status = ChatwootUtils::sanitizeInput($_GET['status'] ?? 'all'); 
            
            if (!ChatwootConfig::isValidStatus($status)) {
                echo ChatwootError::badRequest("Status inválido.");
                exit();
            }

            $url = "$chatwootBaseUrl/conversations?sort=desc&page=$page&per_page=$perPage";
            if ($status !== 'all') {
                $url .= "&status=$status";
            }
            
            $result = chatwootRequest($url);
            
            if ($result['http_code'] === 200) {
                echo $result['response'];
            } else {
                echo ChatwootError::response(
                    "Falha ao buscar conversas.",
                    $result['http_code'],
                    [
                        "detalhe" => $result['error'],
                        "raw_response" => $result['response']
                    ]
                );
            }
        }
        
        // Endpoint: /conversation/{conversation_id} (detalhes de uma conversa)
        elseif (preg_match('/\/conversation\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            $url = "$chatwootBaseUrl/conversations/$conversationId";
            $result = chatwootRequest($url);
            
            if ($result['http_code'] === 200) {
                echo $result['response'];
            } else {
                echo ChatwootError::response(
                    "Falha ao buscar detalhes da conversa.",
                    $result['http_code'],
                    [
                        "conversation_id" => $conversationId,
                        "detalhe" => $result['error'],
                        "raw_response" => $result['response']
                    ]
                );
            }
        }
        
        else {
            echo ChatwootError::notFound("Endpoint");
        }
    }
    
    elseif ($method === 'POST') {
        // Endpoint: /messages/{conversation_id} (enviar mensagem)
        if (preg_match('/\/messages\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            // Lê o JSON do body da requisição
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['content'])) {
                echo ChatwootError::badRequest("Conteúdo da mensagem é obrigatório.");
                exit();
            }
            
            $messageContent = ChatwootUtils::sanitizeInput($input['content']);
            $messageType = ChatwootUtils::sanitizeInput($input['message_type'] ?? 'outgoing');

            if (empty(trim($messageContent))) {
                echo ChatwootError::badRequest("Conteúdo da mensagem não pode estar vazio.");
                exit();
            }
            if (!ChatwootConfig::isValidMessageType($messageType)) {
                echo ChatwootError::badRequest("Tipo de mensagem inválido.");
                exit();
            }
            
            $messageData = [
                'content' => $messageContent,
                'message_type' => $messageType
            ];
            
            $url = "$chatwootBaseUrl/conversations/$conversationId/messages";
            $result = chatwootRequest($url, 'POST', $messageData);
            
            if ($result['http_code'] === 200 || $result['http_code'] === 201) {
                echo $result['response'];
            } else {
                echo ChatwootError::response(
                    "Falha ao enviar mensagem.",
                    $result['http_code'],
                    [
                        "conversation_id" => $conversationId,
                        "detalhe" => $result['error'],
                        "raw_response" => $result['response']
                    ]
                );
            }
        }
        
        else {
            echo ChatwootError::notFound("Endpoint POST");
        }
    }
    
    else {
        echo ChatwootError::methodNotAllowed(["GET", "POST"]);
    }
    
} catch (Exception $e) {
    ChatwootLogger::error("Erro no endpoint: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
