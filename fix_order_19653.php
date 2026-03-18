<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\V1\RifaPay;
use App\Models\V1\RifaNumber;
use App\Models\V1\AwardedQuota;
use App\Services\RewardPassService;
use Illuminate\Support\Facades\Log;

$rifaPayId = 19653; // From the logs metadata of the processing event
$rifaPay = RifaPay::find($rifaPayId);

if ($rifaPay && $rifaPay->status == 0) {
    echo "Approving RifaPay $rifaPayId...\n";
    $rifaPay->update(['status' => 1]);
    RifaNumber::where('pay_id', $rifaPay->id)->update(['status' => 1]);

    $numbers = RifaNumber::where('pay_id', $rifaPay->id)->pluck('numbers')->toArray();
    AwardedQuota::ganhadorBilhetePremiado($numbers, $rifaPay->client_id, $rifaPay->rifas_id, $rifaPay->id);

    if (class_exists(RewardPassService::class)) {
        RewardPassService::grantFromApprovedPayment($rifaPay);
    }
    echo "Success: Pedido #$rifaPayId approved.\n";
} else {
    echo "Pedido #$rifaPayId already approved or not found.\n";
}
