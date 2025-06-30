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
    $chatwootToken = ChatwootConfig::getApiToken();

    // Endpoint de contatos do Chatwoot (padrão: 50 por página, pode usar ?page=2 para mais)
    $url = "$chatwootBaseUrl/contacts?sort=desc&per_page=100";

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
        ChatwootLogger::error("Falha ao buscar contatos. HTTP Code: $http_code, Erro: $error");
        echo ChatwootError::response(
            "Falha ao buscar contatos.",
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
    ChatwootLogger::error("Erro no endpoint contatos.php: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
