import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '@/lib/api';
import { ArrowLeft, Plus, DollarSign, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];
const CATEGORIES = ['transport', 'stay', 'activities', 'meals'];
const CAT_LABELS = { transport: '✈️ Transport', stay: '🏨 Accommodation', activities: '🎭 Activities', meals: '🍽️ Meals' };

export default function BudgetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'transport', estimatedCost: 0, actualCost: 0, notes: '' });

  useEffect(() => {
    Promise.all([api.get(`/trips/${id}`), api.get(`/trips/${id}/budget`)])
      .then(([tripRes, budgetRes]) => { setTrip(tripRes.data); setItems(budgetRes.data); })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/trips/${id}/budget`, form);
      setItems([...items, res.data]);
      setForm({ category: 'transport', estimatedCost: 0, actualCost: 0, notes: '' });
      setShowForm(false);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/budget/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const totalEstimated = items.reduce((s, i) => s + i.estimatedCost, 0);
  const totalActual = items.reduce((s, i) => s + i.actualCost, 0);
  const overBudget = totalActual > totalEstimated;

  const pieData = CATEGORIES.map(cat => ({
    name: CAT_LABELS[cat] || cat,
    value: items.filter(i => i.category === cat).reduce((s, i) => s + i.actualCost, 0),
  })).filter(d => d.value > 0);

  const barData = CATEGORIES.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    Estimated: items.filter(i => i.category === cat).reduce((s, i) => s + i.estimatedCost, 0),
    Actual: items.filter(i => i.category === cat).reduce((s, i) => s + i.actualCost, 0),
  }));

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Budget & Costs</h1>
          <p className="text-muted-foreground">{trip?.name}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <DollarSign className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">${totalEstimated.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Estimated Budget</p>
        </div>
        <div className={`p-5 rounded-2xl border ${overBudget ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' : 'bg-surface border-border'}`}>
          <TrendingUp className={`w-6 h-6 mb-2 ${overBudget ? 'text-red-500' : 'text-accent'}`} />
          <p className="text-2xl font-bold text-foreground">${totalActual.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Actual Spend</p>
          {overBudget && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Over budget by ${(totalActual - totalEstimated).toLocaleString()}</p>}
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">${Math.max(0, totalEstimated - totalActual).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Remaining</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: $${value}`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-16">No spending data yet</p>}
        </div>
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h3 className="font-semibold text-foreground mb-4">Estimated vs Actual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Legend />
              <Bar dataKey="Estimated" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Estimated</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actual</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notes</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-sm font-medium text-foreground">{CAT_LABELS[item.category] || item.category}</td>
                <td className="p-4 text-sm text-right text-muted-foreground">${item.estimatedCost}</td>
                <td className={`p-4 text-sm text-right font-medium ${item.actualCost > item.estimatedCost ? 'text-red-500' : 'text-foreground'}`}>${item.actualCost}</td>
                <td className="p-4 text-sm text-muted-foreground">{item.notes || '—'}</td>
                <td className="p-4">
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={addItem} className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl space-y-4 animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-foreground">Add Budget Item</h3>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Estimated</label>
                <input type="number" value={form.estimatedCost} onChange={e => setForm({ ...form, estimatedCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Actual</label>
                <input type="number" value={form.actualCost} onChange={e => setForm({ ...form, actualCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground" />
              </div>
            </div>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground" />
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-border text-foreground">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
