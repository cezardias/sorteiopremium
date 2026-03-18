<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class CyberPaymentService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://api.escalecyber.com/api/v1/';

    public function __construct()
    {
        $this->apiKey = env('CYBER_PAYMENT_API_KEY');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'timeout' => 30,
        ]);
    }

    /**
     * Create a PIX transaction
     * 
     * @param array $data [amount, customerName, customerEmail, customerPhone, customerDocument, description, metadata]
     * @return array
     */
    public function createPixTransaction(array $data)
    {
        try {
            $payload = [
                'amount' => (int) round($data['amount'] * 100),
                'customerName' => $this->sanitizeString($data['customerName']),
                'customerEmail' => $data['customerEmail'],
                'customerPhone' => $this->formatPhone($data['customerPhone']),
                'customerDocument' => $this->cleanDocument($data['customerDocument']),
                'customerDocumentType' => 'cpf', // Always CPF as per request
                'description' => preg_replace('/[^a-zA-Z0-9 ]/', '', $this->sanitizeString($data['description'] ?? 'Compra de Rifas')),
                'metadata' => $data['metadata'] ?? [],
            ];
            
            Log::info('CyberPayment Request Payload: ', $payload);

            $response = $this->client->post('payments/transactions', [
                'json' => $payload,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            $responseBody = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body';
            Log::error('CyberPayment Error Response: ' . $responseBody);
            if ($e->hasResponse()) {
                return json_decode($responseBody, true);
            }
            return ['success' => false, 'message' => 'Erro ao conectar com a API de pagamento.'];
        } catch (GuzzleException $e) {
            Log::error('CyberPayment Error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno na requisição de pagamento.'];
        }
    }

    /**
     * Check transaction status (Alias for command compatibility)
     */
    public function checkStatus($transactionId)
    {
        return $this->getTransactionStatus($transactionId);
    }

    /**
     * Check transaction status
     */
    public function getTransactionStatus($transactionId)
    {
        try {
            $response = $this->client->get("payments/transactions/{$transactionId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('CyberPayment Status Error: ' . $e->getMessage());
            return null;
        }
    }

    private function formatPhone($phone)
    {
        // Simple clean, assuming standard Brazil phone
        $phone = preg_replace('/\D/', '', $phone);
        if (strlen($phone) == 11) {
            return '55' . $phone;
        }
        return $phone;
    }

    private function cleanDocument($document)
    {
        return preg_replace('/\D/', '', $document);
    }

    private function sanitizeString($string)
    {
        $utf8 = [
            '/[áàâãä]/u' => 'a',
            '/[ÁÀÂÃÄ]/u' => 'A',
            '/[éèêë]/u'  => 'e',
            '/[ÉÈÊË]/u'  => 'E',
            '/[íìîï]/u'  => 'i',
            '/[ÍÌÎÏ]/u'  => 'I',
            '/[óòôõö]/u' => 'o',
            '/[ÓÒÔÕÖ]/u' => 'O',
            '/[úùûü]/u'  => 'u',
            '/[ÚÙÛÜ]/u'  => 'U',
            '/[ç]/u'      => 'c',
            '/[Ç]/u'      => 'C',
            '/[ñ]/u'      => 'n',
            '/[Ñ]/u'      => 'N',
        ];
        return preg_replace(array_keys($utf8), array_values($utf8), $string);
    }
}
