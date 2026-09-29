import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  FlaskConical, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X,
  FileEdit,
  Pill
} from 'lucide-react';

export const CpoeOrders = () => {
  const { cpoeOrders, createCpoeOrder, fulfillCpoeOrder, setCurrentView } = useEhr();

  const quickCatalogue = [
    { name: 'Complete Blood Count (CBC) with Diff', type: 'LAB' },
    { name: 'Comprehensive Metabolic Panel (CMP)', type: 'LAB' },
    { name: 'Chest X-Ray 2 Views (PA & Lateral)', type: 'IMAGING' },
    { name: '12-Lead Electrocardiogram (ECG)', type: 'PROCEDURE' },
    { name: 'Lipid Profile & Lipid Fractions', type: 'LAB' },
    { name: 'Arterial Blood Gas (ABG)', type: 'LAB' },
  ];

  const [newOrder, setNewOrder] = useState({
    orderType: 'LAB',
    orderName: '',
    priority: 'ROUTINE',
    notes: '',
  });

  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [modalMode, setModalMode] = useState('ENTER');
  const [resultInput, setResultInput] = useState('');

  const handleSelectQuickItem = (item) => {
    setNewOrder({
      ...newOrder,
      orderName: item.name,
      orderType: item.type,
    });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!newOrder.orderName.trim()) return;

    createCpoeOrder({
      encounterId: 1001,
      patientId: 1,
      orderType: newOrder.orderType,
      orderName: newOrder.orderName,
      priority: newOrder.priority,
      notes: newOrder.notes,
    });

    setNewOrder({
      orderType: 'LAB',
      orderName: '',
      priority: 'ROUTINE',
      notes: '',
    });
  };

  const handleOpenResultEntry = (order) => {
    setActiveModalOrder(order);
    setModalMode('ENTER');
    setResultInput('WBC: 11.4 K/uL (Mild leukocytosis), RBC: 4.9 M/uL, Hemoglobin: 14.8 g/dL, Platelets: 265 K/uL. Consistent with acute viral or bronchial inflammatory response.');
  };

  const handleViewResult = (order) => {
    setActiveModalOrder(order);
    setModalMode('VIEW');
  };

  const handleSaveResult = () => {
    if (activeModalOrder && resultInput.trim()) {
      fulfillCpoeOrder(activeModalOrder.id, resultInput);
      setActiveModalOrder(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Sub-Module Navigation */}
      <div className="border-b border-slate-200 flex items-center space-x-6 text-xs sm:text-sm font-bold pb-3 no-print">
        <button 
          onClick={() => setCurrentView('encounter')}
          className="border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-2.5 flex items-center space-x-2"
        >
          <FileEdit className="w-4 h-4 text-slate-400" />
          <span>Clinical Documentation (SOAP)</span>
        </button>

        <button 
          onClick={() => setCurrentView('cpoe')}
          className="border-b-2 border-hospital-600 text-hospital-700 pb-2.5 flex items-center space-x-2"
        >
          <FlaskConical className="w-4 h-4 text-hospital-600" />
          <span>CPOE Diagnostic Orders</span>
          <span className="bg-hospital-100 text-hospital-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-black">
            {cpoeOrders.length}
          </span>
        </button>

        <button 
          onClick={() => setCurrentView('medications')}
          className="border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-2.5 flex items-center space-x-2"
        >
          <Pill className="w-4 h-4 text-slate-400" />
          <span>Medications & Prescribing</span>
          <span className="bg-hospital-100 text-hospital-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-black">
            2
          </span>
        </button>
      </div>

      {/* Main Layout: Requisition Composer + Worklist Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: CPOE Order Requisition Composer */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-hospital-600" />
              <span>CPOE Order Entry Composer</span>
            </h3>
            <p className="text-xs text-slate-400">Order Labs, Imaging, and Diagnostic Procedures</p>
          </div>

          {/* Quick Catalogue Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Quick Catalogue Select:</label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {quickCatalogue.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickItem(item)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-hospital-50 text-slate-700 hover:text-hospital-700 border border-slate-200 rounded-lg font-medium transition text-left"
                >
                  + {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleOrderSubmit} className="space-y-3.5 text-xs pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Diagnostic Category *</label>
              <select
                value={newOrder.orderType}
                onChange={(e) => setNewOrder({ ...newOrder, orderType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none bg-white font-medium"
              >
                <option value="LAB">LABORATORY (Hematology / Blood / Urine)</option>
                <option value="IMAGING">RADIOLOGY / IMAGING (X-Ray / CT / MRI)</option>
                <option value="PROCEDURE">CLINICAL PROCEDURE (ECG / Spirometry)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Order Nomenclature *</label>
              <input
                type="text"
                required
                value={newOrder.orderName}
                onChange={(e) => setNewOrder({ ...newOrder, orderName: e.target.value })}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Priority *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewOrder({ ...newOrder, priority: 'ROUTINE' })}
                  className={`py-1.5 border rounded-xl font-bold transition ${
                    newOrder.priority === 'ROUTINE'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  ROUTINE
                </button>
                <button
                  type="button"
                  onClick={() => setNewOrder({ ...newOrder, priority: 'URGENT' })}
                  className={`py-1.5 border rounded-xl font-bold transition ${
                    newOrder.priority === 'URGENT'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  URGENT
                </button>
                <button
                  type="button"
                  onClick={() => setNewOrder({ ...newOrder, priority: 'STAT' })}
                  className={`py-1.5 border rounded-xl font-bold transition flex items-center justify-center space-x-1 ${
                    newOrder.priority === 'STAT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <span>🚨 STAT</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Indication / Notes</label>
              <textarea
                rows={2}
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                placeholder="e.g. Rule out acute leukocytosis, evaluate bronchospasm..."
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Electronically Sign & Transmit Order</span>
            </button>
          </form>
        </div>

        {/* Right: Diagnostic Worklist & Tracker */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Diagnostic Orders & Fulfillment Worklist
              </h3>
              <p className="text-xs text-slate-400">Order lifecycle tracking for Encounter #1001</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border">
              Total Orders: {cpoeOrders.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Diagnostic Nomenclature</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {cpoeOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-4 font-mono font-bold text-hospital-700">
                      #{order.id}
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-slate-900">{order.orderName}</div>
                      <div className="text-[11px] text-slate-400">
                        Ordered: {order.orderedAt} by {order.orderedBy}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {order.priority === 'STAT' ? (
                        <span className="bg-rose-50 border border-rose-300 text-rose-700 font-black px-2.5 py-1 rounded text-[11px] inline-flex items-center space-x-1 animate-pulse">
                          <span>🚨 STAT</span>
                        </span>
                      ) : order.priority === 'URGENT' ? (
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          URGENT
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded text-[11px]">
                          ROUTINE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {order.status === 'PENDING' ? (
                        <span className="bg-sky-50 text-hospital-700 font-bold px-2.5 py-1 rounded-full text-[11px] border border-sky-200 inline-flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-hospital-600" />
                          <span>PENDING</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-200 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>COMPLETED</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {order.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenResultEntry(order)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                        >
                          Enter Result
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewResult(order)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition shadow-sm"
                        >
                          View Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Result Entry or Findings View Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {modalMode === 'ENTER' ? 'Document Diagnostic Result' : 'Official Diagnostic Findings'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Order #{activeModalOrder.id} • {activeModalOrder.orderName}
                </p>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'ENTER' ? (
              <div className="space-y-3.5 text-xs">
                <label className="block font-bold text-slate-700">
                  Quantitative Findings & Diagnostic Narrative *
                </label>
                <textarea
                  rows={5}
                  value={resultInput}
                  onChange={(e) => setResultInput(e.target.value)}
                  placeholder="Document laboratory values, reference ranges, and diagnostic impression..."
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium leading-relaxed"
                />

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => setActiveModalOrder(null)}
                    className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResult}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                  >
                    Publish Official Result
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Radiology / Lab Narrative Impression:
                  </span>
                  <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {activeModalOrder.resultValue}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Ordered at {activeModalOrder.orderedAt}</span>
                  <span>Fulfilled at {activeModalOrder.completedAt}</span>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <button
                    onClick={() => setActiveModalOrder(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
