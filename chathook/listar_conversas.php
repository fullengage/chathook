<?php
// Habilita CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Verifica se o PHP está sendo executado corretamente
if (php_sapi_name() === 'cli') {
    http_response_code(500);
    echo json_encode(['erro' => 'PHP não está sendo executado como servidor web']);
    exit;
}

require_once dirname(__FILE__) . '/config.php';
require_once dirname(__FILE__) . '/chatwoot_library.php';

// -- AUTENTICAÇÃO SIMPLES POR TOKEN (opcional, remova se não usar) --
$expectedToken = "tNhW1BVczaPLXihqyKi8T3ki";
$headers = getallheaders();
if (!isset($headers['Authorization']) || $headers['Authorization'] !== "Bearer $expectedToken") {
    http_response_code(401);
    echo json_encode(['erro' => 'Token de autenticação inválido']);
    exit;
}

try {
    if (isset($_GET['id_conversa'])) {
        $id_conversa = $_GET['id_conversa'];
        $account_id = $_GET['account_id'] ?? null;
        
        // Busca conversa específica
        $conversa = getChatwootConversation($account_id, $id_conversa);
        echo json_encode($conversa);
        exit;

    } elseif (isset($_GET['account_id'])) {
        $account_id = $_GET['account_id'];
        
        // Lista todas as conversas do account_id
        $conversas = listChatwootConversations($account_id);
        echo json_encode($conversas);
        exit;

    } else {
        http_response_code(400);
        echo json_encode(['erro' => 'Account ID não informado.']);
        exit;
    }
} catch (Exception $e) {
    error_log("Erro em listar_conversas.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao processar requisição',
        'detalhes' => $e->getMessage()
    ]);
    exit;
}
?>
