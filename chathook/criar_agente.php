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
    // Recebe JSON do frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $name = ChatwootUtils::sanitizeInput($data['name'] ?? null);
    $email = ChatwootUtils::sanitizeInput($data['email'] ?? null, 'email');
    $role = ChatwootUtils::sanitizeInput($data['role'] ?? 'agent');

    if (!$name || !$email) {
        echo ChatwootError::badRequest('Campos obrigatórios: name e email.');
        exit;
    }

    $accountId = ChatwootConfig::DEFAULT_ACCOUNT_ID; // Ou obtenha de outra forma se for multi-empresa
    $chatwootBaseUrl = ChatwootConfig::getBaseUrl($accountId);
    $chatwootToken = ChatwootConfig::getApiToken();

    $url = "$chatwootBaseUrl/users";

    $payload = [
        'name' => $name,
        'email' => $email,
        'role' => $role
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
        ChatwootLogger::error("Falha ao criar agente. HTTP Code: $http_code, Erro: $error");
        echo ChatwootError::response(
            "Falha ao criar agente.",
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
    ChatwootLogger::error("Erro no endpoint criar_agente.php: " . $e->getMessage());
    echo ChatwootError::internalError($e->getMessage());
}
?>
