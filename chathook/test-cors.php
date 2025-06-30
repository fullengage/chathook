<?php
// 🔧 CONFIGURAÇÕES DE CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, api_access_token, X-Requested-With, Origin, Accept');
header('Access-Control-Max-Age: 86400');

// ✅ RESPONDER OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'CORS OK']);
    exit();
}

// 🧪 TESTE COMPLETO
$results = [
    'timestamp' => date('Y-m-d H:i:s T'),
    'server_info' => [
        'php_version' => phpversion(),
        'curl_available' => function_exists('curl_init'),
        'openssl_available' => extension_loaded('openssl'),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'N/A',
        'request_method' => $_SERVER['REQUEST_METHOD']
    ],
    'cors_test' => 'OK - Headers enviados',
    'chatwoot_api_test' => null
];

// 🔗 TESTE DA API DO CHATWOOT
if (function_exists('curl_init')) {
    $base_url = "https://chat.fullweb.com.br/api/v1/accounts/1";
    $token = 'tNhW1BVczaPLXihqyKi8T3ki';
    $url = "$base_url/conversations";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Para debug
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Para debug
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "api_access_token: $token",
        "Content-Type: application/json",
        "Accept: application/json",
        "User-Agent: ChatFull-Test/1.0"
    ]);
    
    $start_time = microtime(true);
    $response = curl_exec($ch);
    $end_time = microtime(true);
    
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    $curl_info = curl_getinfo($ch);
    
    curl_close($ch);
    
    $results['chatwoot_api_test'] = [
        'url' => $url,
        'http_code' => $http_code,
        'response_time' => round(($end_time - $start_time) * 1000, 2) . 'ms',
        'curl_error' => $curl_error ?: null,
        'content_type' => $curl_info['content_type'] ?? null,
        'response_length' => strlen($response),
        'success' => ($http_code === 200 && !$curl_error)
    ];
    
    // Se obteve resposta, tenta decodificar JSON
    if ($response && $http_code === 200) {
        $decoded = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $results['chatwoot_api_test']['json_valid'] = true;
            $results['chatwoot_api_test']['data_structure'] = [
                'has_data' => isset($decoded['data']),
                'has_meta' => isset($decoded['data']['meta']),
                'has_payload' => isset($decoded['data']['payload']),
                'payload_count' => is_array($decoded['data']['payload'] ?? null) ? count($decoded['data']['payload']) : 0,
                'sample_keys' => array_keys($decoded)
            ];
        } else {
            $results['chatwoot_api_test']['json_valid'] = false;
            $results['chatwoot_api_test']['json_error'] = json_last_error_msg();
            $results['chatwoot_api_test']['raw_response_preview'] = substr($response, 0, 200) . '...';
        }
    } else {
        $results['chatwoot_api_test']['response_preview'] = substr($response, 0, 200);
    }
} else {
    $results['chatwoot_api_test'] = ['error' => 'cURL não disponível'];
}

// 📤 RESULTADO FINAL
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?> 