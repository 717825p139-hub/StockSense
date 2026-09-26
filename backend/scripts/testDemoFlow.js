const API = 'http://localhost:5000/api';

async function runDemoFlowTest() {
  console.log('--- STARTING STOCKSENSE REQUIRED DEMO FLOW VERIFICATION ---');
  
  let token = '';
  let steelRodId = null;
  let rackAId = null;
  let prodRackId = null;

  try {
    // 1. STEP 1: Login
    console.log('\n[STEP 1] Testing Login...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stocksense.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
    token = loginData.token;
    console.log('✓ Login successful! User:', loginData.user.name);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. STEP 2: Dashboard Metrics
    console.log('\n[STEP 2] Fetching Dashboard Metrics...');
    const dashRes = await fetch(`${API}/dashboard`, { headers: authHeaders });
    const dashData = await dashRes.json();
    console.log('✓ Receipts To Receive:', dashData.receipts.to_receive, '| Late:', dashData.receipts.late);
    console.log('✓ Deliveries To Deliver:', dashData.deliveries.to_deliver, '| Late:', dashData.deliveries.late);

    // 3. STEP 3: Initial Stock check for Steel Rod
    console.log('\n[STEP 3] Checking Initial Stock for Steel Rod...');
    const prodRes = await fetch(`${API}/products`, { headers: authHeaders });
    const prodData = await prodRes.json();
    const steelRod = prodData.find(p => p.sku === 'STEEL001');
    steelRodId = steelRod.id;
    console.log(`✓ Found Steel Rod (ID: ${steelRodId}). Total On Hand: ${steelRod.total_on_hand} kg (Expected: 100 kg)`);
    if (parseInt(steelRod.total_on_hand, 10) !== 100) {
      throw new Error(`Initial stock expected 100 kg, got ${steelRod.total_on_hand} kg`);
    }

    // Get location IDs
    const locRes = await fetch(`${API}/locations`, { headers: authHeaders });
    const locData = await locRes.json();
    const rackA = locData.find(l => l.code === 'WH/STOCK1');
    const prodRack = locData.find(l => l.code === 'PWH/PROD1');
    rackAId = rackA.id;
    prodRackId = prodRack.id;

    // 4. STEP 4: Create & Validate Receipt (+50 kg Steel Rod)
    console.log('\n[STEP 4] Creating Receipt WH/IN/NEW for +50 kg Steel Rod...');
    const recRes = await fetch(`${API}/receipts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        scheduled_date: new Date().toISOString().split('T')[0],
        items: [{ product_id: steelRodId, quantity: 50 }],
        notes: 'Demo flow receipt'
      })
    });
    const recData = await recRes.json();
    if (!recRes.ok) throw new Error(recData.error || 'Create receipt failed');
    console.log(`✓ Created Receipt Draft: ${recData.reference} (Status: ${recData.status})`);
    
    console.log(`   Validating receipt ${recData.reference}...`);
    const valRecRes = await fetch(`${API}/receipts/${recData.id}/validate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ target_location_id: rackAId })
    });
    const valRecData = await valRecRes.json();
    if (!valRecRes.ok) throw new Error(valRecData.error || 'Validate receipt failed');
    console.log('✓ Receipt validated! Status:', valRecData.receipt.status);

    // 5. STEP 5: Verify Stock becomes 150 kg
    console.log('\n[STEP 5] Verifying Stock after Receipt...');
    const stockAfterReceiptRes = await fetch(`${API}/products/${steelRodId}`, { headers: authHeaders });
    const stockAfterReceipt = await stockAfterReceiptRes.json();
    const totalAfterRec = stockAfterReceipt.stock_by_location.reduce((acc, c) => acc + parseInt(c.on_hand, 10), 0);
    console.log(`✓ Steel Rod On Hand after receipt: ${totalAfterRec} kg (Expected: 150 kg)`);
    if (totalAfterRec !== 150) {
      throw new Error(`Expected 150 kg after receipt, got ${totalAfterRec} kg`);
    }

    // 6. STEP 6: Internal Transfer 50 kg from Main Rack A -> Production Rack
    console.log('\n[STEP 6] Creating Internal Transfer 50 kg from Main Rack A -> Production Rack...');
    const trRes = await fetch(`${API}/transfers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        from_location_id: rackAId,
        to_location_id: prodRackId,
        items: [{ product_id: steelRodId, quantity: 50 }],
        notes: 'Demo flow transfer'
      })
    });
    const trData = await trRes.json();
    if (!trRes.ok) throw new Error(trData.error || 'Create transfer failed');
    console.log(`✓ Created Transfer Draft: ${trData.reference}`);

    console.log(`   Validating transfer ${trData.reference}...`);
    const valTrRes = await fetch(`${API}/transfers/${trData.id}/validate`, {
      method: 'POST',
      headers: authHeaders
    });
    if (!valTrRes.ok) throw new Error((await valTrRes.json()).error || 'Validate transfer failed');
    
    const stockAfterTrRes = await fetch(`${API}/products/${steelRodId}`, { headers: authHeaders });
    const stockAfterTr = await stockAfterTrRes.json();
    const mainQty = parseInt(stockAfterTr.stock_by_location.find(l => l.location_id === rackAId)?.on_hand || 0, 10);
    const prodQty = parseInt(stockAfterTr.stock_by_location.find(l => l.location_id === prodRackId)?.on_hand || 0, 10);
    const totalAfterTr = mainQty + prodQty;

    console.log(`✓ Transfer validated! Main Rack A: ${mainQty} kg, Production Rack: ${prodQty} kg, Total: ${totalAfterTr} kg`);
    if (mainQty !== 100 || prodQty !== 50 || totalAfterTr !== 150) {
      throw new Error(`Transfer validation failed: Main=${mainQty}, Prod=${prodQty}, Total=${totalAfterTr}`);
    }

    // 7. STEP 7: Check Move History for transfer
    console.log('\n[STEP 7] Checking Move History for Transfer...');
    const movesRes = await fetch(`${API}/move-history`, { headers: authHeaders });
    const movesData = await movesRes.json();
    const transferMove = movesData.find(m => m.reference === trData.reference);
    console.log('✓ Found transfer in Move History:', transferMove.reference, '| Qty:', transferMove.quantity, '| Type:', transferMove.movement_type);

    // 8. STEP 8: Create Delivery -20 kg Steel Rod & Validate
    console.log('\n[STEP 8] Creating Delivery WH/OUT/NEW for 20 kg Steel Rod...');
    const delRes = await fetch(`${API}/deliveries`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        scheduled_date: new Date().toISOString().split('T')[0],
        items: [{ product_id: steelRodId, quantity: 20 }],
        notes: 'Demo flow delivery'
      })
    });
    const delData = await delRes.json();
    if (!delRes.ok) throw new Error(delData.error || 'Create delivery failed');
    console.log(`✓ Created Delivery Draft: ${delData.reference}`);

    console.log(`   Validating delivery ${delData.reference}...`);
    const valDelRes = await fetch(`${API}/deliveries/${delData.id}/validate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ source_location_id: rackAId })
    });
    if (!valDelRes.ok) throw new Error((await valDelRes.json()).error || 'Validate delivery failed');

    const stockAfterDelRes = await fetch(`${API}/products/${steelRodId}`, { headers: authHeaders });
    const stockAfterDel = await stockAfterDelRes.json();
    const totalAfterDel = stockAfterDel.stock_by_location.reduce((acc, c) => acc + parseInt(c.on_hand, 10), 0);
    console.log(`✓ Delivery validated! Total Steel Rod On Hand: ${totalAfterDel} kg (Expected: 130 kg)`);
    if (totalAfterDel !== 130) {
      throw new Error(`Expected 130 kg after delivery, got ${totalAfterDel} kg`);
    }

    // 9. STEP 9: Inventory Adjustment (Physical count: 127 kg)
    console.log('\n[STEP 9] Inventory Adjustment: Physical count = 127 kg...');
    const adjRes = await fetch(`${API}/adjustments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        location_id: rackAId,
        product_id: steelRodId,
        physical_qty: 77, // Main Rack A recorded was 80 kg, physical is 77 kg (so total = 77 + 50 = 127 kg)
        reason: 'Physical count audit (-3 kg variance)'
      })
    });
    const adjData = await adjRes.json();
    if (!adjRes.ok) throw new Error(adjData.error || 'Adjustment failed');
    console.log(`✓ Adjustment Created: ${adjData.reference} | Difference: ${adjData.difference} kg`);

    const finalStockRes = await fetch(`${API}/products/${steelRodId}`, { headers: authHeaders });
    const finalStock = await finalStockRes.json();
    const finalTotal = finalStock.stock_by_location.reduce((acc, c) => acc + parseInt(c.on_hand, 10), 0);
    console.log(`✓ Final Steel Rod Stock: ${finalTotal} kg (Expected: 127 kg)`);
    if (finalTotal !== 127) {
      throw new Error(`Expected final 127 kg after adjustment, got ${finalTotal} kg`);
    }

    // 10. STEP 10: Final Stock Ledger Audit Trail
    console.log('\n[STEP 10] Verifying Complete Stock Ledger Trail...');
    const ledgerRes = await fetch(`${API}/move-history/ledger?product_id=${steelRodId}`, { headers: authHeaders });
    const ledgerData = await ledgerRes.json();

    console.log(`✓ Recorded ${ledgerData.length} ledger entries for Steel Rod:`);
    ledgerData.forEach(l => {
      console.log(`   • ${l.reference} | Change: ${l.change_qty > 0 ? '+' + l.change_qty : l.change_qty} | Balance After: ${l.balance_after} | Type: ${l.movement_type}`);
    });

    console.log('\n==================================================');
    console.log('🎉 DEMO FLOW VERIFICATION: 100% PASS SUCCESSFUL!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ DEMO FLOW VERIFICATION FAILED:', err.message);
    process.exit(1);
  }
}

runDemoFlowTest();
