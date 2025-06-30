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
    // Só aceita POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo ChatwootError::methodNotAllowed(['POST']);
        exit;
    }

    // Lê JSON do corpo da requisição
    $input = json_decode(file_get_contents('php://input'), true);

    $conversationId = ChatwootUtils::sanitizeInput($input['conversation_id'] ?? null, 'int');
    $content = ChatwootUtils::sanitizeInput($input['content'] ?? null);

    if (!ChatwootUtils::isValidId($conversationId) || empty(trim($content))) {
        echo ChatwootError::badRequest('Parâmetros obrigatórios: conversation_id (ID válido) e content (não vazio).');
        exit;
    }

    $accountId = ChatwootConfig::DEFAULT_ACCOUNT_ID; // Ou obtenha de outra forma se for multi-empresa
    $chatwootBaseUrl = ChatwootConfig::getBaseUrl($accountId);
    $chatwootToken = ChatwootConfig::getApiToken();

    $url = "$chatwootBaseUrl/conversations/{$conversationId}/messages";

    $payload = [
        'content' => $content,
        'message_type' => 'outgoing' // Ou 'incoming' dependendo do contexto
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "api_access_token: $chatwootToken"
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $http_code >= 400) {
        ChatwootLogger::error("Falha ao responder conversa. HTTP Code: $http_code, Erro: $error");
        echo ChatwootError::response(
            "Falha ao responder conversa.",
            $http_code,
            [
                "detalhe" => $error,
                "raw_response" => $response
            ]
        );
    } else {
        echo $response;
    }

} catch (Exception $e) {
    ChatwootLogger::error("Erro no endpoint responder.php: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
