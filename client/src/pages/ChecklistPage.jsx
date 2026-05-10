import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import defaultChecklist from '@/data/defaultChecklist.json';
import { ArrowLeft, Plus, Check, RotateCcw, Package, X } from 'lucide-react';

const CAT_ICONS = { clothing: '👕', documents: '📄', electronics: '🔌', toiletries: '🧴', other: '📦' };

export default function ChecklistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', category: 'other' });

  useEffect(() => {
    api.get(`/trips/${id}/checklist`).then(res => {
      if (res.data.length === 0) {
        // Auto-populate with defaults
        const defaultItems = Object.entries(defaultChecklist).flatMap(([cat, names]) =>
          names.map(name => ({ itemName: name, category: cat }))
        );
        api.post(`/trips/${id}/checklist/bulk`, { items: defaultItems }).then(r => setItems(r.data)).finally(() => setLoading(false));
      } else {
        setItems(res.data);
        setLoading(false);
      }
    }).catch(() => { setLoading(false); });
  }, [id]);

  const togglePacked = async (item) => {
    try {
      const res = await api.put(`/checklist/${item.id}`, { isPacked: !item.isPacked });
      setItems(items.map(i => i.id === item.id ? res.data : i));
    } catch (err) { console.error(err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.itemName) return;
    try {
      const res = await api.post(`/trips/${id}/checklist`, newItem);
      setItems([...items, res.data]);
      setNewItem({ itemName: '', category: 'other' });
      setShowAdd(false);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/checklist/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const resetChecklist = async () => {
    try {
      await api.delete(`/trips/${id}/checklist`);
      setItems([]);
    } catch (err) { console.error(err); }
  };

  const packed = items.filter(i => i.isPacked).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;
  const grouped = Object.groupBy ? Object.groupBy(items, i => i.category) : items.reduce((g, i) => { (g[i.category] = g[i.category] || []).push(i); return g; }, {});

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl"></div>)}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Packing Checklist</h1>
          <p className="text-muted-foreground">{packed}/{total} items packed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
          <button onClick={resetChecklist} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Packing Progress</span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Categorized Items */}
      <div className="space-y-6">
        {Object.entries(grouped).sort().map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              {CAT_ICONS[category] || '📦'} {category}
            </h3>
            <div className="space-y-1">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                  <button onClick={() => togglePacked(item)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.isPacked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border hover:border-primary'}`}>
                    {item.isPacked && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.isPacked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.itemName}</span>
                  <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={addItem} className="bg-surface rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl space-y-4 animate-[scale-in_0.2s_ease-out]">
            <h3 className="font-bold text-foreground">Add Item</h3>
            <input type="text" value={newItem.itemName} onChange={e => setNewItem({ ...newItem, itemName: e.target.value })} placeholder="Item name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground" autoFocus />
            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground">
              {Object.keys(CAT_ICONS).map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
