<?php

namespace App\Console\Commands;

use App\Models\V1\RifaPay;
use App\Services\CyberPaymentService;
use Illuminate\Console\Command;

class CheckPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pagamentos:pendentes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica o status dos pagamentos pendentes usando Cyber Payment Service';

    protected $cyberPaymentService;

    public function __construct(CyberPaymentService $cyberPaymentService)
    {
        parent::__construct();
        $this->cyberPaymentService = $cyberPaymentService;
    }

    public function handle()
    {
        $payments = RifaPay::with('client')->where('status', 0)->whereNotNull('pix_id')->get();

        foreach ($payments as $payment) {
            // No Cyber Payment, o status é verificado pelo pix_id (ID da transação txn_...)
            $response = $this->cyberPaymentService->checkStatus($payment->pix_id);

            if ($response && isset($response['success']) && $response['success']) {
                $status = $response['status'] ?? ($response['data']['status'] ?? null);
                // Unified status check (handling both int and string from API)
                $isApproved = ($status == 1 || $status === 'APPROVED');
                $isPending = ($status == 0 || $status === 'PENDING' || $status === 'WAITING' || $status === 'OPEN');

                if ($isApproved) {
                    $payment->update(['status' => 1]);
                    $clientName = $payment->client ? $payment->client->name : 'Cliente não encontrado';
                    $this->info("O pagamento de {$clientName} com o ID {$payment->id} foi aprovado.");
                } elseif ($isPending) {
                    $this->info("O pagamento de {$payment->id} ainda está pendente (Status: {$status}).");
                } else {
                    // Only mark as canceled if it's explicitly not pending/approved
                    // Add logic here if you want a specific "EXPIRED" check
                    $payment->update(['status' => 2]);
                    $this->info("O pagamento de {$payment->id} expirou ou foi cancelado (Status: {$status}).");
                }
            } else {
                $this->error("Erro ao verificar pagamento ID: {$payment->id}");
            }
        }

        $this->info('Fim da verificação de pagamento.');
    }
}
