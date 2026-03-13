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
            // No Cyber Payment, o status é verificado pelo ID da transação (RifaPay ID ou pix_id)
            $response = $this->cyberPaymentService->checkStatus($payment->id);

            if ($response['success']) {
                $status = $response['status']; // 1 = Aprovado, 0 = Pendente, 2 = Expirado/Cancelado

                if ($status == 1) {
                    $payment->update(['status' => 1]);
                    $clientName = $payment->client ? $payment->client->name : 'Cliente não encontrado';
                    $this->info("O pagamento de {$clientName} com o ID {$payment->id} foi aprovado.");
                } elseif ($status == 0) {
                    $this->info("O pagamento de {$payment->id} ainda está pendente.");
                } else {
                    $payment->update(['status' => 2]);
                    $this->info("O pagamento de {$payment->id} expirou ou foi cancelado.");
                }
            } else {
                $this->error("Erro ao verificar pagamento ID: {$payment->id}");
            }
        }

        $this->info('Fim da verificação de pagamento.');
    }
}
