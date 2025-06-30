<?php
// 🔧 CONFIGURAÇÕES DE CORS - DEVE SER A PRIMEIRA COISA NO ARQUIVO
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, api_access_token, X-Requested-With, Origin, Accept');
header('Access-Control-Max-Age: 86400'); // Cache preflight por 24 horas

// ✅ IMPORTANTE: Responder às requisições OPTIONS (preflight) IMEDIATAMENTE
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 📝 VALIDAÇÃO DE PARÂMETROS
$endpoint = $_GET['endpoint'] ?? 'conversations';
$params = $_GET['params'] ?? '';

// 🛡️ VALIDAÇÃO DE SEGURANÇA - Endpoints permitidos
$allowed_endpoints = [
    'conversations', 
    'contacts', 
    'inboxes', 
    'agents', 
    'messages', 
    'reports/account'
];

$is_valid_endpoint = false;

// Verifica endpoints básicos
foreach ($allowed_endpoints as $allowed) {
    if (strpos($endpoint, $allowed) === 0) {
        $is_valid_endpoint = true;
        break;
    }
}

// Verifica endpoints com IDs dinâmicos
if (preg_match('/^conversations\/\d+\/messages$/', $endpoint) || 
    preg_match('/^conversations\/\d+$/', $endpoint) ||
    preg_match('/^contacts\/\d+$/', $endpoint) ||
    preg_match('/^agents\/\d+$/', $endpoint)) {
    $is_valid_endpoint = true;
}

if (!$is_valid_endpoint) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint não permitido: ' . $endpoint,
        'allowed_endpoints' => $allowed_endpoints
    ]);
    exit();
}

// 🔗 CONSTRUÇÃO DA URL DA API CHATWOOT
$base_url = "https://chat.fullweb.com.br/api/v1/accounts/1";
$url = "$base_url/$endpoint";

// Adiciona parâmetros para requisições GET
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($params)) {
    $url .= "?$params";
}

// 🔑 TOKEN DE AUTENTICAÇÃO
$token = 'tNhW1BVczaPLXihqyKi8T3ki';

// 🌐 CONFIGURAÇÃO DO CURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "api_access_token: $token",
    "Content-Type: application/json",
    "Accept: application/json",
    "User-Agent: ChatFull-Proxy/1.0"
]);

// 📡 CONFIGURAÇÃO POR MÉTODO HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        curl_setopt($ch, CURLOPT_POST, true);
        $request_body = file_get_contents('php://input');
        if ($request_body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $request_body);
        }
        break;
        
    case 'PUT':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        $request_body = file_get_contents('php://input');
        if ($request_body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $request_body);
        }
        break;
        
    case 'DELETE':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        break;
        
    default: // GET
        // Configuração padrão já definida
        break;
}

// 🚀 EXECUÇÃO DA REQUISIÇÃO
$output = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

// 🔍 LOG PARA DEBUG (opcional - comentar em produção)
error_log("ChatFull Proxy - URL: $url - Method: {$_SERVER['REQUEST_METHOD']} - HTTP Code: $http_code");

curl_close($ch);

// ❌ TRATAMENTO DE ERROS DO CURL
if ($curl_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro de conectividade: ' . $curl_error,
        'endpoint' => $endpoint,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// 📤 RETORNO DA RESPOSTA
http_response_code($http_code);

// Verifica se a resposta é JSON válido
if ($output) {
    $decoded_output = json_decode($output, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        // JSON válido - retorna como está
        echo $output;
    } else {
        // JSON inválido - encapsula em estrutura de erro
        echo json_encode([
            'success' => false,
            'error' => 'Resposta inválida da API do Chatwoot',
            'raw_response' => $output,
            'json_error' => json_last_error_msg(),
            'http_code' => $http_code
        ]);
    }
} else {
    // Resposta vazia
    if ($http_code === 204) {
        // 204 No Content é válido
        echo json_encode(['success' => true, 'message' => 'Operação realizada com sucesso']);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Resposta vazia da API',
            'http_code' => $http_code
        ]);
    }
}
?>
