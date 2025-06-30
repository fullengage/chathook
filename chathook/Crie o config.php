<?php
// Lista de contas Chatwoot indexadas pelo account_id
$chatwootConfigs = [
    1 => [
        'base_url' => 'https://chat.fullweb.com.br',
        'api_token' => 'tNhW1BVczaPLXihqyKi8T3ki'
    ],
    2 => [
        'base_url' => 'https://outro.dominio.com.br',
        'api_token' => 'TOKEN_OUTRA_EMPRESA'
    ],
    // Adicione outras empresas conforme necessário
];

// Padrão de headers
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: *');
    header('Content-Type: application/json; charset=UTF-8');
}

// Função para obter config de acordo com o account_id
function getChatwootConfig($account_id, $chatwootConfigs) {
    return $chatwootConfigs[$account_id] ?? null;
}
?>
