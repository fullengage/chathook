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
    $accountId = ChatwootConfig::DEFAULT_ACCOUNT_ID; // Ou obtenha de outra forma se for multi-empresa
    $chatwootBaseUrl = ChatwootConfig::getBaseUrl($accountId);
    $chatwootToken = ChatwowootConfig::getApiToken();

    // Endpoint de conversas do Chatwoot
    $url = "$chatwootBaseUrl/conversations?sort=desc&per_page=10";

    // Inicializa cURL
    $ch = curl_init($url);

    // Configura headers e opções
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "api_access_token: $chatwootToken"
    ]);

    // Executa requisição
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $http_code >= 400) {
        ChatwootLogger::error("Falha ao buscar conversas. HTTP Code: $http_code, Erro: $error");
        echo ChatwootError::response(
            "Falha ao buscar conversas.",
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
    ChatwootLogger::error("Erro no endpoint conversas.php: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
