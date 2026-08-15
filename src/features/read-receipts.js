/**
 * NovaSocial Read Receipts control.
 *
 * Extracted as a classic script so the chat/profile setting remains an
 * inline-callable window-global without moving DMs/realtime code.
 */
// READ RECEIPTS CONTROL (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
async function toggleReadReceipts(){
  const newVal = !(PROF.read_receipts_enabled !== false);
  try {
    await db.from('profiles').update({read_receipts_enabled: newVal}).eq('id', ME.id);
    PROF.read_receipts_enabled = newVal;
    toast(newVal ? 'Read receipts ON ✓' : 'Read receipts OFF 🔒');
    showEdit();
  } catch(e) {
    toast('Error: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
