<?php
require_once 'config.php';
require_once 'chatwoot_library.php';

ChatwootConfig::setCorsHeaders();

// Responde OPTIONS requests (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if (!isset($_GET['conversation_id'])) {
        echo ChatwootError::badRequest('ID da conversa não informado.');
        exit;
    }

    $conversationId = ChatwootUtils::sanitizeInput($_GET['conversation_id'], 'int');
    
    if (!ChatwootUtils::isValidId($conversationId)) {
        echo ChatwootError::badRequest('ID da conversa inválido.');
        exit;
    }

    $accountId = ChatwootConfig::DEFAULT_ACCOUNT_ID; // Ou obtenha de outra forma se for multi-empresa
    $chatwootBaseUrl = ChatwootConfig::getBaseUrl($accountId);
    $chatwootToken = ChatwootConfig::getApiToken();

    $url = "$chatwootBaseUrl/conversations/{$conversationId}/messages";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "api_access_token: $chatwootToken"
    ]);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $http_code >= 400) {
        ChatwootLogger::error("Falha ao buscar mensagens. HTTP Code: $http_code, Erro: $error");
        echo ChatwootError::response(
            "Falha ao buscar mensagens.",
            $http_code,
            [
                "detalhe" => $error,
                "raw_response" => $response
            ]
        );
    } else {
        $responseArray = json_decode($response, true);
        // O Chatwoot retorna 'payload' ou 'data'
        if (isset($responseArray['payload'])) {
            echo json_encode(['payload' => $responseArray['payload']]);
        } elseif (isset($responseArray['data'])) {
            echo json_encode(['payload' => $responseArray['data']]);
        } else {
            echo json_encode(['payload' => $responseArray]);
        }
    }

} catch (Exception $e) {
    ChatwootLogger::error("Erro no endpoint mensagens.php: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
