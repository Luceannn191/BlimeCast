import React, { useState } from 'react';
import {
  Lock,
  RefreshCw,
  LogOut,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Calendar,
  Building,
  CreditCard,
  QrCode
} from 'lucide-react';
import { SublimationOrder, OrderStatus } from '../types';
import { PAYMENT_METHODS } from '../data';

export interface AdminPanelProps {
  orders: SublimationOrder[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onResetDemoData: () => void;
}

export default function AdminPanel({
  orders,
  onUpdateStatus,
  onResetDemoData
}: AdminPanelProps) {
  // Admin access state
  const [isAdminLogged, setIsAdminLogged] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<string>('');
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('Semua');
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<SublimationOrder | null>(null);

  // Simple Admin Login PIN Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234') {
      setIsAdminLogged(true);
      setAdminPinError('');
    } else {
      setAdminPinError('PIN salah! Gunakan PIN demo "1234".');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLogged(false);
    setAdminPinInput('');
    setSelectedAdminOrder(null);
  };

  // Filter and search orders in Admin Dashboard
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = adminFilterStatus === 'Semua' || order.status === adminFilterStatus;
    
    const matchesKeyword = order.items && order.items.length > 0 ? (
      order.items.some(item => 
        item.product.name.toLowerCase().includes(adminSearchTerm.toLowerCase())
      )
    ) : false;
    
    const legacyMatchesKeyword = order.product?.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) || false;
    
    const matchesSearch = 
      order.waNumber.includes(adminSearchTerm) || 
      order.id.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      matchesKeyword ||
      legacyMatchesKeyword;

    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatusLocal = (orderId: string, newStatus: OrderStatus) => {
    onUpdateStatus(orderId, newStatus);
    
    // Auto sync selected order detail
    if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
      setSelectedAdminOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleResetDemoDataLocal = () => {
    onResetDemoData();
    setSelectedAdminOrder(null);
  };

  return (
    <div className="space-y-6">
      
      {/* ADMIN ACCESS VERIFICATION BAR */}
      {!isAdminLogged ? (
        <div className="max-w-md mx-auto bg-[#0a4843] rounded-3xl border border-teal-500/20 p-6 md:p-8 text-center shadow-2xl mt-12">
          <span className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Lock className="w-6 h-6" />
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Kredensial Otorisasi Admin</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Harap masukkan PIN Admin Blimcast untuk mengelola status pesanan pelanggan.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                Masukkan PIN Demo Admin:
              </label>
              <input
                type="password"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="Masukkan PIN (Gunakan: 1234)"
                className="w-full bg-[#052b27] border border-teal-500/20 hover:border-teal-500/40 focus:border-rose-500 text-white rounded-xl py-3.5 px-4 text-center font-mono tracking-widest placeholder-slate-700 outline-none transition-colors"
                maxLength={8}
                required
              />
              
              {adminPinError && (
                <p className="text-[11px] text-rose-400 mt-2 text-center font-mono font-medium">
                  ❌ {adminPinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              Buka Dashboard Admin
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-850 text-[11px] text-slate-500 text-left">
            ⚠️ <span className="font-bold text-slate-300 font-mono">Demo PIN:</span> Masukkan angka <span className="text-rose-400 font-bold font-mono">1234</span> untuk login secara instan dalam masa pengujian prototipe.
          </div>
        </div>
      ) : (
        
        /* RENDER MAIN ADMIN WORKSTATION BOARD */
        <div className="bg-[#0a4843] rounded-3xl border border-teal-500/20 p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
          
          {/* ADMIN WORKSTATION HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono uppercase rounded border border-rose-500/25">
                🔒 Otorisasi Terbuka - Developer Mode
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1.5 flex items-center gap-2">
                <span>PANEL KASIR & DRIP-FEED CETAK</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Database Seeder Button */}
              <button
                onClick={handleResetDemoDataLocal}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 font-mono hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Seeder data</span>
              </button>

              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* FILTERING AND METRICS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Metrics Grid Item 1 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Total Masuk</span>
              <span className="text-2xl font-black text-white font-mono">{orders.length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Pesanan Terdaftar</span>
            </div>
            
            {/* Total Metrics Grid Item 2 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Diproses</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">
                {orders.filter(o => o.status === 'Sedang Diproses/Dicetak').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Butuh Dicetak Segera</span>
            </div>

            {/* Total Metrics Grid Item 3 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Menunggu Bayar</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {orders.filter(o => o.status === 'Menunggu Pembayaran').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Menunggu Review QRIS</span>
            </div>

            {/* Total Metrics Grid Item 4 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Selesai</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {orders.filter(o => o.status === 'Selesai').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Sudah Diambil/Kirim</span>
            </div>
          </div>

          {/* SEARCH INPUT BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan No. WA, ID, atau nama produk..."
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-10 pr-4 py-3 text-xs rounded-xl outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Status Categorizer Selector */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2.5 rounded-xl">
                <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={adminFilterStatus}
                  onChange={(e) => setAdminFilterStatus(e.target.value)}
                  className="w-full bg-transparent text-slate-300 py-3 text-xs outline-none border-none focus:ring-0 rounded-xl"
                >
                  <option value="Semua" className="bg-slate-950">Status: Semua</option>
                  <option value="Menunggu Pembayaran" className="bg-slate-950">Status: Menunggu Bayar</option>
                  <option value="Sedang Diproses/Dicetak" className="bg-slate-950">Status: Sedang Diproses</option>
                  <option value="Selesai" className="bg-slate-950">Status: Selesai</option>
                  <option value="Dibatalkan" className="bg-slate-950">Status: Dibatalkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE LIST TABLE - HIGHLY MOBILE FRIENDLY GRID AND DESKTOP COMPLIANT */}
          <div className="overflow-x-auto rounded-xl border border-slate-850">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4">ID / Invoice</th>
                  <th className="p-4">Pelanggan (WA)</th>
                  <th className="p-4">Dipesan</th>
                  <th className="p-4 text-right justify-end">Biaya Akhir</th>
                  <th className="p-4">Bahan Pengunggah</th>
                  <th className="p-4">Aksi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block">{order.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{order.orderDate}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-semibold text-slate-300">{order.waNumber}</div>
                        <span className="text-[10px] text-slate-500">No. WA Track</span>
                      </td>

                      <td className="p-4">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-850 max-w-[200px]">
                                <span className="font-black text-slate-100 text-[11px] block truncate" title={item.product.name}>
                                  {item.product.name}
                                </span>
                                <span className="text-[10px] text-indigo-400 font-mono font-semibold block">
                                  {item.quantity} {item.product.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-950/60 p-2 rounded border border-slate-850 max-w-[200px]">
                            <span className="font-black text-slate-100 text-[11px] block truncate">{order.product?.name || 'Produk'}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{order.quantity} {order.product?.unit || 'pcs'}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-indigo-400 block">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                        <span className="text-[9px] text-slate-500 font-mono tracking-tight uppercase">
                          {PAYMENT_METHODS.find(p => p.id === order.paymentMethod)?.id || order.paymentMethod}
                        </span>
                      </td>

                      <td className="p-4">
                        {/* Open detail review trigger */}
                        {(() => {
                          const totalDesigns = order.items && order.items.length > 0
                            ? order.items.reduce((sum, item) => sum + item.designs.length, 0)
                            : order.designs?.length || 0;
                          
                          if (totalDesigns === 0) {
                            return (
                              <button
                                onClick={() => setSelectedAdminOrder(order)}
                                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-md font-mono text-[10px] flex items-center justify-center gap-1 cursor-pointer w-full text-center font-bold"
                              >
                                <span>🎨 Desainkan Admin</span>
                                <ChevronRight className="w-3 h-3 text-emerald-400" />
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={() => setSelectedAdminOrder(order)}
                              className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-md font-mono text-[10px] flex items-center justify-center gap-1 cursor-pointer w-full text-center font-bold"
                            >
                              <span>Lihat {totalDesigns} Desain</span>
                              <ChevronRight className="w-3 h-3 text-indigo-400" />
                            </button>
                          );
                        })()}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatusLocal(order.id, e.target.value as OrderStatus)}
                            className={`px-2 py-1 text-[10px] rounded font-bold uppercase cursor-pointer border ${
                              order.status === 'Menunggu Pembayaran' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                              order.status === 'Sedang Diproses/Dicetak' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                              order.status === 'Selesai' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                              'bg-rose-400/10 text-rose-400 border-rose-400/20'
                            }`}
                          >
                            <option value="Menunggu Pembayaran" className="bg-slate-950 font-sans text-xs">Menunggu Bayar</option>
                            <option value="Sedang Diproses/Dicetak" className="bg-slate-950 font-sans text-xs">Diproses/Dicetak</option>
                            <option value="Selesai" className="bg-slate-950 font-sans text-xs">Selesai</option>
                            <option value="Dibatalkan" className="bg-slate-950 font-sans text-xs">Dibatalkan</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      Tidak ditemukan hasil pencocokan pesanan terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MODAL / BOTTOM EXPANDER FOR ADMIN FILE AND NOTES INSPECTOR */}
          {selectedAdminOrder && (
            <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-3xl animate-fade-in space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                    Inspektur Berkas Mockup: Pesanan {selectedAdminOrder.id}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pelanggan: <span className="font-mono text-indigo-400 font-bold">{selectedAdminOrder.waNumber}</span> — {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
                      <span className="text-indigo-300 font-bold">{selectedAdminOrder.items.map(it => `${it.product.name} (${it.quantity} ${it.product.unit})`).join(', ')}</span>
                    ) : (
                      <span className="text-indigo-300 font-bold">{selectedAdminOrder.product?.name || 'Produk'}</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAdminOrder(null)}
                  className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1 rounded text-slate-400 cursor-pointer"
                >
                  Tutup Editor
                </button>
              </div>

              {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
                <div className="space-y-6">
                  {selectedAdminOrder.items.map((cartItem, itemIdx) => (
                    <div key={cartItem.product.id || itemIdx} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <div className="w-6 h-6 rounded overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          <img src={cartItem.product.imageUrl} alt={cartItem.product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">
                          {cartItem.product.name} ({cartItem.quantity} {cartItem.product.unit})
                        </span>
                      </div>
                      
                      {cartItem.designs && cartItem.designs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {cartItem.designs.map((design, dIdx) => (
                            <div key={design.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5">
                              <div className="aspect-square w-full rounded-lg bg-slate-900 overflow-hidden relative border border-slate-800">
                                <img
                                  src={design.previewUrl}
                                  alt={design.fileName}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <a
                                  href={design.previewUrl}
                                  download={`Blimcast-${selectedAdminOrder.id}-${cartItem.product.id}-Design${dIdx + 1}.${design.fileName.split('.').pop()}`}
                                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/95 text-white hover:bg-indigo-600 rounded text-[9px] font-mono tracking-tighter uppercase transition-colors"
                                >
                                  Unduh File Asli
                                </a>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase truncate" title={design.fileName}>
                                  FILE #{dIdx + 1}: {design.fileName.length > 15 ? `${design.fileName.substring(0, 15)}...` : design.fileName}
                                </p>
                                <div className="p-2 bg-slate-900 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-850 min-h-[45px]">
                                  <span className="text-[9px] text-indigo-400 uppercase font-mono block">Instruksi Cetak:</span>
                                  {design.notes || <span className="text-slate-600 italic">"Tidak ada catatan tertulis khusus."</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-start gap-2.5 max-w-lg font-sans">
                          <span className="text-sm">🎨</span>
                          <div>
                            <span className="font-bold block mb-0.5">Opsi Kami Desainkan Aktif</span>
                            <span className="opacity-80">Pelanggan meminta bantuan desain kustom profesional dari tim Blimcast. Silakan berdiskusi via WhatsApp ({selectedAdminOrder.waNumber}) untuk bertukar konsep layout atau file logo.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedAdminOrder.designs && selectedAdminOrder.designs.length > 0 ? (
                    selectedAdminOrder.designs.map((design, dIdx) => (
                      <div key={design.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="aspect-square w-full rounded-lg bg-slate-950 overflow-hidden relative border border-slate-800">
                          <img
                            src={design.previewUrl}
                            alt={design.fileName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          
                          <a
                            href={design.previewUrl}
                            download={`Blimcast-${selectedAdminOrder.id}-Design${dIdx + 1}.${design.fileName.split('.').pop()}`}
                            className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/90 text-white hover:bg-indigo-600 rounded text-[9px] font-mono tracking-tighter uppercase transition-colors"
                          >
                            Unduh File Asli
                          </a>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase truncate" title={design.fileName}>
                            FILE #{dIdx + 1}: {design.fileName.substring(0, 15)}...
                          </p>
                          <div className="p-2.5 bg-slate-950 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-850 min-h-[50px]">
                            <span className="text-[9px] text-indigo-400 uppercase font-mono block">Instruksi Cetak:</span>
                            {design.notes || <span className="text-slate-600 italic">"Tidak ada catatan tertulis khusus."</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-start gap-2.5 max-w-lg font-sans col-span-full">
                      <span className="text-sm">🎨</span>
                      <div>
                        <span className="font-bold block mb-0.5">Opsi Kami Desainkan Aktif</span>
                        <span className="opacity-80">Pelanggan meminta bantuan desain kustom profesional dari tim Blimcast. Silakan berdiskusi via WhatsApp ({selectedAdminOrder.waNumber}) untuk bertukar konsep layout atau file logo.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-850 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="text-xs">
                  <span className="text-[9px] text-slate-500 uppercase block font-mono">Catatan Umum Pembeli:</span>
                  <p className="text-slate-300 italic">
                    "{selectedAdminOrder.notes || 'Tidak ada catatan umum.'}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Ubah Status Cepat:</span>
                  <div className="flex gap-2">
                    {['Sedang Diproses/Dicetak', 'Selesai'].map((statusOption) => (
                      <button
                        key={statusOption}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all hover:scale-105 cursor-pointer ${
                          selectedAdminOrder.status === statusOption
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                        onClick={() => handleUpdateStatusLocal(selectedAdminOrder.id, statusOption as OrderStatus)}
                      >
                        {statusOption.replace('Sedang ', '').replace('/Dicetak', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
