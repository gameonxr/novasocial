// ── MODERN ICON SYSTEM (Lucide/Feather-style professional) ──────────────────────────────────────

// 🛡️ XSS prevention helper — escapes HTML special characters
function esc(str){
  if(str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ico(n,c='#fff',s=24){
  const a=`width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const af=`width="${s}" height="${s}" viewBox="0 0 24 24"`;
  const m={
    // ── HEART / LIKE ──
    heart:`<svg ${a}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`,
    heartf:`<svg ${af}><path fill="#E1306C" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`,
    // ── COMMENT / CHAT ──
    comment:`<svg ${a}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    // ── SEND / SHARE ──
    send:`<svg ${a}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    share:`<svg ${a}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
    // ── BOOKMARK / SAVE ──
    bm:`<svg ${a}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bmf:`<svg ${af} fill="${c}"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    // ── PLUS / ADD ──
    plus:`<svg ${a}><rect x="3" y="3" width="18" height="18" rx="5" ry="5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    // ── CLOSE / X ──
    close:`<svg ${a} stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    // ── BACK / ARROW ──
    back:`<svg ${a} stroke-width="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    // ── MORE / DOTS ──
    more:`<svg ${a} stroke="none" fill="${c}"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>`,
    more_v:`<svg ${a} stroke="none" fill="${c}"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`,
    // ── VERIFIED (Instagram-style blue badge) ──
    // Simple scalloped seal with checkmark — renders perfectly at any size
    verified:`<svg ${af} viewBox="0 0 24 24"><path fill="#3897f0" d="M12 1.5l1.95 1.54 2.46-.29 1.07 2.24 2.24 1.07-.29 2.46L20.97 12l-1.54 1.95.29 2.46-2.24 1.07-1.07 2.24-2.46-.29L12 20.97l-1.95-1.54-2.46.29-1.07-2.24-2.24-1.07.29-2.46L3.03 12l1.54-1.95-.29-2.46 2.24-1.07 1.07-2.24 2.46.29L12 1.5z"/><path fill="#fff" d="M10.4 14.6l-2.2-2.2-1.1 1.1 3.3 3.3 5.5-5.5-1.1-1.1z" stroke="none"/></svg>`,
    // ── VERIFIED PLUS (gold badge — no gradient ID conflicts) ──
    verified_plus:`<svg ${af} viewBox="0 0 24 24"><path fill="#ffaa00" d="M12 1.5l1.95 1.54 2.46-.29 1.07 2.24 2.24 1.07-.29 2.46L20.97 12l-1.54 1.95.29 2.46-2.24 1.07-1.07 2.24-2.46-.29L12 20.97l-1.95-1.54-2.46.29-1.07-2.24-2.24-1.07.29-2.46L3.03 12l1.54-1.95-.29-2.46 2.24-1.07 1.07-2.24 2.46.29L12 1.5z"/><path fill="#000" d="M10.4 14.6l-2.2-2.2-1.1 1.1 3.3 3.3 5.5-5.5-1.1-1.1z" stroke="none"/></svg>`,
    // ── TRASH / DELETE ──
    trash:`<svg ${a}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    // ── GRID ──
    grid:`<svg ${a}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    // ── REEL ──
    reelico:`<svg ${a}><rect x="2" y="2" width="20" height="20" rx="5"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="8" y1="2" x2="8" y2="8"/><line x1="16" y1="2" x2="16" y2="8"/><polygon points="10 13 16 16 10 19 10 13" fill="${c}" stroke="none"/></svg>`,
    // ── CAMERA ──
    cam:`<svg ${a}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    // ── SETTINGS / GEAR ──
    set:`<svg ${a}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6m11-11h-6M7 12H1m17.07-7.07L15.54 6.46M8.46 15.54l-2.54 2.54m12.61 0l-2.54-2.54M8.46 8.46L5.93 5.93"/></svg>`,
    set2:`<svg ${a}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    // ── SEARCH ──
    search:`<svg ${a}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    // ── DM / MESSAGE ──
    dm:`<svg ${a}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    // ── GROUP / USERS ──
    group:`<svg ${a}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    user:`<svg ${a}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    // ── IMAGE ──
    img:`<svg ${a}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    // ── VIDEO ──
    vid:`<svg ${a}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    // ── BELL / NOTIFICATION ──
    bell:`<svg ${a}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    bell_off:`<svg ${a}><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    // ── LINK ──
    link:`<svg ${a}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    // ── MIC ──
    mic:`<svg ${a}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    // ── STOP ──
    stop:`<svg ${af} fill="${c}"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
    // ── MUTE / UNMUTE ──
    mute:`<svg ${a}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="${c}"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    unmute:`<svg ${a}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="${c}"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    // ── QR CODE ──
    qr:`<svg ${a}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="18" y1="14" x2="21" y2="14"/><line x1="21" y1="18" x2="21" y2="21"/><line x1="14" y1="21" x2="17" y2="21"/><line x1="18" y1="17" x2="18" y2="17"/></svg>`,
    // ── PHONE / CALL ──
    phone:`<svg ${a}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    phone_off:`<svg ${a}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>`,
    // ── VIDEO CALL ──
    video:`<svg ${a}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    // ── UPLOAD / DOWNLOAD ──
    upload:`<svg ${a}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    download:`<svg ${a}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    // ── HOME ──
    home:`<svg ${a}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    // ── CALENDAR ──
    calendar:`<svg ${a}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    // ── WALLET ──
    wallet:`<svg ${a}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>`,
    // ── SHIELD / SECURITY ──
    shield:`<svg ${a}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    // ── EYE / VIEWS ──
    eye:`<svg ${a}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    // ── STAR ──
    star:`<svg ${a}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    star_f:`<svg ${af} fill="${c}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    // ── TAG ──
    tag:`<svg ${a}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    // ── PIN / LOCATION ──
    pin:`<svg ${a}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    // ── CLOCK / TIME ──
    clock:`<svg ${a}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    // ── BOLT / LIGHTNING ──
    bolt:`<svg ${af} fill="${c}"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    // ── PLAY ──
    play:`<svg ${af} fill="${c}"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause:`<svg ${af} fill="${c}"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    // ── VOLUME ──
    volume:`<svg ${a}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="${c}"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    // ── SETTINGS SLIDERS ──
    sliders:`<svg ${a}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
    // ── EDIT / PENCIL ──
    edit:`<svg ${a}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    // ── GHOST ──
    ghost:`<svg ${a}><path d="M9 12h.01M15 12h.01M12 2a9 9 0 0 0-9 9v9l3-3 3 3 3-3 3 3 3-3 3 3V11a9 9 0 0 0-9-9z"/></svg>`,
    // ── GLOBE / TRANSLATE ──
    globe:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    // ── SPARKLES / AI ──
    sparkles:`<svg ${a}><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></svg>`,
    // ── ROBOT / AI BOT ──
    bot:`<svg ${a}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
    // ── ZAP / FAST ──
    zap:`<svg ${af} fill="${c}"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    // ── FILM / REEL ──
    film:`<svg ${a}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
    // ── PALETTE / THEME ──
    palette:`<svg ${a}><circle cx="13.5" cy="6.5" r=".5" fill="${c}"/><circle cx="17.5" cy="10.5" r=".5" fill="${c}"/><circle cx="8.5" cy="7.5" r=".5" fill="${c}"/><circle cx="6.5" cy="12.5" r=".5" fill="${c}"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    // ── BOOK / JOURNAL ──
    book:`<svg ${a}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    // ── BRAIN / AI ──
    brain:`<svg ${a}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>`,
    // ── FIRE / TRENDING ──
    fire:`<svg ${a}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    // ── MESSAGE CIRCLE ──
    msg:`<svg ${a}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    // ── HEART CRACKED ──
    heart_crack:`<svg ${a}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 1.5-1.5"/><polyline points="12 12 9.5 9.5 12 7 9.5 4.5"/></svg>`,
    // ── CHECK ──
    check:`<svg ${a}><polyline points="20 6 9 17 4 12"/></svg>`,
    check_circle:`<svg ${a}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    // ── INFO ──
    info:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    // ── HELP / QUESTION ──
    help:`<svg ${a}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    // ── FLAG / REPORT ──
    flag:`<svg ${a}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    // ── SHIELD (admin) ──
    shield:`<svg ${a}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    // ── MAIL / SPAM ──
    mail:`<svg ${a}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    // ── ALERT (exclamation in circle) ──
    alert:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    // ── ALERT TRIANGLE (warning) ──
    alert_triangle:`<svg ${a}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    // ── EYE OFF (hidden content) ──
    eye_off:`<svg ${a}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    // ── X CIRCLE (reject/close) ──
    x_circle:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    // ── CHEVRON RIGHT ──
    chevron_right:`<svg ${a}><polyline points="9 18 15 12 9 6"/></svg>`,
    // ── GLOBE ──
    globe:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    // ── LOGOUT ──
    logout:`<svg ${a}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    // ── KEY ──
    key:`<svg ${a}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    // ── FINGERPRINT ──
    fingerprint:`<svg ${a}><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/></svg>`,
    // ── PLAY CIRCLE ──
    play_circle:`<svg ${a}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="${c}"/></svg>`,
    // ── COMPASS / EXPLORE ──
    compass:`<svg ${a}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    // ── TV / LIVE ──
    tv:`<svg ${a}><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
    // ── RADIO / LIVE ──
    radio:`<svg ${a}><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,
    // ── MUSIC ──
    music:`<svg ${a}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    // ── SMILE / EMOJI ──
    smile:`<svg ${a}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    // ── CAMERA OFF ──
    cam_off:`<svg ${a}><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/></svg>`,
    // ── PAPERCLIP / ATTACH ──
    attach:`<svg ${a}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
    // ── HASH ──
    hash:`<svg ${a}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
    // ── POLL / BAR CHART ──
    poll:`<svg ${a}><line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>`,
    // ── AT SIGN ──
    at:`<svg ${a}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>`,
    // ── LOCK / UNLOCK ──
    lock:`<svg ${a}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    unlock:`<svg ${a}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    // ── CROWN ──
    crown:`<svg ${af} fill="${c}"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
    // ── DIAMOND ──
    diamond:`<svg ${a}><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/><path d="M11 3L8 9l4 13 4-13-3-6"/><line x1="2" y1="9" x2="22" y2="9"/></svg>`,
    // ── ROCKET ──
    rocket:`<svg ${a}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    // ── GIFT ──
    gift:`<svg ${a}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    // ── SHOPPING BAG / MARKETPLACE ──
    bag:`<svg ${a}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    // ── GRADUATION CAP / LEARNING ──
    cap:`<svg ${a}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/></svg>`,
    // ── NEWSPAPER / NEWS ──
    news:`<svg ${a}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>`,
    // ── GAMEPAD ──
    gamepad:`<svg ${a}><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>`,
    // ── HEADPHONES / VOICE ──
    headphones:`<svg ${a}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
    // ── SPEAKER ──
    speaker:`<svg ${a}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>`,
    // ── CLOUD ──
    cloud:`<svg ${a}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
    // ── WIFI ──
    wifi:`<svg ${a}><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    // ── FILTER ──
    filter:`<svg ${a}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    // ── LIST ──
    list:`<svg ${a}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    // ── MAXIMIZE / EXPAND ──
    maximize:`<svg ${a}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    // ── MINIMIZE ──
    minimize:`<svg ${a}><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`,
    // ── REFRESH ──
    refresh:`<svg ${a}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    // ── COPY ──
    copy:`<svg ${a}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    // ── EXTERNAL LINK ──
    ext_link:`<svg ${a}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    // ── CAMERA (alt) ──
    cam2:`<svg ${a}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    // ── IMAGE PLUS ──
    img_plus:`<svg ${a}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    // ── MUTE MIC ──
    mic_off:`<svg ${a}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/></svg>`,
    // ── VIDEO OFF ──
    video_off:`<svg ${a}><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    // ── PIN OFF ──
    pin_off:`<svg ${a}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 9-9"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    // ── ARROW UP ──
    arrow_up:`<svg ${a}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    arrow_down:`<svg ${a}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
    arrow_right:`<svg ${a}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    arrow_left:`<svg ${a}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    // ── CHEVRON ──
    chevron_right:`<svg ${a}><polyline points="9 18 15 12 9 6"/></svg>`,
    chevron_down:`<svg ${a}><polyline points="6 9 12 15 18 9"/></svg>`,
    // ── REFRESH CW ──
    refresh_cw:`<svg ${a}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    // ── BOOK OPEN ──
    book_open:`<svg ${a}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    // ── BRIEFCASE / BUSINESS ──
    briefcase:`<svg ${a}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    // ── DUMBELL / FITNESS ──
    dumbbell:`<svg ${a}><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/></svg>`,
    // ── UMBRELLA / TRAVEL ──
    umbrella:`<svg ${a}><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>`,
    // ── UTENSILS / FOOD ──
    utensils:`<svg ${a}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-3 9v4"/></svg>`,
    // ── PAINT / ART ──
    paint:`<svg ${a}><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5-4.5-9-10-9z"/></svg>`,
    // ── GRAPH / ANALYTICS ──
    graph:`<svg ${a}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    // ── PIE CHART ──
    pie:`<svg ${a}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
    // ── THUMBS UP ──
    thumbs_up:`<svg ${a}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
    // ── MESSAGE SQUARE ──
    msg_square:`<svg ${a}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    // ── HEART PULSE ──
    heart_pulse:`<svg ${a}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 1.5-1.5"/><polyline points="3 12 7 12 9 8 13 16 15 12 21 12"/></svg>`,

    // ═══════════════════════════════════════════════════════════════
    // 🚫 NO EMOJI POLICY — READ BEFORE ADDING ANY NEW UI
    // ═══════════════════════════════════════════════════════════════
    // Ye ek world-wide premium application hai. Emoji characters
    // (❤️🔥✨ etc) KABHI use nahi karne — inka rendering OS/browser
    // ke hisaab se badalta hai (iOS emoji ≠ Android emoji ≠ Windows
    // emoji) jisse app ka look inconsistent lagta hai.
    //
    // INSTEAD: Hamesha ico('icon_name', 'color', size) function
    // use karo jo custom SVG deta hai — consistent across ALL
    // devices, professional look, matches design system.
    //
    // Naya icon chahiye jo ico() mein exist nahi karta?
    // → https://lucide.dev ya https://heroicons.com se SVG path
    //   copy karo aur ico() function ke object mein add karo
    //
    // Plain text/toast mein bhi emoji mat daalo — sirf clean text.
    // ═══════════════════════════════════════════════════════════════
    // ── PREMIUM ICON SET — Emoji replacement ke liye ──
    shield_check:`<svg ${a}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    sparkle:`<svg ${af}><path fill="${c}" d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/></svg>`,
    clapper:`<svg ${a}><path d="M4 8l16-3M4 8l4 6M4 8v11h16V8"/><path d="M8 8l4-6"/><path d="M13 8l4-6"/></svg>`,
    users:`<svg ${a}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    flame:`<svg ${af}><path fill="${c}" d="M12 2c-1.5 3-4 5.5-4 9a4 4 0 0 0 8 0c0-1-.5-2-1-3 1.5 1 2.5 3 2.5 5a5.5 5.5 0 0 1-11 0c0-4.5 3.5-7.5 5.5-11z"/></svg>`,
    message_circle:`<svg ${a}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    music_note:`<svg ${a}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    cpu:`<svg ${a}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>`,
    trending_up:`<svg ${a}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    lightbulb:`<svg ${a}><path d="M9 18h6M10 22h4M15.09 14c.18-1 .65-1.62 1.35-2.36A6 6 0 1 0 10 11.7c0 .3-.1.7-.34 1.02"/><path d="M9 18v-4.5"/></svg>`,
    trash_2:`<svg ${a}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>`,
    user_circle:`<svg ${a}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19.5a6 6 0 0 1 11 0"/></svg>`,
    red_dot:`<svg ${af}><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`,
    thinking:`<svg ${a}><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><line x1="12" y1="16.5" x2="12.01" y2="16.5"/></svg>`,
    orbit:`<svg ${a}><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" opacity="0.3"/><ellipse cx="12" cy="12" rx="10" ry="4"/></svg>`,
    grad_cap:`<svg ${a}><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/></svg>`,
    bar_chart:`<svg ${a}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    ban:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    shopping_bag:`<svg ${a}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    gem:`<svg ${a}><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3L8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>`,
    comet:`<svg ${a}><circle cx="17" cy="7" r="3"/><path d="M14.5 9.5L3 21"/><path d="M11 12L6 17"/><path d="M8 9L3 14" opacity="0.5"/></svg>`,
    plus_circle:`<svg ${a}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    laptop:`<svg ${a}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="21" x2="22" y2="21"/></svg>`,
    wave:`<svg ${a}><path d="M18 8.5c0 2-2 2-2 4s2 2 2 4M14 8.5c0 2-2 2-2 4s2 2 2 4M10 8.5c0 2-2 2-2 4s2 2 2 4M6 8.5c0 2-2 2-2 4s2 2 2 4"/></svg>`,
  };
  return m[n]||m['help'];
}

function av(url,name,size=36,ring=false,online=false){
  const l=(name||'?')[0].toUpperCase();
  // FIX: Add onerror fallback so broken avatar images show first letter instead of "K" or broken img
  const safeName = (name||'?').replace(/'/g,"\\'").replace(/"/g,'&quot;');
  // ── Part 7 Fix 1: Apply avatar Cloudinary transform at display time
  // (stored URL stays full-quality, only display URL gets resized/cropped)
  const displayUrl = url ? cldUrl(url, NOVA_MEDIA_CONFIG.avatar.cloudTransform) : '';
  const inner=displayUrl?`<img src="${displayUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:${Math.round(size*0.42)}px;font-weight:700;line-height:1\\'>${l}</span>'">`:`<span style="font-size:${Math.round(size*0.42)}px;font-weight:700;line-height:1">${l}</span>`;
  let html;
  if(ring) html=`<div class="avring"><div class="avrinner"><div class="av" style="width:${size-5}px;height:${size-5}px">${inner}</div></div></div>`;
  else html=`<div class="av" style="width:${size}px;height:${size}px">${inner}</div>`;
  // Bug 1 Fix: Always wrap in flex-shrink:0 so avatar isn't squished in flex containers
  if(online) return `<div style="position:relative;flex-shrink:0">${html}<div class="onlinedot"></div></div>`;
  return `<div style="flex-shrink:0">${html}</div>`;
}

// Sanitize URLs — strip file:///, content://, and other non-web URLs
function sanitizeUrl(url){
  if(!url) return '';
  const u = String(url);
  // Only allow http/https URLs
  if(u.startsWith('http://') || u.startsWith('https://')) return u;
  // Strip file:/// content:// etc, just show the meaningful part
  if(u.startsWith('file:///') || u.startsWith('content://')){
    // Try to extract domain/path
    const match = u.match(/(?:https?\/\/|\/\/)([^\/]+)/);
    return match ? 'https://' + match[1] : '';
  }
  // Bare domains like google.com
  if(u.match(/^[a-z0-9.-]+\.(com|net|org|io|co|in|me|app|dev|ai)/i)){
    return 'https://' + u;
  }
  return u;
}

function linkify(text) {
  if (!text) return '';
  // Regex to match URLs (http, https, www, or bare domains like google.com)
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[a-z0-9.-]+\.(com|net|org|io|co|in|me|app)\b[-A-Z0-9+&@#\/%?=~_|!:,.;]*)/gi;
  return text.replace(urlRegex, function(url) {
    let href = url;
    if (!href.match(/^https?:\/\//i)) {
      href = 'http://' + href; // Add http:// if missing
    }
    return '<a href="' + href + '" target="_blank" style="color:#4FC3F7;text-decoration:underline;">' + url + '</a>';
  });
}

function fmt(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'k':String(n||0)}
function ago(ts){const s=Math.floor((Date.now()-new Date(ts))/1000);if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d';}
function isOnline(ts){if(!ts)return false;return (Date.now()-new Date(ts).getTime())<5*60*1000;}

function lastSeenText(ts){
  if(!ts) return '';
  const diff=Math.floor((Date.now()-new Date(ts).getTime())/1000);
  if(diff < 60) return 'Active now';
  if(diff < 3600) return `Last seen ${Math.floor(diff/60)}m ago`;
  if(diff < 86400) return `Last seen ${Math.floor(diff/3600)}h ago`;
  return `Last seen ${Math.floor(diff/86400)}d ago`;
}

let toastT;
function toast(msg, iconName, iconColor){
  const t = document.getElementById('toast');
  if(!t) { setTimeout(()=>toast(msg, iconName, iconColor), 100); return; }
  // HTML-capable: agar iconName diya gaya hai to SVG icon bhi dikhega
  // Plain-text backward compatible: agar iconName nahi hai to sirf text
  if(iconName && typeof ico === 'function'){
    try {
      const svg = ico(iconName, iconColor || '#fff', 16);
      t.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px">${svg}<span>${msg}</span></span>`;
    } catch(e) {
      t.textContent = msg; // fallback to plain text if SVG fails
    }
  } else {
    t.textContent = msg;
  }
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════════════════════════
// 🎨 PREMIUM CONFIRM DIALOG — native confirm() replacement
// Returns Promise<boolean> (true on confirm, false on cancel/outside-tap)
// Mirrors native confirm()'s usage pattern — call sites just add `await`.
// Style aligned with the app's existing modals/action-sheets:
//   • Overlay: rgba(0,0,0,0.6) + blur(12px) + z-index:10000 (matches action-sheet)
//   • Card: #0A0A0A bg, border-radius:16px (matches .bgrd / .bout radius)
//   • Border: 1px solid rgba(255,255,255,0.08) (matches .bout border)
//   • Danger confirm: linear-gradient(135deg,#FF2D7A,#833AB4) (matches .bgrd)
//   • Cancel: transparent + subtle border (matches .bout)
//   • Animation: novaFadeIn (existing keyframe used by action-sheets)
// ═══════════════════════════════════════════════════════════════
function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    const title = options.title || 'Are you sure?';
    const confirmText = options.confirmText || 'Confirm';
    const cancelText = options.cancelText || 'Cancel';
    // Default danger=true — most confirm dialogs in this app are for destructive
    // actions (block, delete, etc.), so the gradient style is the sensible default.
    // Pass { danger: false } for non-destructive confirms (e.g., "Save changes?").
    const danger = options.danger !== false;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;animation:novaFadeIn 0.2s ease';

    // Injected <style> block — added once per dialog instance (cheap, removed with overlay).
    // Provides the subtle press feedback on Cancel/Confirm buttons (scale + opacity).
    // Without this, taps give zero visual feedback before the dialog closes.
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      #ncd-cancel, #ncd-confirm {
        transition: transform 0.1s ease, opacity 0.1s ease;
      }
      #ncd-cancel:active, #ncd-confirm:active {
        transform: scale(0.96);
        opacity: 0.85;
      }
    `;

    overlay.innerHTML = `
      <div style="background:#0A0A0A;border-radius:20px;padding:24px 20px;max-width:340px;width:100%;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.5);text-align:center">
        <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:10px">${title}</div>
        <div style="font-size:14px;color:#999;line-height:1.5;margin-bottom:22px">${message}</div>
        <div style="display:flex;gap:10px">
          <button id="ncd-cancel" style="flex:1;padding:13px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:#fff;font-size:14px;font-weight:600;cursor:pointer">${cancelText}</button>
          <button id="ncd-confirm" style="flex:1;padding:13px;border-radius:12px;border:none;background:${danger ? 'linear-gradient(135deg,#FF2D7A,#833AB4)' : '#333'};color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:${danger ? '0 4px 14px rgba(255,45,122,0.25)' : 'none'}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.head.appendChild(styleTag);

    const close = (result) => {
      overlay.remove();
      styleTag.remove(); // clean up the <style> block along with the overlay
      resolve(result);
    };

    overlay.querySelector('#ncd-cancel').onclick = () => close(false);
    overlay.querySelector('#ncd-confirm').onclick = () => close(true);
    // Tap on overlay (outside the card) = cancel — matches native confirm behavior
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };

    // Auto-focus the confirm button so Enter key works (matches native confirm default)
    try { overlay.querySelector('#ncd-confirm').focus(); } catch(_) {}
  });
}
