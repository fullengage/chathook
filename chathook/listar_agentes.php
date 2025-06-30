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
    if (isset($_GET['id_agente'])) {
        $id_agente = $_GET['id_agente'];
        $account_id = $_GET['account_id'] ?? null;
        
        // Busca agente específico
        $agente = getChatwootAgent($account_id, $id_agente);
        echo json_encode($agente);
        exit;

    } elseif (isset($_GET['account_id'])) {
        $account_id = $_GET['account_id'];
        
        // Lista todos os agentes do account_id
        $agentes = listChatwootAgents($account_id);
        echo json_encode($agentes);
        exit;

    } else {
        http_response_code(400);
        echo json_encode(['erro' => 'Account ID não informado.']);
        exit;
    }
} catch (Exception $e) {
    error_log("Erro em listar_agentes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao processar requisição',
        'detalhes' => $e->getMessage()
    ]);
    exit;
}
?>
