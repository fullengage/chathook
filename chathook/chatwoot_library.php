<?php
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: *');
    header('Content-Type: application/json; charset=UTF-8');
}

// Configuração da API do Chatwoot
function getChatwootConfig() {
    return [
        'api_url' => 'https://app.chatwoot.com/api/v1',
        'api_token' => 'your_api_token_here',
        'api_account_id' => 'your_account_id_here'
    ];
}

// Funções para agentes
function listChatwootAgents($account_id) {
    $config = getChatwootConfig();
    $url = $config['api_url'] . '/accounts/' . $account_id . '/users';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api_access_token: ' . $config['api_token'],
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception('Erro na requisição: ' . curl_error($ch));
    }
    curl_close($ch);
    
    return json_decode($response, true);
}

function getChatwootAgent($account_id, $agent_id) {
    $config = getChatwootConfig();
    $url = $config['api_url'] . '/accounts/' . $account_id . '/users/' . $agent_id;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api_access_token: ' . $config['api_token'],
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception('Erro na requisição: ' . curl_error($ch));
    }
    curl_close($ch);
    
    return json_decode($response, true);
}

// Funções para conversas
function listChatwootConversations($account_id) {
    $config = getChatwootConfig();
    $url = $config['api_url'] . '/accounts/' . $account_id . '/conversations';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api_access_token: ' . $config['api_token'],
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception('Erro na requisição: ' . curl_error($ch));
    }
    curl_close($ch);
    
    return json_decode($response, true);
}

function getChatwootConversation($account_id, $conversation_id) {
    $config = getChatwootConfig();
    $url = $config['api_url'] . '/accounts/' . $account_id . '/conversations/' . $conversation_id;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api_access_token: ' . $config['api_token'],
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception('Erro na requisição: ' . curl_error($ch));
    }
    curl_close($ch);
    
    return json_decode($response, true);
}
