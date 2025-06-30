<?php
require_once 'config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: *');
header('Content-Type: application/json; charset=UTF-8');

$data = json_decode(file_get_contents("php://input"), true);

$conversation_id = $data['conversation_id'] ?? null;
$agent_id = $data['agent_id'] ?? null;

if (!$conversation_id || !$agent_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'conversation_id e agent_id são obrigatórios.']);
    exit;
}

$url = CHATWOOT_DOMAIN . "/api/v1/accounts/1/conversations/{$conversation_id}/assignments";

$payload = [
    'assignee_id' => $agent_id
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "api_access_token: " . CHATWOOT_TOKEN
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false || $http_code >= 400) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Falha ao atribuir agente à conversa.",
        "http_code" => $http_code,
        "detalhe" => curl_error($ch),
        "raw_response" => $response
    ]);
} else {
    echo $response;
}

curl_close($ch);
?>
